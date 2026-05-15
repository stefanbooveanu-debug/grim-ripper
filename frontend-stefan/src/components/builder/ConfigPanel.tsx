import { useStore } from '../../store';
import './builder.css';

interface ConfigPanelProps {
  onProcess: () => void;
  isProcessing: boolean;
}

export function ConfigPanel({ onProcess, isProcessing }: ConfigPanelProps) {
  const { scriptInput, setScriptInput } = useStore();
  const lines = scriptInput ? scriptInput.split('\n').length : 0;

  return (
    <div className="builder-panel">
      <div className="builder-panel-head">
        <h2 className="builder-panel-title">PowerShell script</h2>
        <span aria-hidden className="builder-panel-icon">
          &gt;_
        </span>
      </div>

      <textarea
        value={scriptInput}
        onChange={(e) => setScriptInput(e.target.value)}
        placeholder="Paste your PowerShell script here…"
        className="builder-textarea"
        spellCheck={false}
        disabled={isProcessing}
      />

      <div className="builder-meta">
        <span>{scriptInput.length} characters</span>
        <span>{lines} lines</span>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        style={{ width: '100%', marginTop: 16 }}
        onClick={onProcess}
        disabled={isProcessing || !scriptInput.trim()}
      >
        {isProcessing ? 'Processing…' : 'Process script'}
      </button>
    </div>
  );
}
