import { create } from 'zustand';

export interface ProcessedScript {
  original: string;
  processed: string;
  method: string;
  length: number;
  processedLength: number;
  createdAt: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  scriptPreview: string;
  method: string;
  status: 'success' | 'failed' | 'pending';
  length: number;
  details?: string;
}

interface Store {
  scriptInput: string;
  processedScript: ProcessedScript | null;
  logs: LogEntry[];
  setScriptInput: (script: string) => void;
  setProcessedScript: (script: ProcessedScript) => void;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
}

export const useStore = create<Store>((set) => ({
  scriptInput: '',
  processedScript: null,
  logs: [],
  setScriptInput: (scriptInput) => set({ scriptInput }),
  setProcessedScript: (processedScript) => set({ processedScript }),
  addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
  clearLogs: () => set({ logs: [] }),
}));
