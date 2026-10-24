from pathlib import Path
import io, sqlite3
import pandas as pd
import plotly.express as px
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.config import settings
from core.network import connectivity
from llm.client import create_llm_client, LLMUnavailable
from ingestion.load import SUPPORTED_EXTENSIONS, load_files, sanitize
from profiling.profile import profile
from persistence.store import new_id, folder, save_metadata, load_all
from dashboard.explorer import slicers, filter_data
from verification.smart import smart_ask
from speech.transcribe import transcribe, WhisperModel

app = FastAPI(title='QueryPilot AI')
app.add_middleware(CORSMiddleware, allow_origins=list(settings.cors_origins), allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
datasets = {x['id']:x for x in load_all()}
history=[]

class DashboardRequest(BaseModel): selection: dict[str, list[str]] = {}
class AskRequest(BaseModel): question: str; history: list[dict] = []

def get_dataset(dataset_id):
    item = datasets.get(dataset_id)
    if not item: raise HTTPException(404, 'Dataset not found')
    return item
def dataframe(item):
    with sqlite3.connect(item['sqlite_path']) as con: return pd.read_sql_query(f'SELECT * FROM "{item["table"]}"', con)
def register(df, name):
    ident, p, table = new_id(), None, 'data'
    p = folder(ident); db = str(p/'working.sqlite')
    with sqlite3.connect(db) as con: df.to_sql(table, con, index=False, if_exists='replace')
    item={'id':ident,'name':name,'table':table,'sqlite_path':db,'columns':df.columns.astype(str).tolist(),'profile':profile(df)}
    datasets[ident]=item; save_metadata(item); return item

@app.get('/api/health')
def health():
    llm = create_llm_client()
    try: model, mode = llm.choose(); available=True
    except LLMUnavailable: model, mode, available = None, ('online' if connectivity.online() else 'offline'), False
    return {'ok':True,'provider':llm.provider,'available':available,'ollama':llm.provider == 'ollama' and available,'active_model':model,'mode':mode,'online':connectivity.online(),'voice_available':WhisperModel is not None}

@app.post('/api/datasets')
def upload(files: list[UploadFile] = File(...)):
    uploads = [(f.filename, io.BytesIO(f.file.read())) for f in files if f.filename and Path(f.filename).suffix.lower() in SUPPORTED_EXTENSIONS]
    if not uploads: raise HTTPException(400, 'Upload at least one CSV or Excel file (.csv, .xlsx, .xlsm, or .xls).')
    try:
        item=register(load_files(uploads), sanitize(uploads[0][0]))
        return item
    except Exception as e: raise HTTPException(400, f'Could not parse the uploaded file: {e}')

@app.post('/api/datasets/demo/{kind}')
def demo(kind: str):
    if kind == 'sales': df=pd.DataFrame({'Region':['North','South','East','West']*3,'Category':['Hardware','Software','Services']*4,'Sales':[120,180,90,150,220,130,110,210,80,170,195,140],'Month':['Jan','Feb','Mar']*4})
    elif kind == 'school': df=pd.DataFrame({'Student':['Asha','Ravi','Meera','Kabir','Aman'],'Class':['10A','10A','10B','10B','10A'],'Subject':['Math','Science','Math','English','Science'],'Score':[88,74,91,82,68]})
    else: raise HTTPException(404,'Demo must be sales or school')
    return register(df, f'{kind}-demo.csv')

@app.get('/api/datasets/{dataset_id}')
def dataset(dataset_id: str): return get_dataset(dataset_id)
@app.get('/api/datasets/{dataset_id}/slicers')
def get_slicers(dataset_id: str): return slicers(dataframe(get_dataset(dataset_id)))
@app.post('/api/datasets/{dataset_id}/dashboard')
def dashboard(dataset_id: str, request: DashboardRequest):
    df=filter_data(dataframe(get_dataset(dataset_id)), request.selection); numeric=df.select_dtypes(include='number').columns.tolist(); figures=[]
    if numeric:
        figures.append(px.histogram(df,x=numeric[0],title=f'{numeric[0]} distribution').to_json())
        if len(numeric)>1: figures.append(px.scatter(df,x=numeric[0],y=numeric[1],title=f'{numeric[0]} vs {numeric[1]}').to_json())
    elif len(df.columns): figures.append(px.bar(df.groupby(df.columns[0]).size().reset_index(name='Count'),x=df.columns[0],y='Count',title='Records by category').to_json())
    return {'kpis':{'rows':len(df),'columns':len(df.columns),'missing':int(df.isna().sum().sum())},'figures':figures,'table':df.head(500).fillna('').to_dict(orient='records'),'columns':df.columns.tolist()}
@app.post('/api/datasets/{dataset_id}/ask')
def ask(dataset_id: str, request: AskRequest):
    item=get_dataset(dataset_id); result=smart_ask(request.question,item,request.history,create_llm_client()); history.append({'dataset_id':dataset_id,'question':request.question,'status':result['status'],'model_used':result.get('model_used')}); return result
@app.get('/api/datasets/{dataset_id}/table/{name}')
def table(dataset_id: str, name: str, page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=500)):
    item=get_dataset(dataset_id)
    if name != item['table']: raise HTTPException(404,'Table not found')
    df=dataframe(item); total=len(df); pages=(total + page_size - 1) // page_size
    current_page=min(page, pages) if pages else 1
    start=(current_page - 1) * page_size
    rows=df.iloc[start:start + page_size].fillna('').to_dict(orient='records')
    return {'columns':df.columns.tolist(),'rows':rows,'total':total,'page':current_page,'page_size':page_size,'pages':pages}
@app.post('/api/transcribe')
def voice(audio: UploadFile = File(...)):
    try: return {'text':transcribe(audio.file.read())}
    except Exception as e: raise HTTPException(503,str(e))
@app.get('/api/history')
def get_history(): return history[-100:]
app.mount('/', StaticFiles(directory='static/dist', html=True), name='static')
