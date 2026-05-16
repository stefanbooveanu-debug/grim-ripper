# Grim Dropper Python API (legacy copy)

**Use the repo-root API instead:** [`../../backend/`](../../backend/README.md)

This folder is kept for older docs/scripts. New work and Copilot integration belong in **`/backend`** at the repo root. See [`../../INTEGRATION.md`](../../INTEGRATION.md).

Reference backend matching [`docs/api-contract.md`](../docs/api-contract.md).

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with Supabase credentials (optional)
```

## Run

```bash
uvicorn main:app --host 127.0.0.1 --port 8080 --reload
```

Without Supabase env vars, the API uses **in-memory** users and jobs (fine for local demos).

## React

In `grim-dropper/.env`:

```
VITE_API_URL=http://127.0.0.1:8080
```

Then `npm run dev` in the parent folder.
