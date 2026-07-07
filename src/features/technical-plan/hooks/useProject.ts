/**
 * 项目详情状态管理
 */
import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { Project } from '../types';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await apiClient.projects.get(projectId);
      setProject(data);
    } catch (err) {
      console.error('获取项目详情失败', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  return { project, loading, reload: load };
}
