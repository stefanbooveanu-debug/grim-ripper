import { useCallback, useEffect, useState } from 'react';
import {
  checkHealth,
  isApiConfigured,
  resetPipeline as resetPipelineApi,
  runPipeline,
} from '../api/client';
import { parseApiError } from '../api/errors';
import type { PipelineOptions, PipelineResponse, PipelineStage } from '../api/types';
import { PayloadForm } from '../components/PayloadForm';
import { PipelineStep } from '../components/PipelineStep';
import { StatusPanel } from '../components/StatusPanel';
import { PIPELINE_STEPS } from '../content/hacktm';
import { logPipelineFailure, logPipelineSuccess } from '../lib/pipelineLog';
import {
  completeStage,
  failPipeline,
  finishPipeline,
  initialPipelineState,
  resetPipeline,
  setActiveStage,
  startPipeline,
  type PipelineState,
} from '../lib/pipeline';
import '../components/shared.css';
import './ConsolePage.css';

const defaultOptions: PipelineOptions = {
  pack: true,
  obfuscate: true,
  encrypt: true,
};

function stageStatus(
  id: PipelineStage,
  pipeline: PipelineState,
): 'idle' | 'active' | 'done' | 'error' {
  const done = pipeline.completed.find((s) => s.stage === id);
  if (done) return done.success ? 'done' : 'error';
  if (pipeline.activeStage === id) return 'active';
  return 'idle';
}

export function ConsolePage() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<PipelineOptions>(defaultOptions);
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<string>('checking…');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    checkHealth()
      .then((h) => {
        if (h.version === 'demo-local') setApiStatus('Demo mode — set VITE_API_URL');
        else setApiStatus(`API connected · ${h.version}`);
      })
      .catch(() => setApiStatus('Start Python backend on :8080'));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    if (!options.pack && !options.obfuscate && !options.encrypt) {
      setError('Select at least one pipeline stage.');
      return;
    }

    setError(null);
    setResult(null);
    let p = startPipeline();
    setPipeline(p);

    try {
      if (!isApiConfigured()) {
        const stages = PIPELINE_STEPS.filter((s) => {
          if (s.id === 'pack') return options.pack;
          if (s.id === 'obfuscate') return options.obfuscate;
          return options.encrypt;
        });
        for (const step of stages) {
          p = setActiveStage(p, step.id as PipelineStage);
          setPipeline({ ...p });
          await new Promise((r) => setTimeout(r, 350));
        }
      }

      const response = await runPipeline(file, options);

      for (const stage of response.stages) {
        p = completeStage(p, stage);
        setPipeline({ ...p });
      }

      p = finishPipeline(p);
      setPipeline(p);
      setResult(response);
      if (file) logPipelineSuccess(file.name, response);
    } catch (err) {
      const msg = parseApiError(err);
      setPipeline(failPipeline(p, msg));
      setError(msg);
      if (file) logPipelineFailure(file.name, msg);
    }
  }, [file, options]);

  const handleReset = useCallback(async () => {
    setResetting(true);
    setError(null);
    try {
      await resetPipelineApi();
      setPipeline(resetPipeline());
      setResult(null);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setResetting(false);
    }
  }, []);

  const loading = pipeline.status === 'running';

  return (
    <div className="console-page">
      <header className="console-header">
        <h1 className="console-title">Operations console</h1>
        <p className="console-sub">Pack · Obfuscate · Encrypt — deploy hardened payloads</p>
        <span className="console-api-badge">{apiStatus}</span>
      </header>

      <div className="console-grid">
        <section className="console-panel" aria-labelledby="config-heading">
          <h2 id="config-heading" className="panel-title">
            Configuration
          </h2>
          <PayloadForm
            file={file}
            options={options}
            disabled={loading || resetting}
            onFileChange={setFile}
            onOptionsChange={setOptions}
            onSubmit={handleSubmit}
          />
          {pipeline.status !== 'idle' && (
            <button
              type="button"
              className="btn console-reset"
              disabled={loading || resetting}
              onClick={handleReset}
            >
              {resetting ? 'Resetting…' : 'Reset'}
            </button>
          )}
        </section>

        <section className="console-panel" aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="panel-title">
            Pipeline
          </h2>
          <ul className="pipeline-list">
            {PIPELINE_STEPS.map((step) => {
              const done = pipeline.completed.find((s) => s.stage === step.id);
              return (
                <PipelineStep
                  key={step.id}
                  label={step.label}
                  description={step.description}
                  status={stageStatus(step.id as PipelineStage, pipeline)}
                  durationMs={done?.durationMs}
                />
              );
            })}
          </ul>
        </section>

        <section className="console-panel console-panel--wide" aria-labelledby="output-heading">
          <h2 id="output-heading" className="panel-title">
            Output
          </h2>
          <StatusPanel result={result} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
}
