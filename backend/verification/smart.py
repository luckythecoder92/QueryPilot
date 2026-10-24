import pandas as pd
from sql.rules import rule_answer
from sql.text2sql import SYSTEM, parse_response
from sql.safety import validate_sql, readonly_connection
from llm.client import LLMUnavailable

def smart_ask(question, dataset, history, llm):
    columns, table, path = dataset['columns'], dataset['table'], dataset['sqlite_path']
    response = rule_answer(question, columns, table)
    model_used = mode = None
    if response is None:
        prompt = f'Schema table {table}: {columns}. Question: {question}. History: {history[-4:]}'
        try:
            generated = llm.ask(prompt, SYSTEM); model_used, mode = generated.model_used, generated.mode
            parsed = parse_response(generated.text); sql = parsed.get('sql')
            response = {'answer':parsed.get('answer',''), 'status':'VERIFIED' if sql else 'INSUFFICIENT DATA', 'proof':{'source':'LLM verified'}, 'sql':sql, 'chart':parsed.get('chart')}
        except (LLMUnavailable, ValueError) as e:
            response = {'answer':f'NEEDS CLARIFICATION: {e}', 'status':'NEEDS CLARIFICATION', 'proof':{}, 'sql':None}
    if response.get('sql'):
        try:
            sql = validate_sql(response['sql'])
            with readonly_connection(path) as con: rows = pd.read_sql_query(sql, con).to_dict(orient='records')
            response['table'] = rows; response['proof'] = {**response.get('proof',{}), 'rows_returned':len(rows)}
        except Exception as e: response.update(status='QUERY FAILED', answer=f'Query failed safely: {e}', table=[])
    return {**response, 'model_used':model_used, 'mode':mode}
