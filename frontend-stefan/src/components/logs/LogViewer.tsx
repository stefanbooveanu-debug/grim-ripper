import { useState } from 'react';
import type { LogEntry as LogEntryType } from '../../store';
import { useStore } from '../../store';
import { LogEntry } from './LogEntry';
import './logs.css';

type StatusFilter = 'all' | LogEntryType['status'];

export function LogViewer() {
  const { logs, clearLogs } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = logs.filter((log) => {
    if (statusFilter !== 'all' && log.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.scriptPreview.toLowerCase().includes(q) ||
      log.method.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    );
  });

  const filters: StatusFilter[] = ['all', 'success', 'failed', 'pending'];

  return (
    <div className="logs-page">
      <header className="logs-header">
        <div>
          <h1 className="logs-title">Logs</h1>
          <p className="logs-sub">
            {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        {logs.length > 0 && (
          <button type="button" className="btn" onClick={clearLogs}>
            Clear all
          </button>
        )}
      </header>

      <div className="logs-toolbar">
        <div className="logs-search-wrap">
          <span className="logs-search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="logs-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs…"
          />
        </div>
        {filters.map((s) => (
          <button
            key={s}
            type="button"
            className={`logs-filter ${statusFilter === s ? 'active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="logs-empty">
          <div className="logs-empty-icon">☰</div>
          <p>
            {logs.length === 0
              ? 'No logs yet. Process a script in Builder or run the Console pipeline.'
              : 'No logs match your filters.'}
          </p>
        </div>
      ) : (
        <ul className="logs-list">
          {filtered.map((log) => (
            <li key={log.id}>
              <LogEntry log={log} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
