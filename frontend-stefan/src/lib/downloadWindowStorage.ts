const STORAGE_KEY = 'grim_dropper_download_deadline_v1';

export type DownloadDeadlineRecord = {
  email: string;
  deadline: number;
};

function canUseStorage(): boolean {
  return typeof sessionStorage !== 'undefined';
}

export function getDownloadDeadline(email: string): number | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as DownloadDeadlineRecord;
    if (!rec?.email || rec.email !== email.trim().toLowerCase()) return null;
    return typeof rec.deadline === 'number' ? rec.deadline : null;
  } catch {
    return null;
  }
}

/** Start or resume the 1-hour window for this account (from first authenticated session). */
export function ensureDownloadDeadline(email: string): number {
  const norm = email.trim().toLowerCase();
  const existing = getDownloadDeadline(norm);
  if (existing !== null) return existing;
  const deadline = Date.now() + 60 * 60 * 1000;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ email: norm, deadline } satisfies DownloadDeadlineRecord));
  return deadline;
}

export function clearDownloadDeadline(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(STORAGE_KEY);
}
