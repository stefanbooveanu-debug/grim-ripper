# Grim Dropper · Frontend

Red-teaming payload console for **HackTM 2026** — packing, obfuscation, and encryption pipeline UI.

**Canonical copies:** `Downloads/grim-dropper/` and `Desktop/Grim Dropper-frontend/` (same merged app). OpenCode’s original Next.js sources are in `Desktop/Grim Dropper-frontend/_opencode-next-backup/`.

## Quick start (same PC)

**Terminal 1 — Python API**

```bash
cd grim-dropper/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8080 --reload
```

**Terminal 2 — React**

```bash
cd grim-dropper
cp .env.example .env
npm install
npm run dev
```

Open http://127.0.0.1:5173/auth — sign up, then use the console.

## Architecture

```text
React (Vite)  --HTTP-->  Python (FastAPI, :8080)  --optional-->  Supabase
```

Every backend-managed button calls Python. See [`docs/api-contract.md`](docs/api-contract.md).

| Button | Endpoint |
|--------|----------|
| Log in / Sign up | `POST /api/auth/login` · `POST /api/auth/signup` |
| Log out | `POST /api/auth/logout` |
| Run pipeline | `POST /api/pipeline` (multipart file) |
| Reset | `POST /api/pipeline/reset` |
| Download artifact | `GET /api/pipeline/jobs/:id/download` |

Without `VITE_API_URL`, the UI falls back to **demo mode** (no Python required).

## Unified app (Cursor + OpenCode)

This folder combines:

- **Cursor** — auth, HackTM overview, operations console (file upload + Python pipeline), demo game, API client
- **OpenCode** (`Desktop/Grim Dropper-frontend`) — PowerShell **script builder** (paste → Base64/IEX obfuscation) and **activity logs**

Use **`grim-dropper/`** as the single source of truth; the Desktop Next.js project is superseded by these routes.

## Routes

| Path | Description |
|------|-------------|
| `/auth` | Login / sign up |
| `/` | Project overview + demo script |
| `/builder` | PowerShell script obfuscator (client-side) |
| `/console` | Payload pipeline (file upload → Python) |
| `/logs` | Shared activity log (builder + console runs) |
| `/play` | Visual canvas demo |

Press **P** to jump to the console during a pitch.

## Build

```bash
npm run build
npm run preview
```

## Your existing Python project

If you already have a Python service, implement the same routes as [`docs/api-contract.md`](docs/api-contract.md). The reference server in [`backend/`](backend/) is a drop-in for local dev and HackTM demos.
