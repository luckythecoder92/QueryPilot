def profile(df):
    return {'rows':len(df), 'columns':len(df.columns), 'missing':int(df.isna().sum().sum()), 'dtypes':{str(k):str(v) for k,v in df.dtypes.items()}}
