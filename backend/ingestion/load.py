import pandas as pd, re
def sanitize(name): return re.sub(r'[^A-Za-z0-9_.-]', '_', name)
def load_csv(files):
    frames=[pd.read_csv(f) for f in files]; return pd.concat(frames, ignore_index=True)
