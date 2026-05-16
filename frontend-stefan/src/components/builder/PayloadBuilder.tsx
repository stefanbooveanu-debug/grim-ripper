import { useState } from 'react';
import { OBFUSCATION_METHOD, obfuscatePowerShell } from '../../lib/obfuscate';
import { useStore } from '../../store';
import { ConfigPanel } from './ConfigPanel';
import { OutputPanel } from './OutputPanel';
import './builder.css';

export function PayloadBuilder() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { scriptInput, setProcessedScript, addLog } = useStore();

  const handleProcess = () => {
    if (!scriptInput.trim()) return;
    setIsProcessing(true);

    window.setTimeout(() => {
      const processed = obfuscatePowerShell(scriptInput);
      const result = {
        original: scriptInput,
        processed,
        method: OBFUSCATION_METHOD,
        length: scriptInput.length,
        processedLength: processed.length,
        createdAt: Date.now(),
      };

      setProcessedScript(result);
      addLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        scriptPreview:
          scriptInput.slice(0, 80) + (scriptInput.length > 80 ? '…' : ''),
        method: OBFUSCATION_METHOD,
        status: 'success',
        length: processed.length,
        details: `Processed ${scriptInput.length} bytes → ${processed.length} bytes. Script wrapped in Base64 with Invoke-Expression.`,
      });

      setIsProcessing(false);
    }, 800);
  };

  return (
    <>
      <header className="builder-header">
        <h1 className="builder-title">GRIM DROPPER</h1>
        <p className="builder-sub">
          Paste a PowerShell script to obfuscate and prepare for deployment
        </p>
      </header>

      <div className="builder-grid">
        <ConfigPanel onProcess={handleProcess} isProcessing={isProcessing} />
        <OutputPanel />
      </div>
    </>
  );
}
