import json, re
SYSTEM = '''You are QueryPilot. Return only a JSON object: {"answer":"short answer", "sql":"read-only SELECT SQL or null", "chart":null}. Never invent data. If schema cannot answer, return sql null and say INSUFFICIENT DATA.'''
def parse_response(raw: str) -> dict:
    raw = re.sub(r'^\s*```(?:json)?\s*|\s*```\s*$', '', raw.strip(), flags=re.I)
    try: return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', raw, re.S)
        if not match: raise ValueError('Model did not return JSON')
        return json.loads(match.group())
