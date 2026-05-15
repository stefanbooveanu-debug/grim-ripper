import type { PipelineStage, StageResult } from '../api/types';

export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

export interface PipelineState {
  status: PipelineStatus;
  activeStage: PipelineStage | null;
  completed: StageResult[];
  error: string | null;
}

export const initialPipelineState: PipelineState = {
  status: 'idle',
  activeStage: null,
  completed: [],
  error: null,
};

export function startPipeline(): PipelineState {
  return { ...initialPipelineState, status: 'running' };
}

export function setActiveStage(state: PipelineState, stage: PipelineStage): PipelineState {
  return { ...state, activeStage: stage };
}

export function completeStage(state: PipelineState, result: StageResult): PipelineState {
  return {
    ...state,
    activeStage: null,
    completed: [...state.completed, result],
  };
}

export function finishPipeline(state: PipelineState): PipelineState {
  return { ...state, status: 'done', activeStage: null };
}

export function failPipeline(state: PipelineState, error: string): PipelineState {
  return { ...state, status: 'error', activeStage: null, error };
}

export function resetPipeline(): PipelineState {
  return initialPipelineState;
}
