import { Terminal } from 'lucide-react';
import { useStore } from '../../store';
import './builder.css';

interface ConfigPanelProps {
  onProcess: () => void;
  isProcessing: boolean;
  onScriptPasted?: () => void;
}

export function ConfigPanel({ onProcess, isProcessing, onScriptPasted }: ConfigPanelProps) {
  const { scriptInput, setScriptInput } = useStore();
  const lines = scriptInput ? scriptInput.split('\n').length : 0;

  return (
    <div className="builder-panel">
      <div className="builder-panel-head">
        <h2 className="builder-panel-title">PowerShell script</h2>
        <Terminal className="builder-panel-icon" aria-hidden />
      </div>

      <textarea
        value={scriptInput}
        onChange={(e) => setScriptInput(e.target.value)}
        onPaste={() => onScriptPasted?.()}
        placeholder="Paste your PowerShell script here..."
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
        className={`btn btn-primary builder-process-btn${isProcessing ? ' builder-process-btn--busy' : ''}`}
        onClick={onProcess}
        disabled={isProcessing || !scriptInput.trim()}
      >
        {isProcessing ? 'PROCESSING...' : 'PROCESS SCRIPT'}
      </button>
    </div>
  );
}
