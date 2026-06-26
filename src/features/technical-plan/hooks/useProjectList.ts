import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type {
  Project,
  ProjectListResult,
  ProjectMutationResult,
} from '../types';

interface UseProjectListOptions {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useProjectList({ showToast }: UseProjectListOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const applyList = useCallback((data: ProjectListResult) => {
    if (data && Array.isArray(data.projects)) {
      setProjects(data.projects);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.projects.list();
      if (data && typeof data === 'object' && Array.isArray(data.projects)) {
        applyList(data);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '读取项目列表失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [applyList, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const upsertProject = useCallback((project: Project) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.id === project.id);
      if (idx < 0) return [...prev, project];
      const next = prev.slice();
      next[idx] = project;
      return next;
    });
  }, []);

  const create = useCallback(async (name: string): Promise<Project | null> => {
    try {
      setCreating(true);
      const result: ProjectMutationResult = await apiClient.projects.create(name);
      if (!result?.success || !result.project) {
        showToast(result?.message || '新建项目失败', 'error');
        return null;
      }
      upsertProject(result.project);
      showToast(result.message || '项目已创建', 'success');
      return result.project;
    } catch (error) {
      showToast(error instanceof Error ? error.message : '新建项目失败', 'error');
      return null;
    } finally {
      setCreating(false);
    }
  }, [showToast, upsertProject]);

  const rename = useCallback(async (id: string, name: string): Promise<Project | null> => {
    try {
      setRenamingId(id);
      const result: ProjectMutationResult = await apiClient.projects.rename(id, name);
      if (!result?.success || !result.project) {
        showToast(result?.message || '重命名失败', 'error');
        return null;
      }
      upsertProject(result.project);
      showToast(result.message || '项目已重命名', 'success');
      return result.project;
    } catch (error) {
      showToast(error instanceof Error ? error.message : '重命名失败', 'error');
      return null;
    } finally {
      setRenamingId(null);
    }
  }, [showToast, upsertProject]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeletingId(id);
      const result: ProjectMutationResult = await apiClient.projects.delete(id);
      if (!result?.success) {
        showToast(result?.message || '删除失败', 'error');
        return false;
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast(result.message || '项目已删除', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除失败', 'error');
      return false;
    } finally {
      setDeletingId(null);
    }
  }, [showToast]);

  return {
    projects,
    loading,
    creating,
    renamingId,
    deletingId,
    load,
    create,
    rename,
    remove,
  };
}
