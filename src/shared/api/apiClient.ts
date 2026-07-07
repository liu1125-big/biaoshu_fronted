/**
 * API 请求统一入口(封装axios)
 */

import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import type { UserProfile, LoginResponse } from '../../features/auth/types';

const http = axios.create({
  timeout: 300000,
});

// Token 存储 key
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
};

// 请求拦截器 - 自动带上 Authorization header
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 是否正在刷新 token
let isRefreshing = false;
// 等待刷新完成的请求队列
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

// 响应拦截器 - 处理 401 错误并刷新 token
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是 401 错误且不是刷新请求
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 等待刷新完成
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(http(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const response = await http.post(ENDPOINTS.AUTH_REFRESH, {
          refresh_token: refreshToken,
        });

        if (response.data.code !== 0) throw new Error(response.data.message);

        const { access_token } = response.data.data;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);

        onTokenRefreshed(access_token);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return http(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // 刷新失败，清除所有 token，跳转到登录页
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  markdown: {
    convert: async (formData: FormData): Promise<{ filename: string; markdown: string }> => {
      const { data } = await http.post(ENDPOINTS.MARKDOWN_CONVERT, formData);
      if (data.code !== 200) throw new Error(data.message || '转换失败');
      return data.data;
    },
  },

  auth: {
    login: async (username: string, password: string): Promise<LoginResponse> => {
      // Mock 数据
      const mockLogin = (): LoginResponse => {
        const mockUser = { id: '1', username: username || 'admin', name: '管理员', status: 'enabled', roles: [{ id: '1', code: 'admin', name: '系统管理员', status: 'enabled' }] };
        return { access_token: 'mock_token_' + Date.now(), refresh_token: 'mock_refresh_' + Date.now(), token_type: 'Bearer', expires_in: 3600, user: mockUser };
      };

      try {
        const response = await http.post(ENDPOINTS.AUTH_LOGIN, { username, password });
        const data = response.data;
        if (data.code !== 0) throw new Error(data.message || '登录失败');
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refresh_token);
        return data.data;
      } catch (err: unknown) {
        // 网络错误或500时使用 mock 兜底
        if (axios.isAxiosError(err) && (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED' || !err.response || err.response?.status === 500)) {
          console.warn('[Mock] 登录接口不可用，使用 mock 数据');
          const mockData = mockLogin();
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, mockData.access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, mockData.refresh_token);
          return mockData;
        }
        if (axios.isAxiosError(err)) {
          const responseData = err.response?.data;
          if (responseData?.message) throw new Error(responseData.message);
          if (responseData?.detail) {
            const detail = responseData.detail;
            if (Array.isArray(detail) && detail[0]?.msg) throw new Error(detail[0].msg);
            else if (typeof detail === 'string') throw new Error(detail);
          }
        }
        if (err instanceof Error) throw err;
        throw new Error('登录失败');
      }
    },
    logout: async () => {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      try {
        const response = await http.post(ENDPOINTS.AUTH_LOGOUT, {
          refresh_token: refreshToken,
        });
        if (response.data.code !== 0) throw new Error(response.data.message || '退出登录失败');
      } catch (err: unknown) {
        // 即使接口失败，也清除本地 token
        if (axios.isAxiosError(err)) {
          const responseData = err.response?.data;
          if (responseData?.message) {
            throw new Error(responseData.message);
          }
          if (responseData?.detail) {
            const detail = responseData.detail;
            if (Array.isArray(detail) && detail[0]?.msg) {
              throw new Error(detail[0].msg);
            } else if (typeof detail === 'string') {
              throw new Error(detail);
            }
          }
        }
        if (err instanceof Error) throw err;
        throw new Error('退出登录失败');
      } finally {
        // 清除 token
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    },
    me: async () => {
      try {
        const response = await http.get(ENDPOINTS.AUTH_ME);
        if (response.data.code !== 0) throw new Error(response.data.message || '获取用户信息失败');
        return response.data.data;
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const responseData = err.response?.data;
          if (responseData?.message) {
            throw new Error(responseData.message);
          }
          if (responseData?.detail) {
            const detail = responseData.detail;
            if (Array.isArray(detail) && detail[0]?.msg) {
              throw new Error(detail[0].msg);
            } else if (typeof detail === 'string') {
              throw new Error(detail);
            }
          }
        }
        if (err instanceof Error) throw err;
        throw new Error('获取用户信息失败');
      }
    },
  },

  projects: (() => {
    type ProjectData = {
      id: string;
      name: string;
      status: string;
      created_at: string;
      updated_at: string;
      tender_file_name?: string;
      outline_section_count?: number;
      content_word_count?: number;
    };

    const mockProjects: ProjectData[] = [
      {
        id: 'proj-1',
        name: '智慧城市投标文件',
        status: 'in-progress',
        created_at: '2026-07-01T10:00:00Z',
        updated_at: '2026-07-06T09:30:00Z',
        tender_file_name: '智慧城市建设方案.pdf',
        outline_section_count: 12,
        content_word_count: 8500,
      },
      {
        id: 'proj-2',
        name: '数据中心建设项目',
        status: 'draft',
        created_at: '2026-07-03T14:20:00Z',
        updated_at: '2026-07-03T14:20:00Z',
        tender_file_name: '数据中心技术方案.docx',
        outline_section_count: 0,
        content_word_count: 0,
      },
      {
        id: 'proj-3',
        name: '医院信息化系统',
        status: 'completed',
        created_at: '2026-06-15T08:00:00Z',
        updated_at: '2026-06-28T16:45:00Z',
        tender_file_name: '医院信息化投标书.pdf',
        outline_section_count: 15,
        content_word_count: 12000,
      },
    ];

    const delay = (ms = 300) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
      list: async () => {
        await delay();
        return [...mockProjects];
      },
      create: async (payload: { name: string; tender_file_name?: string }) => {
        await delay();
        const now = new Date().toISOString();
        const newProject: ProjectData = {
          id: newId('proj'),
          name: payload.name,
          status: 'draft',
          created_at: now,
          updated_at: now,
          tender_file_name: payload.tender_file_name,
          outline_section_count: 0,
          content_word_count: 0,
        };
        mockProjects.push(newProject);
        return newProject;
      },
      get: async (projectId: string) => {
        await delay();
        const project = mockProjects.find((p) => p.id === projectId);
        if (!project) throw new Error('项目不存在');
        return { ...project };
      },
      update: async (projectId: string, payload: { name?: string; status?: string; tender_file_name?: string; outline_section_count?: number; content_word_count?: number }) => {
        await delay();
        const project = mockProjects.find((p) => p.id === projectId);
        if (!project) throw new Error('项目不存在');
        Object.assign(project, payload, { updated_at: new Date().toISOString() });
        return { ...project };
      },
      delete: async (projectId: string) => {
        await delay();
        const idx = mockProjects.findIndex((p) => p.id === projectId);
        if (idx < 0) throw new Error('项目不存在');
        mockProjects.splice(idx, 1);
        return { success: true };
      },
    };
  })(),

  user: {
    getProfile: async (userId: string): Promise<UserProfile> => {
      const { data } = await http.get(ENDPOINTS.USER_PROFILE.replace('{user_id}', userId));
      if (data.code !== 200) throw new Error(data.message || '获取用户信息失败');
      return data.data;
    },
    updateProfile: async (userId: string, payload: Partial<UserProfile>) => {
      const { data } = await http.put(ENDPOINTS.USER_UPDATE.replace('{user_id}', userId), payload);
      if (data.code !== 200) throw new Error(data.message || '更新用户信息失败');
      return data.data;
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

  // ============ Admin RBAC ============
  admin: {
    // 用户管理
    users: {
      list: async (params?: {
        page?: number;
        page_size?: number;
        keyword?: string | null;
        status?: string | null;
        role?: string | null;
        sort_by?: string | null;
        sort_order?: 'asc' | 'desc';
      }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.page_size) searchParams.set('page_size', String(params.page_size));
        if (params?.keyword) searchParams.set('keyword', params.keyword);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.role) searchParams.set('role', params.role);
        if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
        if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
        const query = searchParams.toString();
        const { data } = await http.get(`${ENDPOINTS.USERS}${query ? `?${query}` : ''}`);
        if (data.code !== 0) throw new Error(data.message || '获取用户列表失败');
        return data.data;
      },
      get: async (userId: string) => {
        const { data } = await http.get(ENDPOINTS.USER_PROFILE.replace('{user_id}', userId));
        if (data.code !== 0) throw new Error(data.message || '获取用户详情失败');
        return data.data;
      },
    },

    // 角色管理
    roles: {
      list: async (params?: {
        page?: number;
        page_size?: number;
        keyword?: string | null;
        status?: string | null;
        sort_by?: string | null;
        sort_order?: 'asc' | 'desc';
      }) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set('page', String(params.page));
        if (params?.page_size) searchParams.set('page_size', String(params.page_size));
        if (params?.keyword) searchParams.set('keyword', params.keyword);
        if (params?.status) searchParams.set('status', params.status);
        if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
        if (params?.sort_order) searchParams.set('sort_order', params.sort_order);
        const query = searchParams.toString();
        const { data } = await http.get(`${ENDPOINTS.ROLES}${query ? `?${query}` : ''}`);
        if (data.code !== 0) throw new Error(data.message || '获取角色列表失败');
        return data.data;
      },
      get: async (roleId: string) => {
        const { data } = await http.get(`${ENDPOINTS.ROLES}/${roleId}`);
        if (data.code !== 0) throw new Error(data.message || '获取角色详情失败');
        return data.data;
      },
    },

    // 权限管理
    permissions: {
      list: async () => {
        const { data } = await http.get(ENDPOINTS.PERMISSIONS);
        if (data.code !== 0) throw new Error(data.message || '获取权限列表失败');
        return data.data;
      },
    },

    // 菜单管理
    menus: {
      tree: async () => {
        const { data } = await http.get(ENDPOINTS.MENUS);
        if (data.code !== 0) throw new Error(data.message || '获取菜单树失败');
        return data.data;
      },
    },
  },
};
