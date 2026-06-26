import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import type { TaskEvent, WordExportProgressEvent, WordExportResult } from '../types/ipc';
import type { ClientConfig, ConfigSaveResult } from '../types/config';
import type { ChatCompletionRequest, JsonCompletionRequest } from '../types/ai';
import type { Project, ProjectListResult, ProjectMutationResult } from '../../features/technical-plan/types';

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
    updateStep: async (step: any): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.TECHNICAL_PLAN_UPDATE_STEP, { step });
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
    onParseEvent: (callback: (event: any) => void): (() => void) => {
      let closed = false;
      const eventSource = new EventSource(ENDPOINTS.TECHNICAL_PLAN_TENDER_EVENTS);
      eventSource.onmessage = (msg) => {
        if (closed) return;
        try {
          const parsed = JSON.parse(msg.data);
          callback(parsed);
        } catch { /* ignore malformed SSE */ }
      };
      eventSource.onerror = () => {
        closed = true;
        eventSource.close();
      };
      return () => {
        closed = true;
        eventSource.close();
      };
    },
  },

  knowledgeBase: {
    list: async (): Promise<any> => {
      const { data } = await http.get(ENDPOINTS.KNOWLEDGE_BASE_LIST);
      return data;
    },
    getMigrationStatus: async (): Promise<any> => {
      const { data } = await http.get(ENDPOINTS.KNOWLEDGE_BASE_GET_MIGRATION_STATUS);
      return data;
    },
    migrateLegacy: async (): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.KNOWLEDGE_BASE_MIGRATE_LEGACY);
      return data;
    },
    createFolder: async (name: string): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.KNOWLEDGE_BASE_CREATE_FOLDER, { name });
      return data;
    },
    renameFolder: async (folderId: string, name: string): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.KNOWLEDGE_BASE_RENAME_FOLDER, { folderId, name });
      return data;
    },
    deleteFolder: async (folderId: string): Promise<any> => {
      const { data } = await http.delete(ENDPOINTS.KNOWLEDGE_BASE_DELETE_FOLDER, { data: { folderId } });
      return data;
    },
    reorderFolder: async (folderId: string, targetFolderId: string, position: string): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.KNOWLEDGE_BASE_REORDER_FOLDER, { folderId, targetFolderId, position });
      return data;
    },
    uploadDocuments: async (folderId: string): Promise<any> => {
      const formData = new FormData();
      formData.append('folderId', folderId);
      const { data } = await http.post(ENDPOINTS.KNOWLEDGE_BASE_UPLOAD_DOCUMENTS, formData);
      return data;
    },
    deleteDocument: async (documentId: string): Promise<any> => {
      const { data } = await http.delete(ENDPOINTS.KNOWLEDGE_BASE_DELETE_DOCUMENT, { data: { documentId } });
      return data;
    },
    retryDocument: async (documentId: string): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.KNOWLEDGE_BASE_RETRY_DOCUMENT, { documentId });
      return data;
    },
    moveDocument: async (documentId: string, folderId: string, targetDocumentId: string | null, position: string): Promise<any> => {
      const { data } = await http.put(ENDPOINTS.KNOWLEDGE_BASE_MOVE_DOCUMENT, { documentId, folderId, targetDocumentId, position });
      return data;
    },
    readMarkdown: async (documentId: string): Promise<string> => {
      const { data } = await http.get(ENDPOINTS.KNOWLEDGE_BASE_READ_MARKDOWN, { params: { documentId } });
      return data.markdown || data;
    },
    readItems: async (documentId: string): Promise<any[]> => {
      const { data } = await http.get(ENDPOINTS.KNOWLEDGE_BASE_READ_ITEMS, { params: { documentId } });
      return data.items || data;
    },
    readAnalysis: async (documentId: string): Promise<any> => {
      const { data } = await http.get(ENDPOINTS.KNOWLEDGE_BASE_READ_ANALYSIS, { params: { documentId } });
      return data;
    },
    startMatching: async (documentId: string, batchSize: number): Promise<any> => {
      const { data } = await http.post(ENDPOINTS.KNOWLEDGE_BASE_START_MATCHING, { documentId, batchSize });
      return data;
    },
    onEvent: (callback: (event: any) => void): (() => void) => {
      let closed = false;
      const eventSource = new EventSource(ENDPOINTS.KNOWLEDGE_BASE_EVENTS);
      eventSource.onmessage = (msg) => {
        if (closed) return;
        try {
          const parsed = JSON.parse(msg.data);
          callback(parsed);
        } catch { /* ignore malformed SSE */ }
      };
      eventSource.onerror = () => {
        closed = true;
        eventSource.close();
      };
      return () => {
        closed = true;
        eventSource.close();
      };
    },
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

  // ── 项目管理（占位 stub，使用内存 mock，后端就绪后切换为真实 HTTP 调用）──
  projects: (() => {
    const mockStore: Project[] = [
      {
        id: 'p-1',
        name: '示例项目 A — XX 公路工程',
        status: 'in-progress',
        created_at: '2026-06-01T10:00:00Z',
        updated_at: '2026-06-20T14:30:00Z',
        tender_file_name: 'XX公路招标文件.docx',
        outline_section_count: 6,
        content_word_count: 0,
      },
      {
        id: 'p-3',
        name: '示例项目 C — 智慧城市',
        status: 'completed',
        created_at: '2026-05-15T08:00:00Z',
        updated_at: '2026-06-18T16:45:00Z',
        tender_file_name: '智慧城市招标文件.docx',
        outline_section_count: 8,
        content_word_count: 12500,
      },
    ];

    const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const newId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      list: async (): Promise<ProjectListResult> => {
        await delay();
        return { success: true, projects: mockStore.map((p) => ({ ...p })) };
      },
      create: async (name: string): Promise<ProjectMutationResult> => {
        await delay();
        const trimmed = String(name || '').trim();
        if (!trimmed) {
          return { success: false, message: '项目名称不能为空' };
        }
        const now = new Date().toISOString();
        const project: Project = {
          id: newId(),
          name: trimmed,
          status: 'draft',
          created_at: now,
          updated_at: now,
          outline_section_count: 0,
          content_word_count: 0,
        };
        mockStore.push(project);
        return { success: true, message: '项目已创建', project };
      },
      rename: async (id: string, name: string): Promise<ProjectMutationResult> => {
        await delay();
        const trimmed = String(name || '').trim();
        if (!trimmed) {
          return { success: false, message: '项目名称不能为空' };
        }
        const target = mockStore.find((p) => p.id === id);
        if (!target) {
          return { success: false, message: '项目不存在' };
        }
        target.name = trimmed;
        target.updated_at = new Date().toISOString();
        return { success: true, message: '项目已重命名', project: { ...target } };
      },
      delete: async (id: string): Promise<ProjectMutationResult> => {
        await delay();
        const idx = mockStore.findIndex((p) => p.id === id);
        if (idx < 0) {
          return { success: false, message: '项目不存在' };
        }
        const [removed] = mockStore.splice(idx, 1);
        return { success: true, message: '项目已删除', project: { ...removed } };
      },
    };
  })(),
};
