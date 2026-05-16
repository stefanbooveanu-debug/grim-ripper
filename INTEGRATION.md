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

## Auth v1 (decided)

**Option B — request access first, full login later**

| Layer | v1 behavior |
|-------|-------------|
| **UI** (`AuthPage`) | Request access (email + purpose). No login/signup form. |
| **Friend’s backend** | Implement **pipeline + logs + health** first. Keep `POST /api/auth/*` matching the contract when you add Supabase; do not change React auth until Stefan switches the UI. |
| **Contract** | `login` / `signup` / `session` stay documented for v2; optional in v1 implementation. |

When moving to **Option A** (login/session in UI), update the contract and `client.ts` together in one PR — never only one side.

## Friend checklist (Copilot)

1. Branch: `feature/backend`
2. Work only in `/backend` at repo root
3. Match every route in `frontend-stefan/docs/api-contract.md`
4. CORS: `http://127.0.0.1:5173`, `http://localhost:5173`
5. Run on port `8080` (or tell Stefan to change `VITE_API_URL`)

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
