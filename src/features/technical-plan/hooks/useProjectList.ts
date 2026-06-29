import { useCallback, useState } from 'react';
import type { Project } from '../types';

// Mock 数据
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'XX 公路工程标书',
    status: 'in-progress',
    created_at: '2024-01-15 10:30:00',
    updated_at: '2024-01-20 14:22:00',
    tender_file_name: '招标文件.docx',
    outline_section_count: 8,
    content_word_count: 12500,
  },
  {
    id: '2',
    name: '智慧城市建设项目',
    status: 'draft',
    created_at: '2024-01-18 09:00:00',
    updated_at: '2024-01-18 09:00:00',
  },
];

interface UseProjectListOptions {
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useProjectList({ showToast }: UseProjectListOptions = {}) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const create = useCallback(async (name: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 200));
    const newProject: Project = {
      id: Date.now().toString(),
      name: name.trim(),
      status: 'draft',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setProjects((prev) => [...prev, newProject]);
    setCreating(false);
    return newProject;
  }, []);

  const rename = useCallback(async (id: string, name: string): Promise<Project | null> => {
    if (!name.trim()) return null;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: name.trim(), updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : p
      )
    );
    return projects.find((p) => p.id === id) || null;
  }, [projects]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    return true;
  }, []);

  return {
    projects,
    loading,
    creating,
    renamingId: null,
    deletingId: null,
    load,
    create,
    rename,
    remove,
  };
}