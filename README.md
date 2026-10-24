# QueryPilot AI

React/Vite frontend and FastAPI backend for private CSV exploration, dashboards, safe AI-assisted SQL, and voice queries.

## Run

1. Install local models (verify exact tags first with `ollama list`):

   `ollama pull qwen2.5-coder:7b`

   `ollama pull gemma4`

2. Backend:

   `cd backend`

   `copy .env.example .env`

   `python -m venv .venv && .venv\Scripts\activate`

   `pip install -r requirements.txt`

   `uvicorn main:app --reload`

3. Frontend:

   `cd frontend`

   `copy .env.example .env`

   `npm install`

   `npm run dev`

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

`QP_MODEL_MODE=auto` chooses Qwen when network is available and Gemma when it is not; use `online` or `offline` to force a mode. The backend verifies installed Ollama tags through `/api/tags` for each request and falls back to the other configured model. All generated SQL passes read-only validation and a SQLite authorizer.

The original Streamlit project was not included in the supplied attachment, so its exact domain-specific modules and dashboard rules could not be carried over verbatim.
