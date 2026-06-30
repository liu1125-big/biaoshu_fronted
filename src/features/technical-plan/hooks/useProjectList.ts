/**
 * 项目列表 CRUD 状态管理
 */

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { Project, ProjectStatus } from '../types';

interface UseProjectListOptions {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useProjectList({ showToast }: UseProjectListOptions = {}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.projects.list();
      setProjects(data as Project[]);
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '加载项目列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // 初始化时自动加载数据
  useEffect(() => {
    void load();
  }, [load]);

  const create = useCallback(async (name: string, tenderFileName?: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    setCreating(true);
    try {
      const newProject = await apiClient.projects.create({ name: name.trim(), tender_file_name: tenderFileName });
      setProjects((prev) => [...prev, newProject as Project]);
      return newProject as Project;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '创建项目失败', 'error');
      return null;
    } finally {
      setCreating(false);
    }
  }, [showToast]);

  const rename = useCallback(async (id: string, name: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    try {
      const updated = await apiClient.projects.update(id, { name: name.trim() });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name: name.trim() } : p))
      );
      return updated as Project;
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
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
      return updated as Project;
    } catch (err) {
      showToast?.(err instanceof Error ? err.message : '更新状态失败', 'error');
      return null;
    }
  }, [showToast]);

  return {
    projects,
    loading,
    creating,
    load,
    create,
    rename,
    remove,
    updateStatus,
  };
}