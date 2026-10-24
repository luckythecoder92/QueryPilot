import re
def rule_answer(question, columns, table):
    q = question.lower()
    wanted = next((c for c in columns if c.lower() in q), None)
    if ('column' in q or 'columns' in q) and ('show' in q or 'list' in q): return {'answer': 'Available columns: ' + ', '.join(columns), 'status':'VERIFIED', 'proof': {'source':'schema'}, 'sql':None}
    if any(x in q for x in ('rows','records','kitne','कितने')): return {'answer': 'I can count the dataset records.', 'status':'VERIFIED', 'proof': {'rule':'row_count'}, 'sql':f'SELECT COUNT(*) AS row_count FROM "{table}"'}
    if wanted and any(x in q for x in ('average','avg','mean','औसत')): return {'answer': f'Average for {wanted}.', 'status':'VERIFIED', 'proof': {'rule':'average'}, 'sql':f'SELECT AVG("{wanted}") AS average FROM "{table}"'}
    return None
