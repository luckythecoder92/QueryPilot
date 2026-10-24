from pathlib import Path
import json, uuid
ROOT = Path(__file__).resolve().parents[1] / 'data' / 'datasets'; ROOT.mkdir(parents=True, exist_ok=True)
def new_id(): return uuid.uuid4().hex
def folder(dataset_id): p=ROOT/dataset_id; p.mkdir(parents=True, exist_ok=True); return p
def save_metadata(data): (folder(data['id'])/'metadata.json').write_text(json.dumps(data, default=str))
def load_all():
    result=[]
    for f in ROOT.glob('*/metadata.json'):
        try: result.append(json.loads(f.read_text()))
        except Exception: pass
    return result
