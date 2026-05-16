# Grim Dropper API (repo root)

**Canonical backend** for `frontend-stefan/`. Implements [`../frontend-stefan/docs/api-contract.md`](../frontend-stefan/docs/api-contract.md).

Friend + Copilot: edit **only this folder**. Do not change `frontend-stefan/src/`.

See [`../INTEGRATION.md`](../INTEGRATION.md) for ownership and auth v1 (request access in UI; login endpoints for v2).

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## Run

```bash
uvicorn main:app --host 127.0.0.1 --port 8080 --reload
```

Without Supabase env vars, the API uses **in-memory** users and jobs (local demos).

## React

In `frontend-stefan/.env`:

```
VITE_API_URL=http://127.0.0.1:8080
```

Then from repo root: `npm run dev:frontend-stefan`
