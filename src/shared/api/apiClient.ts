/**
 * API 请求统一入口(封装axios)
 */

import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const http = axios.create({ timeout: 300000 });

export const apiClient = {
  markdown: {
    convert: async (formData: FormData): Promise<{ filename: string; markdown: string }> => {
      const { data } = await http.post(ENDPOINTS.MARKDOWN_CONVERT, formData);
      if (data.code !== 200) throw new Error(data.message || '转换失败');
      return data.data;
    },
  },

  projects: {
    list: async () => {
      const { data } = await http.get(ENDPOINTS.PROJECTS);
      // 后端直接返回数组，无需包装
      return data as Array<{
        id: string;
        name: string;
        status: string;
        created_at: string;
        updated_at: string;
        tender_file_name?: string;
        outline_section_count?: number;
        content_word_count?: number;
      }>;
    },
    create: async (payload: { name: string; tender_file_name?: string }) => {
      const { data } = await http.post(ENDPOINTS.PROJECTS, payload);
      return data;
    },
    get: async (projectId: string) => {
      const { data } = await http.get(ENDPOINTS.PROJECT.replace('{project_id}', projectId));
      return data;
    },
    update: async (projectId: string, payload: { name?: string; status?: string; tender_file_name?: string; outline_section_count?: number; content_word_count?: number }) => {
      const { data } = await http.put(ENDPOINTS.PROJECT.replace('{project_id}', projectId), payload);
      return data;
    },
    delete: async (projectId: string) => {
      const { data } = await http.delete(ENDPOINTS.PROJECT.replace('{project_id}', projectId));
      return data;
    },
  },

  knowledgeBase: (() => {
    type KbStatus = 'pending' | 'copying' | 'converting' | 'extracting' | 'ready_for_matching' | 'matching' | 'recovering' | 'analyzing' | 'saving' | 'success' | 'error';
    type KbAuditStatus = 'pending_review' | 'published' | 'deprecated';
    type KbTag = '企业介绍' | '资质证照' | '项目案例' | '技术方案' | '商务条款';

    const mockFolders: Array<{ id: string; name: string; sort_order: number; tags?: KbTag[]; created_at: string; updated_at: string }> = [
      { id: 'f-1', name: '招标文件', sort_order: 0, tags: ['商务条款'], created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-20T14:30:00Z' },
      { id: 'f-2', name: '技术规范', sort_order: 1, tags: ['技术方案'], created_at: '2026-06-02T09:00:00Z', updated_at: '2026-06-21T11:00:00Z' },
      { id: 'f-3', name: '企业资质', sort_order: 2, tags: ['企业介绍', '资质证照'], created_at: '2026-06-03T09:00:00Z', updated_at: '2026-06-22T11:00:00Z' },
      { id: 'f-4', name: '成功案例', sort_order: 3, tags: ['项目案例'], created_at: '2026-06-04T09:00:00Z', updated_at: '2026-06-23T11:00:00Z' },
    ];
    const mockDocuments: Array<{
      id: string; folder_id: string; file_name: string; status: KbStatus; progress: number;
      message: string; item_count: number; block_count?: number; created_at: string; updated_at: string; error?: string;
      tags?: KbTag[]; audit_status?: KbAuditStatus; source?: string; batch_number?: string; version?: number;
    }> = [
      { id: 'd-1', folder_id: 'f-1', file_name: 'XX公路招标文件.docx', status: 'success', progress: 100, message: '处理完成', item_count: 128, block_count: 45, tags: ['商务条款'], audit_status: 'published', source: '客户提供的正式招标文件', batch_number: 'PC-2026-001', version: 2, created_at: '2026-06-01T10:05:00Z', updated_at: '2026-06-01T10:30:00Z' },
      { id: 'd-2', folder_id: 'f-1', file_name: '招标控制价.pdf', status: 'success', progress: 100, message: '处理完成', item_count: 86, block_count: 32, tags: ['商务条款'], audit_status: 'published', source: '招标代理提供', batch_number: 'PC-2026-001', version: 1, created_at: '2026-06-02T14:00:00Z', updated_at: '2026-06-02T14:25:00Z' },
      { id: 'd-3', folder_id: 'f-1', file_name: '投标须知.doc', status: 'extracting', progress: 60, message: '正在提取文本', item_count: 0, tags: ['商务条款'], audit_status: 'pending_review', source: '历史积累文档', batch_number: 'PC-2026-002', created_at: '2026-06-20T09:00:00Z', updated_at: '2026-06-20T09:10:00Z' },
      { id: 'd-4', folder_id: 'f-2', file_name: '施工技术方案.md', status: 'success', progress: 100, message: '处理完成', item_count: 54, block_count: 22, tags: ['技术方案'], audit_status: 'published', source: '技术部门撰写', batch_number: 'TS-2026-003', version: 3, created_at: '2026-06-03T11:00:00Z', updated_at: '2026-06-03T11:20:00Z' },
      { id: 'd-5', folder_id: 'f-2', file_name: '安全施工规程.wps', status: 'error', progress: 30, message: '文件格式不支持', item_count: 0, tags: ['技术方案'], audit_status: 'deprecated', error: '不支持的文档格式', created_at: '2026-06-04T08:00:00Z', updated_at: '2026-06-04T08:05:00Z' },
      { id: 'd-6', folder_id: 'f-3', file_name: '公司介绍.pdf', status: 'success', progress: 100, message: '处理完成', item_count: 45, block_count: 18, tags: ['企业介绍'], audit_status: 'published', source: '市场部提供', batch_number: 'CO-2026-001', version: 1, created_at: '2026-06-05T10:00:00Z', updated_at: '2026-06-05T10:30:00Z' },
      { id: 'd-7', folder_id: 'f-3', file_name: 'ISO认证证书.docx', status: 'success', progress: 100, message: '处理完成', item_count: 32, block_count: 12, tags: ['资质证照'], audit_status: 'published', source: '资质部门', batch_number: 'CO-2026-002', version: 2, created_at: '2026-06-06T14:00:00Z', updated_at: '2026-06-06T14:25:00Z' },
      { id: 'd-8', folder_id: 'f-4', file_name: '智慧城市案例.docx', status: 'success', progress: 100, message: '处理完成', item_count: 98, block_count: 35, tags: ['项目案例', '技术方案'], audit_status: 'published', source: '项目部整理', batch_number: 'CS-2026-001', version: 1, created_at: '2026-06-07T11:00:00Z', updated_at: '2026-06-07T11:20:00Z' },
      { id: 'd-9', folder_id: 'f-4', file_name: 'PPP项目案例.pdf', status: 'pending', progress: 0, message: '等待审核', item_count: 0, tags: ['项目案例', '商务条款'], audit_status: 'pending_review', source: '市场部收集', batch_number: 'CS-2026-002', created_at: '2026-06-20T09:00:00Z', updated_at: '2026-06-20T09:10:00Z' },
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onEvent: (_callback: (arg: any) => void) => {
        return () => {};
      },
    };
  })(),
};
