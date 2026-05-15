import type { PipelineOptions } from '../api/types';
import './PayloadForm.css';

interface PayloadFormProps {
  file: File | null;
  options: PipelineOptions;
  disabled: boolean;
  onFileChange: (file: File | null) => void;
  onOptionsChange: (options: PipelineOptions) => void;
  onSubmit: () => void;
}

export function PayloadForm({
  file,
  options,
  disabled,
  onFileChange,
  onOptionsChange,
  onSubmit,
}: PayloadFormProps) {
  return (
    <form
      className="payload-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <label className="payload-field">
        <span className="payload-label">Payload file</span>
        <input
          type="file"
          accept=".exe,.dll,.bin,.ps1,.sh,.py,.js"
          disabled={disabled}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />
        {file && (
          <span className="payload-file-meta">
            {file.name} · {(file.size / 1024).toFixed(1)} KB
          </span>
        )}
      </label>

      <fieldset className="payload-options" disabled={disabled}>
        <legend className="payload-label">Pipeline stages</legend>
        <label className="payload-check">
          <input
            type="checkbox"
            checked={options.pack}
            onChange={(e) => onOptionsChange({ ...options, pack: e.target.checked })}
          />
          Pack
        </label>
        <label className="payload-check">
          <input
            type="checkbox"
            checked={options.obfuscate}
            onChange={(e) => onOptionsChange({ ...options, obfuscate: e.target.checked })}
          />
          Obfuscate
        </label>
        <label className="payload-check">
          <input
            type="checkbox"
            checked={options.encrypt}
            onChange={(e) => onOptionsChange({ ...options, encrypt: e.target.checked })}
          />
          Encrypt
        </label>
      </fieldset>

      <button type="submit" className="btn btn-primary" disabled={disabled || !file}>
        {disabled ? 'Processing…' : 'Run pipeline'}
      </button>
    </form>
  );
}
