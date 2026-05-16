import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchSession, isApiConfigured, logIn, logOut, signUp } from '../api/client';
import { parseApiError } from '../api/errors';
import type { UserProfile } from '../api/types';
import { clearDownloadDeadline } from '../lib/downloadWindowStorage';
import { clearLegacyAuth, getStoredSession, setStoredSession } from './storage';

interface AuthContextValue {
  session: UserProfile | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    clearLegacyAuth();
    const stored = getStoredSession();

    if (!stored) {
      setIsReady(true);
      return;
    }

    if (!isApiConfigured()) {
      setSessionState(stored.user);
      setIsReady(true);
      return;
    }

    fetchSession()
      .then((res) => {
        setSessionState(res.user);
        setStoredSession({ token: stored.token, user: res.user });
      })
      .catch(() => {
        setStoredSession(null);
        setSessionState(null);
        clearDownloadDeadline();
      })
      .finally(() => setIsReady(true));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await logIn({ email, password });
      setStoredSession({ token: res.token, user: res.user });
      setSessionState(res.user);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: parseApiError(err) };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!name.trim()) return { ok: false as const, error: 'Name is required.' };
    if (!email.trim().includes('@')) return { ok: false as const, error: 'Enter a valid email.' };
    if (password.length < 6) {
      return { ok: false as const, error: 'Password needs at least 6 characters.' };
    }

    try {
      const res = await signUp({ name: name.trim(), email, password });
      setStoredSession({ token: res.token, user: res.user });
      setSessionState(res.user);
      return { ok: true as const };
    } catch (err) {
      return { ok: false as const, error: parseApiError(err) };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logOut();
    } catch {
      /* clear local session even if API fails */
    }
    setStoredSession(null);
    setSessionState(null);
    clearDownloadDeadline();
  }, []);

  const value = useMemo(
    () => ({ session, isReady, login, register, logout }),
    [session, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
