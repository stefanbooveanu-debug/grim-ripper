import { FormEvent, useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  longestAccessRequestUrl,
  openAccessRequestCompose,
  validateComposeUrlLength,
} from '../lib/accessMailto';
import '../components/shared.css';
import './AuthPage.css';

const COMPANY_EMAIL =
  import.meta.env.VITE_COMPANY_EMAIL ?? 'grimrip.accesreq@protonmail.com';
const AUTH_STEP_STORAGE_KEY = 'grim-dropper-auth-step';

type AuthStep = 'request' | 'login';

export function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState<AuthStep>('request');
  const [requestEmail, setRequestEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const formId = useId();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(AUTH_STEP_STORAGE_KEY);
      if (saved === 'login' || saved === 'request') {
        setStep(saved);
      }
    } catch {
      // Ignore storage access issues in restricted contexts.
    }
  }, []);

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 480);
  };

  const handleRequestSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = requestEmail.trim();
    const trimmedPurpose = purpose.trim();

    if (!trimmedEmail.includes('@')) {
      fail('Enter a valid email address.');
      return;
    }
    if (trimmedPurpose.length < 10) {
      fail('Please describe your purpose (at least 10 characters).');
      return;
    }

    const composeUrl = longestAccessRequestUrl({
      companyEmail: COMPANY_EMAIL,
      requesterEmail: trimmedEmail,
      purpose: trimmedPurpose,
    });
    const lenCheck = validateComposeUrlLength(composeUrl);
    if (!lenCheck.ok) {
      fail(lenCheck.message);
      return;
    }

    const opened = openAccessRequestCompose({
      companyEmail: COMPANY_EMAIL,
      requesterEmail: trimmedEmail,
      purpose: trimmedPurpose,
    });
    if (!opened.ok) {
      fail(opened.message);
      return;
    }

    setLoginEmail(trimmedEmail);
    setPassword('');
    setStep('login');
    try {
      window.localStorage.setItem(AUTH_STEP_STORAGE_KEY, 'login');
    } catch {
      // Ignore storage access issues in restricted contexts.
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = loginEmail.trim();
    if (!trimmedEmail.includes('@')) {
      fail('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      fail('Password needs at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(trimmedEmail, password);
      if (!res.ok) fail(res.error);
      else navigate('/');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`auth-page ${mounted ? 'auth-page--in' : ''}`}>
      <aside className="auth-brand" aria-hidden="false">
        <div className="auth-brand-inner">
          <p className="auth-brand-kicker">Red team · access controlled</p>
          <h1 className="auth-brand-title">
            Grim
            <br />
            Dropper
          </h1>
          <p className="auth-brand-tagline">
            After we approve your request, use your email and the generated password from our team
            to enter the console.
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <div className={`auth-card ${shake ? 'auth-card--shake' : ''}`}>
          <div className="auth-stepper" aria-label="Access flow">
            <span className={`auth-step ${step === 'request' ? 'active' : ''}`}>1. Request</span>
            <span className={`auth-step ${step === 'login' ? 'active' : ''}`}>2. Login</span>
          </div>

          {step === 'request' ? (
            <>
              <h2 className="auth-card-heading">Request access</h2>
              <p className="auth-card-lead">
                Send your request first. Right after you send it, the login form will open so you
                can sign in once your generated password is issued.
              </p>

              <form id={formId} className="auth-form" onSubmit={handleRequestSubmit} noValidate>
                <div className="auth-form-fields">
                  <label className="auth-field auth-field--delay-1">
                    <span>Email</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </label>

                  <label className="auth-field auth-field--delay-2">
                    <span>Purpose</span>
                    <textarea
                      className="auth-textarea"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Company name, role, and how you plan to use the platform…"
                      rows={5}
                      required
                    />
                  </label>
                </div>

                {error && (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                )}

                <button type="submit" className="btn btn-primary auth-submit">
                  <span className="auth-submit-label">Send request</span>
                </button>

                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={() => {
                    setStep('login');
                    setLoginEmail(requestEmail.trim());
                    setPassword('');
                    setError('');
                    try {
                      window.localStorage.setItem(AUTH_STEP_STORAGE_KEY, 'login');
                    } catch {
                      // Ignore storage access issues in restricted contexts.
                    }
                  }}
                >
                  Already approved? Go to login
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="auth-card-heading">Log in</h2>
              <p className="auth-card-lead">
                Request sent. After approval, enter your email and generated password from our
                security team.
              </p>

              <form id={formId} className="auth-form" onSubmit={handleLoginSubmit} noValidate>
                <div className="auth-form-fields">
                  <label className="auth-field auth-field--delay-1">
                    <span>Email</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </label>

                  <label className="auth-field auth-field--delay-2">
                    <span>Password</span>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Generated password"
                      required
                    />
                  </label>
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
                    {submitting ? 'Logging in...' : 'Log in'}
                  </span>
                </button>

                <button
                  type="button"
                  className="btn auth-submit"
                  onClick={() => {
                    setStep('request');
                    setPassword('');
                    setError('');
                    try {
                      window.localStorage.setItem(AUTH_STEP_STORAGE_KEY, 'request');
                    } catch {
                      // Ignore storage access issues in restricted contexts.
                    }
                  }}
                >
                  Back to request
                </button>

                <button
                  type="button"
                  className="auth-inline-link"
                  onClick={() => {
                    setStep('request');
                    setError('');
                    try {
                      window.localStorage.setItem(AUTH_STEP_STORAGE_KEY, 'request');
                    } catch {
                      // Ignore storage access issues in restricted contexts.
                    }
                  }}
                >
                  Need to submit a new request?
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
