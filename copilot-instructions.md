# Copilot instructions — grim_drip

## Scope

- **Backend work:** only files under `/backend/` (repo root).
- **Frontend work:** only files under `/frontend-stefan/`.
- **Never** cross-edit: backend owner must not change `frontend-stefan/src/**`; frontend owner must not change `/backend/**` without coordination.

## API contract

Implement and maintain REST routes exactly as documented in:

`frontend-stefan/docs/api-contract.md`

Request/response shapes must match `frontend-stefan/src/api/types.ts`.

## CORS

Allow origins:

- `http://127.0.0.1:5173`
- `http://localhost:5173`

Methods: `GET`, `POST`, `OPTIONS`. Headers: `Authorization`, `Content-Type`.

## Auth v1

UI uses **request access** only. Do not remove `AuthContext` or `ProtectedRoute` from React. Backend may defer `POST /api/auth/login` until v2; prioritize pipeline and health for v1.

## Default port

API: `8080`. Frontend env: `VITE_API_URL=http://127.0.0.1:8080`.

See [INTEGRATION.md](INTEGRATION.md) for the full handoff.
