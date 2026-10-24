import pandas as pd
def slicers(df): return {c: sorted(df[c].dropna().astype(str).unique().tolist())[:200] for c in df.columns if df[c].nunique(dropna=True) <= 100}
def filter_data(df, selection):
    for col, values in (selection or {}).items():
        if col in df.columns and values: df = df[df[col].astype(str).isin(map(str,values))]
    return df
