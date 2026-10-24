# QueryPilot AI

<<<<<<< HEAD
React/Vite frontend and FastAPI backend for private CSV/Excel exploration, dashboards, safe AI-assisted SQL, and voice queries.

## Run

1. Configure the AI provider in `backend/.env`:

   `QP_LLM_PROVIDER=auto`

   `XAI_API_KEY=your_xai_api_key`

   `XAI_MODEL=grok-4.7`

   With `auto`, QueryPilot uses Grok when `XAI_API_KEY` is present and falls back to Ollama when it is not. Set `QP_LLM_PROVIDER=grok` to require the Grok API during deployment. Keep the key in the server environment only; never put it in the frontend `.env`.

2. Optional local models (verify exact tags first with `ollama list`):
=======
React/Vite frontend and FastAPI backend for private CSV exploration, dashboards, safe AI-assisted SQL, and voice queries.

## Run

1. Install local models (verify exact tags first with `ollama list`):
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

   `ollama pull qwen2.5-coder:7b`

   `ollama pull gemma4`

<<<<<<< HEAD
3. Backend:
=======
2. Backend:
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

   `cd backend`

   `copy .env.example .env`

   `python -m venv .venv && .venv\Scripts\activate`

   `pip install -r requirements.txt`

   `uvicorn main:app --reload`

<<<<<<< HEAD
4. Frontend:
=======
3. Frontend:
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

   `cd frontend`

   `copy .env.example .env`

   `npm install`

   `npm run dev`

<<<<<<< HEAD
## Production deployment

Run the backend on the platform-provided port and bind it to all interfaces:

`python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`

Set these server-side environment variables in the deployment service:

`QP_LLM_PROVIDER=grok`

`XAI_API_KEY=your_xai_api_key`

`XAI_MODEL=grok-4.7`

`QP_CORS_ORIGINS=https://your-frontend-domain.example`

The Grok key must stay on the backend. Do not add it to `frontend/.env` or expose it to browser code.

=======
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718
Run backend tests from `backend/`:

`python -m unittest discover -s tests -t .`

## Run frontend

```powershell
cd frontend
copy .env.example .env
npm i
npm run dev
```

Use `npm run build` to create the production bundle. Set `VITE_API_URL` to the FastAPI origin when it is not `http://localhost:8000`.

## Notes

<<<<<<< HEAD
`QP_LLM_PROVIDER=auto` uses the Grok Responses API when `XAI_API_KEY` is configured and otherwise uses the existing Ollama flow. `QP_LLM_PROVIDER=grok` forces Grok; `QP_LLM_PROVIDER=ollama` forces local Ollama. Grok responses use structured JSON output so generated SQL continues through the same read-only validation and SQLite authorizer. Dataset uploads accept `.csv`, `.xlsx`, `.xlsm`, and `.xls` files; Excel uploads use the first worksheet.
=======
`QP_MODEL_MODE=auto` chooses Qwen when network is available and Gemma when it is not; use `online` or `offline` to force a mode. The backend verifies installed Ollama tags through `/api/tags` for each request and falls back to the other configured model. All generated SQL passes read-only validation and a SQLite authorizer.
>>>>>>> a0da3ece49c97577f961c16a9368d9612df32718

The original Streamlit project was not included in the supplied attachment, so its exact domain-specific modules and dashboard rules could not be carried over verbatim.
