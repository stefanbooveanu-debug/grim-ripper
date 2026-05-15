export type PipelineStage = 'pack' | 'obfuscate' | 'encrypt';

export interface PipelineOptions {
  pack: boolean;
  obfuscate: boolean;
  encrypt: boolean;
  encryptionKey?: string;
}

export interface StageResult {
  stage: PipelineStage;
  success: boolean;
  durationMs: number;
  message: string;
}

export interface PipelineResponse {
  jobId: string;
  stages: StageResult[];
  outputFileName: string;
  detectionScore: number;
  sha256: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  version: string;
}

export interface UserProfile {
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface SessionResponse {
  user: UserProfile;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiErrorBody {
  detail?: string;
  message?: string;
  error?: string;
}
