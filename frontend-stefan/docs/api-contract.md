# Grim Dropper API contract

React (Vite) talks to the Python API on the same machine. Python handles Supabase.

**Base URL:** `http://127.0.0.1:8080` (set `VITE_API_URL` in React `.env`)

## Auth

### Sign up

```http
POST /api/auth/signup
Content-Type: application/json

{ "name": "Operator", "email": "you@unit.local", "password": "secret12" }
```

**200**

```json
{ "token": "<jwt>", "user": { "email": "you@unit.local", "name": "Operator" } }
```

### Log in

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "you@unit.local", "password": "secret12" }
```

**200** — same shape as sign up.

### Session

```http
GET /api/auth/session
Authorization: Bearer <token>
```

**200** `{ "user": { "email", "name" } }` · **401** if invalid.

### Log out

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**204** No body.

## Pipeline

### Run pipeline

```http
POST /api/pipeline
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
options: {"pack":true,"obfuscate":true,"encrypt":true}
```

**200**

```json
{
  "jobId": "job_abc",
  "stages": [
    { "stage": "pack", "success": true, "durationMs": 420, "message": "pack completed" }
  ],
  "outputFileName": "grim_payload.bin",
  "detectionScore": 78,
  "sha256": "a3f2…"
}
```

### Reset

```http
POST /api/pipeline/reset
Authorization: Bearer <token>
```

**204**

### Download artifact

```http
GET /api/pipeline/jobs/{jobId}/download
Authorization: Bearer <token>
```

**200** `application/octet-stream` (file bytes)

## Health

```http
GET /health
```

**200** `{ "status": "ok", "version": "0.1.0" }`

## CORS (Python)

Allow `http://127.0.0.1:5173` and `http://localhost:5173`.

## Environment (Python)

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Anon key for auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, server-side writes |
| `PORT` | Default `8080` |

If Supabase env vars are missing, the reference backend in `backend/` uses in-memory storage for local dev.
