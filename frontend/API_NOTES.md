# API notes

Generated from the live `http://localhost:8000/openapi.json` on 2026-10-25.

| Endpoint | Actual contract used |
|---|---|
| `GET /api/health` | `{ok, provider, available, ollama, active_model, mode, online, voice_available}` |
| `POST /api/datasets` | multipart `files`; accepts CSV and Excel files (`.csv`, `.xlsx`, `.xlsm`, `.xls`); returns dataset metadata |
| `POST /api/datasets/demo/{kind}` | `sales` or `school`; returns dataset metadata |
| `GET /api/datasets/{id}` | Dataset metadata |
| `GET /api/datasets/{id}/slicers` | Object of string-array values |
| `POST /api/datasets/{id}/dashboard` | `{kpis: object, figures: string[], table: rows[], columns: string[]}` |
| `POST /api/datasets/{id}/ask` | `{status, answer, proof, sql, table?, chart?, model_used?, mode?}` |
| `GET /api/datasets/{id}/table/{name}?page=1&page_size=50` | `{columns, rows, total, page, page_size, pages}` |
| `POST /api/transcribe` | multipart `audio`; `{text}` |
| `GET /api/history` | In-memory history rows `{dataset_id, question, status, model_used?}` |

Differences from expected: no `GET /api/datasets`, no dataset delete, no XLSX upload, no health `setup_hint`/installed-model collection, no dashboard chart objects or assumptions, no ask `engine`/reasons/columns/rows, and no history time/SQL/duration. The UI hides unavailable controls and uses the fields actually returned.
