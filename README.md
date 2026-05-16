# grim_drip

Grim Dropper — HackTM red-teaming tool.

| Path | Description |
|------|-------------|
| *(root)* | Next.js app (existing) |
| `frontend-stefan/` | React + Vite UI — login/auth, builder, console, logs, demo game |
| `backend/` | **Canonical Python API** — friend + Copilot integrate here ([INTEGRATION.md](INTEGRATION.md)) |

## frontend-stefan

```bash
cd frontend-stefan
cp .env.example .env
npm install
npm run dev
```

Open http://127.0.0.1:5173/auth

## Run entire repo (all folders)

From the **repo root** (`grim_drip/`):

```bash
npm install
npm run setup:api
cp frontend-stefan/.env.example frontend-stefan/.env
npm run dev:all
```

| Service | Folder | URL |
|---------|--------|-----|
| Python API | `backend/` (repo root) | http://127.0.0.1:8080 |
| Grim Dropper UI | `frontend-stefan/` | http://127.0.0.1:5173/auth |
| Next.js (root) | `src/`, `public/` | http://localhost:3000 |

## Root Next.js only

```bash
npm run dev
```

Open http://localhost:3000

## Backend integration (friend + Copilot)

See [INTEGRATION.md](INTEGRATION.md) and [copilot-instructions.md](copilot-instructions.md). Friend edits **`backend/`** only; Stefan edits **`frontend-stefan/`** only.

## Friend PC quick start

```bash
git clone https://github.com/fouih/grim_drip.git
cd grim_drip
npm install
npm run setup:api
cp backend/.env.example backend/.env
cp frontend-stefan/.env.example frontend-stefan/.env
npm run dev:api
```

In a second terminal:

```bash
cd grim_drip
npm run dev:frontend-stefan
```

Open `http://127.0.0.1:5173/auth`, create an account with **Sign up**, then verify console + pipeline flows.
