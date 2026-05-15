import './PipelineStep.css';

interface PipelineStepProps {
  label: string;
  description: string;
  status: 'idle' | 'active' | 'done' | 'error';
  durationMs?: number;
}

export function PipelineStep({ label, description, status, durationMs }: PipelineStepProps) {
  return (
    <li className={`pipeline-step pipeline-step--${status}`}>
      <span className="pipeline-step-indicator" aria-hidden />
      <div className="pipeline-step-content">
        <span className="pipeline-step-label">{label}</span>
        <span className="pipeline-step-desc">{description}</span>
        {durationMs != null && status === 'done' && (
          <span className="pipeline-step-meta">{durationMs}ms</span>
        )}
      </div>
    </li>
  );
}
