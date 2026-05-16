import { Check, Copy, FileDown } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';
import './builder.css';

export function OutputPanel() {
  const { processedScript } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!processedScript) return;
    try {
      await navigator.clipboard.writeText(processedScript.processed);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = () => {
    if (!processedScript) return;
    const blob = new Blob([processedScript.processed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payload.ps1';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="builder-panel">
      <h2 className="builder-panel-title">Output</h2>

      {!processedScript ? (
        <div className="builder-output-empty">
          <div className="builder-output-empty-icon">
            <FileDown size={24} aria-hidden />
          </div>
          <p>Paste a script and process it</p>
        </div>
      ) : (
        <div className="builder-output-enter">
          <div className="builder-stat-label">Processed script</div>
          <pre className="builder-pre">{processedScript.processed}</pre>

          <div className="builder-stats">
            <div className="builder-stat">
              <div className="builder-stat-label">Method</div>
              <div className="builder-stat-value builder-stat-value--method">
                {processedScript.method}
              </div>
            </div>
            <div className="builder-stat">
              <div className="builder-stat-label">Size</div>
              <div className="builder-stat-value">
                {processedScript.processedLength} bytes
                <span className="builder-stat-muted">
                  ({processedScript.length} original)
                </span>
              </div>
            </div>
          </div>

          <div className="builder-actions">
            <button type="button" className={`btn ${copied ? 'btn-copied' : ''}`} onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
            <button type="button" className="btn" onClick={handleDownload}>
              <FileDown size={14} />
              DOWNLOAD .ps1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
