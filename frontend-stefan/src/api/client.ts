import { getToken } from '../auth/storage';
import { readErrorFromResponse } from './errors';
import type {
  AuthResponse,
  HealthResponse,
  LoginRequest,
  PipelineOptions,
  PipelineResponse,
  SessionResponse,
  SignUpRequest,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export function isApiConfigured(): boolean {
  return Boolean(API_URL);
}

function base(path: string) {
  return `${API_URL.replace(/\/$/, '')}${path}`;
}

function authHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base(path), {
    ...init,
    headers: authHeaders(init?.headers),
  });
  if (!res.ok) {
    throw new Error(await readErrorFromResponse(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<HealthResponse> {
  if (!API_URL) {
    return { status: 'ok', version: 'demo-local' };
  }
  return request<HealthResponse>('/health');
}

export async function signUp(body: SignUpRequest): Promise<AuthResponse> {
  if (!API_URL) return mockAuth(body.email, body.name);
  return request<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function logIn(body: LoginRequest): Promise<AuthResponse> {
  if (!API_URL) return mockAuth(body.email, 'Operator');
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function logOut(): Promise<void> {
  if (!API_URL) return;
  await request<void>('/api/auth/logout', { method: 'POST' });
}

export async function fetchSession(): Promise<SessionResponse> {
  if (!API_URL) throw new Error('No API');
  return request<SessionResponse>('/api/auth/session');
}

export async function runPipeline(
  file: File,
  options: PipelineOptions,
): Promise<PipelineResponse> {
  if (!API_URL) {
    return mockPipeline(file.name, options);
  }

  const form = new FormData();
  form.append('file', file);
  form.append('options', JSON.stringify(options));

  const res = await fetch(base('/api/pipeline'), {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });

  if (!res.ok) {
    throw new Error(await readErrorFromResponse(res));
  }
  return res.json() as Promise<PipelineResponse>;
}

export async function resetPipeline(): Promise<void> {
  if (!API_URL) return;
  await request<void>('/api/pipeline/reset', { method: 'POST' });
}

export async function downloadArtifact(jobId: string, fileName: string): Promise<void> {
  if (!API_URL) {
    const blob = new Blob([`demo artifact for ${jobId}`], { type: 'application/octet-stream' });
    triggerDownload(blob, fileName);
    return;
  }

  const res = await fetch(base(`/api/pipeline/jobs/${encodeURIComponent(jobId)}/download`), {
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(await readErrorFromResponse(res));
  }

  const blob = await res.blob();
  const name =
    res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1] ?? fileName;
  triggerDownload(blob, name);
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function mockAuth(email: string, name: string): Promise<AuthResponse> {
  return Promise.resolve({
    token: `demo-${Date.now()}`,
    user: { email: email.trim().toLowerCase(), name },
  });
}

function mockPipeline(fileName: string, options: PipelineOptions): Promise<PipelineResponse> {
  const stages = (['pack', 'obfuscate', 'encrypt'] as const).filter((s) => {
    if (s === 'pack') return options.pack;
    if (s === 'obfuscate') return options.obfuscate;
    return options.encrypt;
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        jobId: `demo-${Date.now().toString(36)}`,
        stages: stages.map((stage, i) => ({
          stage,
          success: true,
          durationMs: 400 + i * 220,
          message: `${stage} completed (demo mode)`,
        })),
        outputFileName: `grim_${fileName.replace(/\.[^.]+$/, '')}.bin`,
        detectionScore: Math.max(12, 94 - stages.length * 22),
        sha256: 'a3f2' + Math.random().toString(16).slice(2, 14) + '…demo',
      });
    }, 900);
  });
}
