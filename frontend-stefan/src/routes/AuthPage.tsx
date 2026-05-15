import { FormEvent, useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isApiConfigured } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import '../components/shared.css';
import './AuthPage.css';

type Mode = 'login' | 'signup';

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const formId = useId();
  const apiMode = isApiConfigured();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setError('');
    setMode(next);
  };

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 480);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (mode === 'signup') {
      if (password !== confirm) {
        fail('Passwords do not match.');
        setSubmitting(false);
        return;
      }
      const result = await register(name, email, password);
      if (!result.ok) {
        fail(result.error);
        setSubmitting(false);
        return;
      }
    } else {
      const result = await login(email, password);
      if (!result.ok) {
        fail(result.error);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    navigate(from, { replace: true });
  };

  return (
    <div className={`auth-page ${mounted ? 'auth-page--in' : ''}`}>
      <aside className="auth-brand" aria-hidden="false">
        <div className="auth-brand-inner">
          <p className="auth-brand-kicker">Red team · {apiMode ? 'Python API' : 'demo mode'}</p>
          <h1 className="auth-brand-title">
            Grim
            <br />
            Dropper
          </h1>
          <p className="auth-brand-line">
            <span className="auth-cursor" />
            payloads that survive the first scan_
          </p>
          <ul className="auth-brand-notes">
            <li style={{ animationDelay: '0.55s' }}>
              {apiMode
                ? 'Auth via Python → Supabase on localhost:8080'
                : 'Set VITE_API_URL for Python backend'}
            </li>
            <li style={{ animationDelay: '0.68s' }}>Credentials stored as token in sessionStorage</li>
          </ul>
        </div>
        <div className="auth-scanline" />
      </aside>

      <main className="auth-main">
        <div className={`auth-card ${shake ? 'auth-card--shake' : ''}`}>
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={mode === 'login' ? 'is-active' : ''}
              onClick={() => switchMode('login')}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              className={mode === 'signup' ? 'is-active' : ''}
              onClick={() => switchMode('signup')}
            >
              Sign up
            </button>
            <span
              className="auth-tabs-indicator"
              style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
            />
          </div>

          <form id={formId} className="auth-form" onSubmit={handleSubmit} noValidate>
            <div key={mode} className="auth-form-fields">
              {mode === 'signup' && (
                <label className="auth-field auth-field--delay-1">
                  <span>Name</span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Operator handle"
                  />
                </label>
              )}

              <label
                className={`auth-field ${mode === 'login' ? 'auth-field--delay-1' : 'auth-field--delay-2'}`}
              >
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@unit.local"
                />
              </label>

              <label
                className={`auth-field ${mode === 'login' ? 'auth-field--delay-2' : 'auth-field--delay-3'}`}
              >
                <span>Password</span>
                <input
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>

              {mode === 'signup' && (
                <label className="auth-field auth-field--delay-4">
                  <span>Confirm</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="repeat password"
                  />
                </label>
              )}
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={`btn btn-primary auth-submit ${submitting ? 'auth-submit--busy' : ''}`}
              disabled={submitting}
            >
              <span className="auth-submit-label">
                {mode === 'login' ? 'Enter console' : 'Create account'}
              </span>
            </button>
          </form>

          <p className="auth-foot">
            {mode === 'login' ? (
              <>
                New here?{' '}
                <button type="button" className="auth-link" onClick={() => switchMode('signup')}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already in?{' '}
                <button type="button" className="auth-link" onClick={() => switchMode('login')}>
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}