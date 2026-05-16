import { FormEvent, useEffect, useId, useState } from 'react';
import {
  openAccessRequestCompose,
  validateComposeUrlLength,
  longestAccessRequestUrl,
  buildAccessRequestWebComposeUrl,
  webMailLinkLabel,
  ACCESS_REQUEST_MAIL_SUBJECT,
} from '../lib/accessMailto';
import '../components/shared.css';
import './AuthPage.css';

const COMPANY_EMAIL =
  import.meta.env.VITE_COMPANY_EMAIL ?? 'grimrip.accesreq@protonmail.com';

/** Short preview of body for the success screen (full text is still sent in compose). */
function purposePreviewForDisplay(purpose: string): string {
  const t = purpose.trim();
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const longByWords = words.length > 3;
  const longByChars = t.length > 40;
  if (!longByWords && !longByChars) return t;
  const head = words.slice(0, 3).join(' ');
  return `${head} …`;
}

function WebMailOptionalLink(props: {
  companyEmail: string;
  requesterEmail: string;
  purpose: string;
}) {
  const web = buildAccessRequestWebComposeUrl({
    companyEmail: props.companyEmail,
    requesterEmail: props.requesterEmail,
    purpose: props.purpose,
  });
  if (!web) return null;

  return (
    <>
      <p className="auth-browser-hint">
        Your default mail app opens first with prefilled details. If no draft appears, use the
        button below to open a prefilled webmail compose window.
      </p>
      <a
        className="btn btn-secondary auth-web-compose-btn"
        href={web.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {webMailLinkLabel(web.provider)}
      </a>
    </>
  );
}

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  const formId = useId();

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const fail = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 480);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
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

    setSubmitting(true);
    try {
      const opened = openAccessRequestCompose({
        companyEmail: COMPANY_EMAIL,
        requesterEmail: trimmedEmail,
        purpose: trimmedPurpose,
      });
      if (!opened.ok) {
        fail(opened.message);
        return;
      }
      setSubmitted(true);
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
            Request access for your user or company. We review each application before granting
            console access.
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <div className={`auth-card ${shake ? 'auth-card--shake' : ''}`}>
          {submitted ? (
            <div className="auth-success">
              <h2 className="auth-card-heading">Check your mail app</h2>
              <p className="auth-success-text">
                Your default mail app should have opened with the following prefilled. Send the
                message to complete your request. We will contact you at <strong>{email}</strong>{' '}
                after review. Once your access is approved and you sign in, a one-hour download
                window will appear in the console.
              </p>
              <ul className="auth-compose-list" aria-label="Prefilled email fields">
                <li>
                  <span className="auth-compose-term">To:</span>{' '}
                  <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
                </li>
                <li>
                  <span className="auth-compose-term">Subject:</span> {ACCESS_REQUEST_MAIL_SUBJECT}
                </li>
                <li>
                  <span className="auth-compose-term">Body:</span>{' '}
                  <span className="auth-compose-body-preview">{purposePreviewForDisplay(purpose)}</span>
                </li>
              </ul>

              <WebMailOptionalLink
                companyEmail={COMPANY_EMAIL}
                requesterEmail={email.trim()}
                purpose={purpose.trim()}
              />

              <button
                type="button"
                className="btn auth-submit"
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setPurpose('');
                }}
              >
                Submit another request
              </button>
            </div>
          ) : (
            <>
              <h2 className="auth-card-heading">Request access</h2>
              <p className="auth-card-lead">
                Tell us who you are and why you need Grim Dropper. Access is granted after
                approval.
              </p>

              <form id={formId} className="auth-form" onSubmit={handleSubmit} noValidate>
                <div className="auth-form-fields">
                  <label className="auth-field auth-field--delay-1">
                    <span>Email</span>
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

                <button
                  type="submit"
                  className={`btn btn-primary auth-submit ${submitting ? 'auth-submit--busy' : ''}`}
                  disabled={submitting}
                >
                  <span className="auth-submit-label">Request access</span>
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
