import { useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ensureDownloadDeadline } from '../lib/downloadWindowStorage';
import './DownloadWindowBanner.css';

function formatHms(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export function DownloadWindowBanner() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [deadline, setDeadline] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const [requestAgainBusy, setRequestAgainBusy] = useState(false);

  useLayoutEffect(() => {
    const email = session?.email?.trim();
    if (!email) {
      setDeadline(null);
      return undefined;
    }
    setDeadline(ensureDownloadDeadline(email));
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [session?.email]);

  if (!session?.email || deadline === null) return null;

  const secondsLeft = Math.max(0, Math.floor((deadline - Date.now()) / 1000));

  const handleSubmitAnotherRequest = async () => {
    setRequestAgainBusy(true);
    try {
      await logout();
      navigate('/auth');
    } finally {
      setRequestAgainBusy(false);
    }
  };

  return (
    <div className="download-window-banner" role="region" aria-label="Approved user download window">
      <p className="download-window-disclaimer">
        After your approval, you have 1 hour to download the files. If that hour passes and you have
        not downloaded, you must submit another access request.
      </p>
      <div className="download-window-timer" aria-live="polite">
        <span className="download-window-timer-label">Time remaining</span>
        <time
          className="download-window-timer-value"
          dateTime={secondsLeft > 0 ? `PT${secondsLeft}S` : 'PT0S'}
        >
          {formatHms(secondsLeft)}
        </time>
      </div>
      {secondsLeft === 0 ? (
        <div className="download-window-expired-block" role="status">
          <p className="download-window-expired">
            The download window has ended. To continue, submit a new access request.
          </p>
          <button
            type="button"
            className="btn download-window-request-again"
            disabled={requestAgainBusy}
            onClick={handleSubmitAnotherRequest}
          >
            {requestAgainBusy ? 'Signing out…' : 'Submit another access request'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
