import sqlite3

FORBIDDEN = ('insert','update','delete','drop','alter','attach','pragma','create','replace','vacuum')
def validate_sql(sql: str) -> str:
    clean = sql.strip().rstrip(';')
    if not clean.lower().startswith(('select','with')) or any(x in clean.lower() for x in FORBIDDEN): raise ValueError('Only read-only SELECT queries are allowed.')
    return clean
def readonly_connection(path: str):
    con = sqlite3.connect(f'file:{path}?mode=ro', uri=True); con.execute('PRAGMA query_only=ON'); con.set_authorizer(lambda action,*_: sqlite3.SQLITE_DENY if action in (sqlite3.SQLITE_INSERT,sqlite3.SQLITE_UPDATE,sqlite3.SQLITE_DELETE,sqlite3.SQLITE_DROP_TABLE) else sqlite3.SQLITE_OK); con.set_progress_handler(lambda: 1, 2_000_000); return con
