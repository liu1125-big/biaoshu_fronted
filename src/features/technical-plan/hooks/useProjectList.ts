/**
 * 项目列表 CRUD 状态管理
 */
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { Project, ProjectListResponse, ProjectStatus } from '../types';

interface UseProjectListOptions {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useProjectList({ showToast }: UseProjectListOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState({ page: 1, page_size: 20, total: 0 });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', status: '', owner_id: '', start_date: '', end_date: '' });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data: ProjectListResponse = await apiClient.projects.list({ page, page_size: 20, ...filters });
      setProjects(data.items);
      setPagination(data.pagination);
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '加载项目列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (name: string, bidDeadline?: string, description?: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    setCreating(true);
    try {
      const newProject = await apiClient.projects.create({ name: name.trim(), bid_deadline: bidDeadline, description });
      setProjects((prev) => [...prev, newProject]);
      void load(1);
      return newProject;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '创建项目失败', 'error');
      return null;
    } finally {
      setCreating(false);
    }
  }, [load, showToast]);

  const rename = useCallback(async (id: string, name: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    try {
      const updated = await apiClient.projects.update(id, { name: name.trim() });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p)));
      return updated;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '重命名失败', 'error');
      return null;
    }
  }, [showToast]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.projects.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '删除失败', 'error');
      return false;
    }
  }, [showToast]);

  const updateStatus = useCallback(async (id: string, status: ProjectStatus): Promise<Project | null> => {
    try {
      const updated = await apiClient.projects.update(id, { status });
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      return updated;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '更新状态失败', 'error');
      return null;
    }
  }, [showToast]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const pageChange = useCallback((page: number) => { void load(page); }, [load]);

  return { projects, pagination, loading, creating, filters, load, create, rename, remove, updateStatus, setFilter, pageChange };
}
