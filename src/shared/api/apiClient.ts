import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import type { TaskEvent, WordExportProgressEvent, WordExportResult } from '../types/ipc';
import type { ClientConfig, ConfigSaveResult } from '../types/config';
import type { ChatCompletionRequest, JsonCompletionRequest } from '../types/ai';

const http = axios.create({ timeout: 300000 });

export const apiClient = {
  config: {
    load: async (): Promise<ClientConfig> => {
      const { data } = await http.get(ENDPOINTS.CONFIG_LOAD);
      return data;
    },
    save: async (config: ClientConfig): Promise<ConfigSaveResult> => {
      const { data } = await http.put(ENDPOINTS.CONFIG_SAVE, config);
      return data;
    },
  },

  ai: {
    chat: async (request: ChatCompletionRequest): Promise<string> => {
      const { data } = await http.post(ENDPOINTS.AI_CHAT, request);
      return data.content || data;
    },
    requestJson: async <TResult = unknown>(request: JsonCompletionRequest): Promise<TResult> => {
      const { data } = await http.post(ENDPOINTS.AI_REQUEST_JSON, request);
      return data;
    },
  },

  file: {
    parse: async (formData: FormData): Promise<{ success: boolean; message?: string; markdown?: string; fileName?: string }> => {
      const { data } = await http.post(ENDPOINTS.FILE_PARSE, formData);
      return data;
    },
  },

  technicalPlan: {
    loadState: async (): Promise<any> => {
      const { data } = await http.get(ENDPOINTS.TECHNICAL_PLAN_LOAD_STATE);
      return data;
    },
    importTenderDocument: async (formData: FormData): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.TECHNICAL_PLAN_IMPORT_TENDER, formData);
      return data;
    },
    importOriginalPlanDocument: async (formData: FormData): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.TECHNICAL_PLAN_IMPORT_ORIGINAL_PLAN, formData);
      return data;
    },
    selectBidSection: async (selectedSection: any): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.TECHNICAL_PLAN_SELECT_BID_SECTION, { selectedSection });
      return data;
    },
    cancelBidSectionSelection: async (): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.TECHNICAL_PLAN_CANCEL_BID_SECTION);
      return data;
    },
    readTenderMarkdown: async (): Promise<string> => {
      const { data } = await http.get(ENDPOINTS.TECHNICAL_PLAN_READ_TENDER_MARKDOWN);
      return data.markdown || data;
    },
    readOriginalPlanMarkdown: async (): Promise<string> => {
      const { data } = await http.get(ENDPOINTS.TECHNICAL_PLAN_READ_ORIGINAL_PLAN_MARKDOWN);
      return data.markdown || data;
    },
    updateStep: async (step: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_UPDATE_STEP, { step });
      return data;
    },
    setWorkflowKind: async (workflowKind: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SET_WORKFLOW_KIND, { workflowKind });
      return data;
    },
    switchWorkflowKind: async (workflowKind: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SET_WORKFLOW_KIND, { workflowKind });
      return data;
    },
    saveBidAnalysisConfig: async (payload: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_BID_ANALYSIS_CONFIG, payload);
      return data;
    },
    saveOutlineConfig: async (payload: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_OUTLINE_CONFIG, payload);
      return data;
    },
    saveOutline: async (payload: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_OUTLINE, payload);
      return data;
    },
    saveGlobalFacts: async (globalFacts: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_GLOBAL_FACTS, { globalFacts });
      return data;
    },
    saveContentGenerationOptions: async (options: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_CONTENT_OPTIONS, options);
      return data;
    },
    saveChapterContent: async (payload: { nodeId: string; content: string }): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_SAVE_CHAPTER_CONTENT, payload);
      return data;
    },
    clear: async (): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.TECHNICAL_PLAN_CLEAR);
      return data;
    },
  },

  knowledgeBase: {
    list: async (): Promise<any> => ({ folders: [], documents: [] }),
    readMarkdown: async (_documentId: string): Promise<string> => '',
  },

  tasks: {
    startBidAnalysis: async (payload: unknown): Promise<unknown> => {
      const { data } = await http.post(ENDPOINTS.TASKS_START_BID_ANALYSIS, payload);
      return data;
    },
    startOutlineGeneration: async (payload: unknown): Promise<unknown> => {
      const { data } = await http.post(ENDPOINTS.TASKS_START_OUTLINE_GENERATION, payload);
      return data;
    },
    startGlobalFactsGeneration: async (payload: unknown): Promise<unknown> => {
      const { data } = await http.post(ENDPOINTS.TASKS_START_GLOBAL_FACTS, payload);
      return data;
    },
    startContentGeneration: async (payload: unknown): Promise<unknown> => {
      const { data } = await http.post(ENDPOINTS.TASKS_START_CONTENT_GENERATION, payload);
      return data;
    },
    pauseContentGeneration: async (): Promise<unknown> => {
      const { data } = await http.post(ENDPOINTS.TASKS_PAUSE_CONTENT_GENERATION);
      return data;
    },
    getActiveTasks: async (): Promise<unknown[]> => {
      const { data } = await http.get(ENDPOINTS.TASKS_EVENTS);
      return data;
    },
    onTaskEvent: <TState = unknown>(callback: (event: TaskEvent<TState>) => void): (() => void) => {
      const eventSource = new EventSource(ENDPOINTS.TASKS_EVENTS);
      eventSource.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          callback(parsed);
        } catch { /* ignore malformed SSE */ }
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
      return () => eventSource.close();
    },
  },

  export: {
    exportWord: async (payload: unknown): Promise<WordExportResult> => {
      const { data } = await http.post(ENDPOINTS.EXPORT_WORD, payload);
      return data;
    },
    onWordExportProgress: (callback: (event: WordExportProgressEvent) => void): (() => void) => {
      const eventSource = new EventSource(ENDPOINTS.EXPORT_WORD_PROGRESS);
      eventSource.onmessage = (msg) => {
        try {
          const parsed = JSON.parse(msg.data);
          callback(parsed);
        } catch { /* ignore malformed SSE */ }
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
      return () => eventSource.close();
    },
  },
};
