# QueryPilot AI

React/Vite frontend and FastAPI backend for private CSV/Excel exploration, dashboards, safe AI-assisted SQL, and voice queries.

## Run

1. Configure the AI provider in `backend/.env`:

   `QP_LLM_PROVIDER=auto`

   `XAI_API_KEY=your_xai_api_key`

   `XAI_MODEL=grok-4.7`

   With `auto`, QueryPilot uses Grok when `XAI_API_KEY` is present and falls back to Ollama when it is not. Set `QP_LLM_PROVIDER=grok` to require the Grok API during deployment. Keep the key in the server environment only; never put it in the frontend `.env`.

2. Optional local models (verify exact tags first with `ollama list`):

   `ollama pull qwen2.5-coder:7b`

   `ollama pull gemma4`

3. Backend:

   `cd backend`

   `copy .env.example .env`

   `python -m venv .venv && .venv\Scripts\activate`

   `pip install -r requirements.txt`

   `uvicorn main:app --reload`

4. Frontend:

   `cd frontend`

   `copy .env.example .env`

   `npm install`

   `npm run dev`

## Production deployment

Run the backend on the platform-provided port and bind it to all interfaces:

`python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`

Set these server-side environment variables in the deployment service:

`QP_LLM_PROVIDER=grok`

`XAI_API_KEY=your_xai_api_key`

`XAI_MODEL=grok-4.7`

`QP_CORS_ORIGINS=https://your-frontend-domain.example`

The Grok key must stay on the backend. Do not add it to `frontend/.env` or expose it to browser code.

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

`QP_LLM_PROVIDER=auto` uses the Grok Responses API when `XAI_API_KEY` is configured and otherwise uses the existing Ollama flow. `QP_LLM_PROVIDER=grok` forces Grok; `QP_LLM_PROVIDER=ollama` forces local Ollama. Grok responses use structured JSON output so generated SQL continues through the same read-only validation and SQLite authorizer. Dataset uploads accept `.csv`, `.xlsx`, `.xlsm`, and `.xls` files; Excel uploads use the first worksheet.

The original Streamlit project was not included in the supplied attachment, so its exact domain-specific modules and dashboard rules could not be carried over verbatim.
