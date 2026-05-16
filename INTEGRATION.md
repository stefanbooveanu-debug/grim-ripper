# Conflict-free integration (same repo)

## Folder ownership

| Who | Owns | Do not edit |
|-----|------|-------------|
| **Stefan** | `frontend-stefan/**` | `backend/` (repo root) |
| **Friend (+ Copilot)** | `backend/` (repo root) | `frontend-stefan/src/**`, routes, CSS, components |

The UI talks to the API only through:

- [`frontend-stefan/docs/api-contract.md`](frontend-stefan/docs/api-contract.md)
- [`frontend-stefan/src/api/client.ts`](frontend-stefan/src/api/client.ts)
- `frontend-stefan/.env` → `VITE_API_URL=http://127.0.0.1:8080`

Reference copy under `frontend-stefan/backend/` is **legacy** for local demos; the canonical API for integration is **`/backend`** at repo root.

## Auth model (active)

**Option A — login/session in frontend**

| Layer | active behavior |
|-------|-----------------|
| **UI** (`AuthPage`) | Login + sign-up form powered by backend auth endpoints. |
| **Friend’s backend** | Must implement `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` plus pipeline routes. |
| **Contract** | Auth + pipeline routes in `frontend-stefan/docs/api-contract.md` are required for integration readiness. |

Access-request mail flow remains optional and should not replace login/session without coordinated frontend + contract changes.

## Friend checklist (Copilot)

1. Branch: `feature/backend`
2. Work only in `/backend` at repo root
3. Match every route in `frontend-stefan/docs/api-contract.md` (including auth/session).
4. CORS: `http://127.0.0.1:5173`, `http://localhost:5173`
5. Run on port `8080` (or tell Stefan to change `VITE_API_URL`)
6. Verify auth flow from UI: **Sign up -> Log in -> Session -> Log out**
7. Verify pipeline flow from UI: run, reset, and artifact download

**Copilot prompt:**

> Create or extend `/backend` at the repo root. Implement routes in `frontend-stefan/docs/api-contract.md`. Do not modify `frontend-stefan/`. Enable CORS for `http://127.0.0.1:5173`.

## Run locally

```bash
# From repo root
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && cd ..
cp frontend-stefan/.env.example frontend-stefan/.env
npm install
npm run dev:api          # :8080
npm run dev:frontend-stefan   # :5173
```

Or: `npm run dev:all` (API + Vite + Next).

## Merge rules

- Separate branches until API matches contract
- Reject Copilot edits under `frontend-stefan/src/` from the backend owner
- Reject path or JSON shape changes without updating `api-contract.md` and `types.ts`
