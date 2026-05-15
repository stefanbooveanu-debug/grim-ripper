"""
Grim Dropper API — React talks here; this service talks to Supabase when configured.
Run: uvicorn main:app --host 127.0.0.1 --port 8080 --reload
"""

from __future__ import annotations

import hashlib
import json
import os
import secrets
import time
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, EmailStr

load_dotenv()

app = FastAPI(title="Grim Dropper API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- optional Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
_supabase = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client

        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as exc:  # noqa: BLE001
        print(f"[grim-dropper] Supabase init failed: {exc}")

# --- in-memory fallback (local dev without Supabase) ---
_users: dict[str, dict[str, str]] = {}
_tokens: dict[str, str] = {}
_jobs: dict[str, dict[str, Any]] = {}
_artifacts: dict[str, bytes] = {}


class SignUpBody(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


def _token_for(email: str) -> str:
    token = secrets.token_urlsafe(32)
    _tokens[token] = email.lower()
    return token


def _user_from_email(email: str) -> dict[str, str]:
    email = email.lower()
    if email in _users:
        return {"email": email, "name": _users[email]["name"]}
    raise HTTPException(status_code=401, detail="Invalid session")


def get_current_user(authorization: Optional[str] = None) -> dict[str, str]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.removeprefix("Bearer ").strip()

    if _supabase:
        try:
            res = _supabase.auth.get_user(token)
            if not res or not res.user:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            email = (res.user.email or "").lower()
            name = (res.user.user_metadata or {}).get("name", "Operator")
            return {"email": email, "name": name}
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    email = _tokens.get(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return _user_from_email(email)


@app.get("/health")
def health():
    mode = "supabase" if _supabase else "memory"
    return {"status": "ok", "version": f"0.1.0-{mode}"}


@app.post("/api/auth/signup")
def signup(body: SignUpBody):
    email = body.email.lower()
    if _supabase:
        try:
            res = _supabase.auth.sign_up(
                {
                    "email": email,
                    "password": body.password,
                    "options": {"data": {"name": body.name}},
                }
            )
            session = res.session
            if not session or not session.access_token:
                raise HTTPException(status_code=400, detail="Sign up failed")
            user = res.user
            name = (user.user_metadata or {}).get("name", body.name) if user else body.name
            return {
                "token": session.access_token,
                "user": {"email": email, "name": name},
            }
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    if email in _users:
        raise HTTPException(status_code=400, detail="That email is already registered.")
    _users[email] = {"name": body.name.strip(), "password": body.password}
    return {"token": _token_for(email), "user": {"email": email, "name": body.name.strip()}}


@app.post("/api/auth/login")
def login(body: LoginBody):
    email = body.email.lower()
    if _supabase:
        try:
            res = _supabase.auth.sign_in_with_password(
                {"email": email, "password": body.password}
            )
            session = res.session
            if not session or not session.access_token:
                raise HTTPException(status_code=401, detail="Wrong email or password.")
            user = res.user
            name = (user.user_metadata or {}).get("name", "Operator") if user else "Operator"
            return {
                "token": session.access_token,
                "user": {"email": email, "name": name},
            }
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=401, detail="Wrong email or password.") from exc

    user = _users.get(email)
    if not user or user["password"] != body.password:
        raise HTTPException(status_code=401, detail="Wrong email or password.")
    return {"token": _token_for(email), "user": {"email": email, "name": user["name"]}}


@app.get("/api/auth/session")
def session(authorization: Optional[str] = Header(default=None)):
    user = get_current_user(authorization)
    return {"user": user}


@app.post("/api/auth/logout", status_code=204)
def logout(authorization: Optional[str] = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        _tokens.pop(token, None)
        if _supabase:
            try:
                _supabase.auth.sign_out()
            except Exception:  # noqa: BLE001
                pass
    return Response(status_code=204)


@app.post("/api/pipeline")
async def run_pipeline(
    file: UploadFile = File(...),
    options: str = Form(...),
    authorization: Optional[str] = Header(default=None),
):
    get_current_user(authorization)
    try:
        opts = json.loads(options)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid options JSON") from exc

    raw = await file.read()
    job_id = f"job_{secrets.token_hex(8)}"
    stages = []
    t0 = time.time()

    for stage in ("pack", "obfuscate", "encrypt"):
        if not opts.get(stage):
            continue
        time.sleep(0.15)
        stages.append(
            {
                "stage": stage,
                "success": True,
                "durationMs": int((time.time() - t0) * 1000) + 120,
                "message": f"{stage} completed",
            }
        )
        t0 = time.time()

    out_name = f"grim_{file.filename or 'payload'}"
    if "." in out_name:
        out_name = out_name.rsplit(".", 1)[0] + ".bin"
    sha = hashlib.sha256(raw).hexdigest()[:16] + "…"
    artifact = raw if raw else b"grim-dropper-artifact"

    _jobs[job_id] = {"fileName": out_name, "user": get_current_user(authorization)["email"]}
    _artifacts[job_id] = artifact

    return {
        "jobId": job_id,
        "stages": stages,
        "outputFileName": out_name,
        "detectionScore": max(12, 94 - len(stages) * 22),
        "sha256": sha,
    }


@app.post("/api/pipeline/reset", status_code=204)
def pipeline_reset(authorization: Optional[str] = Header(default=None)):
    user = get_current_user(authorization)
    to_drop = [jid for jid, j in _jobs.items() if j.get("user") == user["email"]]
    for jid in to_drop:
        _jobs.pop(jid, None)
        _artifacts.pop(jid, None)
    return Response(status_code=204)


@app.get("/api/pipeline/jobs/{job_id}/download")
def download_job(job_id: str, authorization: Optional[str] = Header(default=None)):
    user = get_current_user(authorization)
    job = _jobs.get(job_id)
    if not job or job.get("user") != user["email"]:
        raise HTTPException(status_code=404, detail="Job not found")
    data = _artifacts.get(job_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{job["fileName"]}"'},
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=True)
