/**
 * Access request: opens the system mail handler via mailto: (one window, macOS-friendly).
 * Optional Gmail / Yahoo / Outlook **web** compose URLs are built for a manual link on the
 * success screen — avoids `window.open` from embedded browsers (e.g. Cursor) opening an
 * extra tab while Spaces sends Chrome to another desktop.
 */

/** Subject line for the access / pricing request (prefilled in the compose window). */
export const ACCESS_REQUEST_MAIL_SUBJECT = 'Pricing and request';

const MAX_COMPOSE_URL_CHARS = 6000;

function domainOf(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 0 || at === trimmed.length - 1) return null;
  return trimmed.slice(at + 1);
}

export type WebMailProvider = 'gmail' | 'yahoo' | 'outlook';

/** Guess web compose from the requester's email domain (not the company To address). */
export function detectWebMailProvider(requesterEmail: string): WebMailProvider | null {
  const domain = domainOf(requesterEmail);
  if (!domain) return null;

  if (domain === 'gmail.com' || domain === 'googlemail.com') return 'gmail';
  if (domain.startsWith('yahoo.') || domain === 'ymail.com' || domain === 'rocketmail.com') {
    return 'yahoo';
  }
  if (
    domain === 'outlook.com' ||
    domain === 'hotmail.com' ||
    domain === 'live.com' ||
    domain === 'msn.com'
  ) {
    return 'outlook';
  }
  if (domain.endsWith('.onmicrosoft.com')) return 'outlook';
  return null;
}

export function webMailLinkLabel(provider: WebMailProvider): string {
  switch (provider) {
    case 'gmail':
      return 'Open prefilled compose in Gmail (Safari / Chrome)';
    case 'yahoo':
      return 'Open prefilled compose in Yahoo Mail (browser)';
    case 'outlook':
      return 'Open prefilled compose in Outlook on the web (browser)';
  }
}

function buildMailto(to: string, subject: string, body: string): string {
  const q = new URLSearchParams();
  q.set('subject', subject);
  q.set('body', body);
  return `mailto:${to}?${q.toString()}`;
}

/** Always use for the immediate “Request access” action. */
export function buildAccessRequestMailtoUrl(opts: {
  companyEmail: string;
  requesterEmail: string;
  purpose: string;
}): string {
  return buildMailto(
    opts.companyEmail.trim(),
    ACCESS_REQUEST_MAIL_SUBJECT,
    opts.purpose.trim(),
  );
}

function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams();
  p.set('view', 'cm');
  p.set('fs', '1');
  p.set('to', to);
  p.set('su', subject);
  p.set('body', body);
  return `https://mail.google.com/mail/?${p.toString()}`;
}

function buildYahooComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams();
  p.set('to', to);
  p.set('subject', subject);
  p.set('body', body);
  return `https://compose.mail.yahoo.com/?${p.toString()}`;
}

function buildOffice365ComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams();
  p.set('to', to);
  p.set('subject', subject);
  p.set('body', body);
  return `https://outlook.office.com/mail/deeplink/compose?${p.toString()}`;
}

function buildOutlookConsumerComposeUrl(to: string, subject: string, body: string): string {
  const p = new URLSearchParams();
  p.set('to', to);
  p.set('subject', subject);
  p.set('body', body);
  return `https://outlook.live.com/mail/0/deeplink/compose?${p.toString()}`;
}

/**
 * Gmail / Yahoo / Outlook web compose URL for a **user-clicked** link (not auto window.open).
 * Returns null when mailto-only is appropriate for this address.
 */
export function buildAccessRequestWebComposeUrl(opts: {
  companyEmail: string;
  requesterEmail: string;
  purpose: string;
}): { url: string; provider: WebMailProvider } | null {
  const to = opts.companyEmail.trim();
  const subject = ACCESS_REQUEST_MAIL_SUBJECT;
  const body = opts.purpose.trim();
  const provider = detectWebMailProvider(opts.requesterEmail);
  if (!provider) return null;

  if (provider === 'gmail') return { url: buildGmailComposeUrl(to, subject, body), provider };
  if (provider === 'yahoo') return { url: buildYahooComposeUrl(to, subject, body), provider };

  const d = domainOf(opts.requesterEmail);
  if (d?.endsWith('.onmicrosoft.com')) {
    return { url: buildOffice365ComposeUrl(to, subject, body), provider };
  }
  return { url: buildOutlookConsumerComposeUrl(to, subject, body), provider };
}

/** Longest URL we may use (mailto vs web) — for validation before submit. */
export function longestAccessRequestUrl(opts: {
  companyEmail: string;
  requesterEmail: string;
  purpose: string;
}): string {
  const mailto = buildAccessRequestMailtoUrl(opts);
  const web = buildAccessRequestWebComposeUrl(opts);
  if (!web) return mailto;
  return mailto.length >= web.url.length ? mailto : web.url;
}

export function validateComposeUrlLength(
  url: string,
): { ok: true } | { ok: false; message: string } {
  if (url.length > MAX_COMPOSE_URL_CHARS) {
    return {
      ok: false,
      message: `Your purpose text is too long for an email link (${url.length} characters). Shorten it to about ${Math.max(200, MAX_COMPOSE_URL_CHARS - 500)} characters and try again.`,
    };
  }
  return { ok: true };
}

export function openMailtoUrl(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Opens only the system mail handler (mailto:). Use the optional web compose link on the
 * success screen so Gmail opens in **your** browser when you choose, not from an embedded IDE tab.
 */
export function openAccessRequestCompose(opts: {
  companyEmail: string;
  requesterEmail: string;
  purpose: string;
}): { ok: true } | { ok: false; message: string } {
  const mailto = buildAccessRequestMailtoUrl(opts);
  const len = validateComposeUrlLength(longestAccessRequestUrl(opts));
  if (!len.ok) return len;
  openMailtoUrl(mailto);
  return { ok: true };
}
