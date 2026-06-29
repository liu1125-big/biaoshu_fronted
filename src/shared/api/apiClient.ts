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

  knowledgeBase: (() => {
    type KbStatus = 'pending' | 'copying' | 'converting' | 'extracting' | 'ready_for_matching' | 'matching' | 'recovering' | 'analyzing' | 'saving' | 'success' | 'error';

    const mockFolders = [
      { id: 'f-1', name: '招标文件', sort_order: 0, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-20T14:30:00Z' },
      { id: 'f-2', name: '技术规范', sort_order: 1, created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-21T11:00:00Z' },
    ];
    const mockDocuments: Array<{
      id: string; folder_id: string; file_name: string; status: KbStatus; progress: number;
      message: string; item_count: number; block_count?: number; created_at: string; updated_at: string; error?: string;
    }> = [
      { id: 'd-1', folder_id: 'f-1', file_name: 'XX公路招标文件.docx', status: 'success', progress: 100, message: '处理完成', item_count: 128, block_count: 45, created_at: '2026-06-01T10:05:00Z', updated_at: '2026-06-01T10:30:00Z' },
      { id: 'd-2', folder_id: 'f-1', file_name: '招标控制价.pdf', status: 'success', progress: 100, message: '处理完成', item_count: 86, block_count: 32, created_at: '2026-06-02T14:00:00Z', updated_at: '2026-06-02T14:25:00Z' },
      { id: 'd-3', folder_id: 'f-1', file_name: '投标须知.doc', status: 'extracting', progress: 60, message: '正在提取文本', item_count: 0, created_at: '2026-06-20T09:00:00Z', updated_at: '2026-06-20T09:10:00Z' },
      { id: 'd-4', folder_id: 'f-2', file_name: '施工技术方案.md', status: 'success', progress: 100, message: '处理完成', item_count: 54, block_count: 22, created_at: '2026-06-03T11:00:00Z', updated_at: '2026-06-03T11:20:00Z' },
      { id: 'd-5', folder_id: 'f-2', file_name: '安全施工规程.wps', status: 'error', progress: 30, message: '文件格式不支持', item_count: 0, error: '不支持的文档格式', created_at: '2026-06-04T08:00:00Z', updated_at: '2026-06-04T08:05:00Z' },
    ];
    const delay = (ms = 200) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      list: async () => {
        await delay();
        return { folders: mockFolders.map((f) => ({ ...f })), documents: mockDocuments.map((d) => ({ ...d })) };
      },
      createFolder: async (name: string) => {
        await delay();
        const now = new Date().toISOString();
        const folder = { id: newId('f'), name: String(name).trim(), sort_order: mockFolders.length, created_at: now, updated_at: now };
        mockFolders.push(folder);
        return folder;
      },
      renameFolder: async (folderId: string, name: string) => {
        await delay();
        const target = mockFolders.find((f) => f.id === folderId);
        if (!target) return null;
        target.name = String(name).trim();
        target.updated_at = new Date().toISOString();
        return { ...target };
      },
      deleteFolder: async (folderId: string) => {
        await delay();
        const idx = mockFolders.findIndex((f) => f.id === folderId);
        if (idx < 0) return { success: false, message: '文件夹不存在' };
        mockFolders.splice(idx, 1);
        for (let i = mockDocuments.length - 1; i >= 0; i--) {
          if (mockDocuments[i].folder_id === folderId) mockDocuments.splice(i, 1);
        }
        return { success: true, message: '文件夹已删除' };
      },
      uploadDocuments: async (folderId: string) => {
        await delay(500);
        const folder = mockFolders.find((f) => f.id === folderId);
        if (!folder) return { success: false, message: '文件夹不存在' };
        const now = new Date().toISOString();
        const newDoc = {
          id: newId('d'),
          folder_id: folderId,
          file_name: `新文档_${Math.random().toString(36).slice(2, 5)}.docx`,
          status: 'success' as KbStatus,
          progress: 100,
          message: '处理完成',
          item_count: Math.floor(Math.random() * 50) + 10,
          block_count: Math.floor(Math.random() * 20) + 5,
          created_at: now,
          updated_at: now,
        };
        mockDocuments.push(newDoc);
        return { success: true, message: '文档上传成功', documents: [newDoc] };
      },
      deleteDocument: async (documentId: string) => {
        await delay();
        const idx = mockDocuments.findIndex((d) => d.id === documentId);
        if (idx < 0) return { success: false, message: '文档不存在' };
        mockDocuments.splice(idx, 1);
        return { success: true, message: '文档已删除' };
      },
      onEvent: (_callback: (event: any) => void) => {
        return () => {};
      },
    };
  })(),

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
