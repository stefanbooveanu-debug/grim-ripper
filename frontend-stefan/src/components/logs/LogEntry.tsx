import { useState } from 'react';
import type { LogEntry as LogEntryType } from '../../store';
import './logs.css';

interface LogEntryProps {
  log: LogEntryType;
}

export function LogEntry({ log }: LogEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const time = new Date(log.timestamp).toLocaleString();

  return (
    <article className="log-entry">
      <button
        type="button"
        className="log-entry-toggle"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className={`log-entry-dot ${log.status}`} aria-hidden />
        <span className="log-entry-time">{time}</span>
        <span className="log-entry-preview">{log.scriptPreview}</span>
        <span className="log-entry-method">{log.method}</span>
        <span className={`log-entry-status ${log.status}`}>{log.status}</span>
        <span className="log-entry-chevron" aria-hidden>
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {expanded && (
        <div className="log-entry-body">
          <div className="log-entry-grid">
            <div>
              <span className="log-entry-block-label">Method </span>
              <span>{log.method}</span>
            </div>
            <div>
              <span className="log-entry-block-label">Size </span>
              <span>{log.length} bytes</span>
            </div>
          </div>

          <div className="log-entry-block">
            <div className="log-entry-block-label">Script preview</div>
            <pre>{log.scriptPreview}</pre>
          </div>

          {log.details && (
            <div className="log-entry-block" style={{ marginTop: 8 }}>
              <div className="log-entry-block-label">Details</div>
              <pre>{log.details}</pre>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
