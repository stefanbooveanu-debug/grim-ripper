import { useState } from 'react';
import { downloadArtifact } from '../api/client';
import { parseApiError } from '../api/errors';
import type { PipelineResponse } from '../api/types';
import './StatusPanel.css';

interface StatusPanelProps {
  result: PipelineResponse | null;
  loading: boolean;
  error: string | null;
}

export function StatusPanel({ result, loading, error }: StatusPanelProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadArtifact(result.jobId, result.outputFileName);
    } catch (err) {
      setDownloadError(parseApiError(err));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="status-panel status-panel--loading" role="status" aria-live="polite">
        <span className="status-spinner" aria-hidden />
        Running pipeline…
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-panel status-panel--error" role="alert">
        {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="status-panel status-panel--idle">
        Upload a payload and run the pipeline to see results.
      </div>
    );
  }

  return (
    <div className="status-panel status-panel--success" aria-live="polite">
      <h3 className="status-heading">Output ready</h3>
      <dl className="status-dl">
        <div>
          <dt>File</dt>
          <dd>{result.outputFileName}</dd>
        </div>
        <div>
          <dt>Detection score</dt>
          <dd className="status-score">{result.detectionScore}% evasion</dd>
        </div>
        <div>
          <dt>SHA-256</dt>
          <dd className="status-hash">{result.sha256}</dd>
        </div>
        <div>
          <dt>Job ID</dt>
          <dd>{result.jobId}</dd>
        </div>
      </dl>
      {downloadError && (
        <p className="status-download-error" role="alert">
          {downloadError}
        </p>
      )}
      <button
        type="button"
        className="btn btn-secondary"
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading ? 'Downloading…' : 'Download artifact'}
      </button>
    </div>
  );
}
