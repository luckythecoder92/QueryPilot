<<<<<<< HEAD
from pathlib import Path
from typing import BinaryIO

import pandas as pd
import re


SUPPORTED_EXTENSIONS = {'.csv', '.xlsx', '.xlsm', '.xls'}


def sanitize(name): return re.sub(r'[^A-Za-z0-9_.-]', '_', name)


def sanitize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    frame = df.copy()
    used: set[str] = set()
    counts: dict[str, int] = {}
    columns: list[str] = []

    for index, value in enumerate(frame.columns, start=1):
        name = str(value).replace('\ufeff', '').strip()
        if not name or re.fullmatch(r'Unnamed:\s*\d+', name, flags=re.IGNORECASE):
            name = f'column_{index}'
        name = re.sub(r'\s+', ' ', name)
        counts[name] = counts.get(name, 0) + 1
        candidate = name if counts[name] == 1 else f'{name}_{counts[name]}'
        while candidate in used:
            counts[name] += 1
            candidate = f'{name}_{counts[name]}'
        used.add(candidate)
        columns.append(candidate)

    frame.columns = columns
    for column in frame.select_dtypes(include=['object', 'string']).columns:
        frame[column] = frame[column].map(lambda value: value.strip() if isinstance(value, str) else value)
    frame = frame.replace(r'^\s*$', pd.NA, regex=True)
    frame = frame.replace([float('inf'), float('-inf')], pd.NA)
    frame = frame.dropna(axis=0, how='all').dropna(axis=1, how='all')
    return frame.reset_index(drop=True)


def load_files(files: list[tuple[str, BinaryIO]]):
    frames = []
    for name, stream in files:
        suffix = Path(name).suffix.lower()
        if suffix == '.csv':
            frames.append(pd.read_csv(stream))
        elif suffix in {'.xlsx', '.xlsm'}:
            frames.append(pd.read_excel(stream, engine='openpyxl'))
        elif suffix == '.xls':
            frames.append(pd.read_excel(stream, engine='xlrd'))
        else:
            raise ValueError(f'Unsupported file type: {suffix or "unknown"}')
    if not frames:
        raise ValueError('No supported files were provided.')
    return sanitize_dataframe(pd.concat(frames, ignore_index=True))
=======
import pandas as pd, re
def sanitize(name): return re.sub(r'[^A-Za-z0-9_.-]', '_', name)
def load_csv(files):
    frames=[pd.read_csv(f) for f in files]; return pd.concat(frames, ignore_index=True)
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
