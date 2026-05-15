import type { PipelineResponse } from '../api/types';
import type { LogEntry } from '../store';
import { useStore } from '../store';

export function logPipelineSuccess(fileName: string, response: PipelineResponse): void {
  const stages = response.stages.map((s) => s.stage).join(' → ');
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    scriptPreview: fileName,
    method: `Pipeline: ${stages}`,
    status: 'success',
    length: 0,
    details: `Job ${response.jobId}. Output: ${response.outputFileName}. Detection score: ${response.detectionScore}. SHA-256: ${response.sha256.slice(0, 16)}…`,
  };
  useStore.getState().addLog(entry);
}

export function logPipelineFailure(fileName: string, message: string): void {
  const entry: LogEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    scriptPreview: fileName || '(no file)',
    method: 'Pipeline',
    status: 'failed',
    length: 0,
    details: message,
  };
  useStore.getState().addLog(entry);
}
