import type { UserProfile } from '../api/types';

export interface Session {
  token: string;
  user: UserProfile;
}

const SESSION_KEY = 'grim-dropper-session';

export function getStoredSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: Session | null) {
  if (session) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function getToken(): string | null {
  return getStoredSession()?.token ?? null;
}

/** @deprecated legacy localStorage users — cleared on first API auth */
export function clearLegacyAuth() {
  localStorage.removeItem('grim-dropper-users');
  localStorage.removeItem('grim-dropper-session');
}
