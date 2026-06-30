/**
 * 知识库状态与操作(CRUD)
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { KnowledgeBaseIndex, KnowledgeDocument } from '../types';
import { emptyDocuments, emptyIndex } from '../utils/constants';
import { mergeDocuments } from '../utils/helpers';

interface UseKnowledgeBaseOptions {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useKnowledgeBase({ showToast }: UseKnowledgeBaseOptions) {
  const [index, setIndex] = useState<KnowledgeBaseIndex>(emptyIndex);
  const [activeFolderId, setActiveFolderId] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  const activeFolder = index.folders.find((folder) => folder.id === activeFolderId) || index.folders[0];

  const documentsByFolder = useMemo(() => {
    const grouped = new Map<string, KnowledgeDocument[]>();
    index.documents.forEach((document) => {
      const folderDocuments = grouped.get(document.folder_id);
      if (folderDocuments) {
        folderDocuments.push(document);
        return;
      }
      grouped.set(document.folder_id, [document]);
    });
    return grouped;
  }, [index.documents]);

  const documents = activeFolder ? documentsByFolder.get(activeFolder.id) || emptyDocuments : emptyDocuments;

  const applyKnowledgeIndex = useCallback((data: KnowledgeBaseIndex) => {
    setIndex(data);
    setActiveFolderId((currentId) => (
      data.folders.some((folder) => folder.id === currentId) ? currentId : data.folders[0]?.id || ''
    ));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setListLoading(true);
      const data: KnowledgeBaseIndex = await apiClient.knowledgeBase.list();
      if (data && typeof data === 'object' && Array.isArray(data.folders) && Array.isArray(data.documents)) {
        setIndex(data);
        setActiveFolderId((currentId) => (
          data.folders.some((folder) => folder.id === currentId) ? currentId : data.folders[0]?.id || ''
        ));
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '读取知识库失败', 'error');
    } finally {
      setLoading(false);
      setListLoading(false);
    }
  }, [showToast]);

  const createFolder = useCallback(async () => {
    const name = newFolderName.trim();
    if (!name) {
      showToast('请输入文件夹名称', 'info');
      return;
    }
    try {
      setCreatingFolder(true);
      const folder = await apiClient.knowledgeBase.createFolder(name.trim());
      if (!folder) return;
      setIndex((prev) => ({ ...prev, folders: [...prev.folders, folder] }));
      setActiveFolderId(folder.id);
      setNewFolderName('');
      setShowCreateFolder(false);
      showToast('文件夹已创建', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '创建文件夹失败', 'error');
    } finally {
      setCreatingFolder(false);
    }
  }, [newFolderName, showToast]);

  const uploadDocuments = useCallback(async () => {
    if (!activeFolder) {
      showToast('请先创建文件夹', 'info');
      return;
    }
    try {
      setLoading(true);
      const result = await apiClient.knowledgeBase.uploadDocuments(activeFolder.id);
      if (!result?.success) {
        showToast(result?.message || '未选择文档', 'info');
        return;
      }
      if (result.documents?.length) {
        setIndex((prev) => ({ ...prev, documents: mergeDocuments(prev.documents, result.documents || []) }));
      }
      showToast(result.message, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '上传文档失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeFolder, showToast]);

  const renameFolder = useCallback(async (folderId: string, currentName: string) => {
    const name = window.prompt('请输入新的文件夹名称', currentName)?.trim();
    if (!name || name === currentName) return;
    try {
      const folder = await apiClient.knowledgeBase.renameFolder(folderId, name);
      if (!folder) return;
      setIndex((prev) => ({
        ...prev,
        folders: prev.folders.map((item) => (item.id === folder.id ? folder : item)),
      }));
      showToast('文件夹已重命名', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '重命名文件夹失败', 'error');
    }
  }, [showToast]);

  const deleteFolder = useCallback(async (folderId: string, folderName: string) => {
    const count = documentsByFolder.get(folderId)?.length || 0;
    if (!window.confirm(`确定删除文件夹"${folderName}"吗？其中 ${count} 个文档也会一起删除。`)) return;
    try {
      const result = await apiClient.knowledgeBase.deleteFolder(folderId);
      const folders = index.folders.filter((item) => item.id !== folderId);
      const docs = index.documents.filter((document) => document.folder_id !== folderId);
      setIndex({ folders, documents: docs });
      if (activeFolderId === folderId) {
        setActiveFolderId(folders[0]?.id || '');
      }
      showToast(result?.message || '文件夹已删除', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除文件夹失败', 'error');
    }
  }, [documentsByFolder, index.folders, index.documents, activeFolderId, showToast]);

  // SSE event listener + initial load
  useEffect(() => {
    void loadInitialData();
    const unsubscribe = apiClient.knowledgeBase.onEvent((event: { document: KnowledgeDocument }) => {
      const { document: doc } = event;
      setIndex((prev) => ({
        ...prev,
        documents: prev.documents.some((item) => item.id === doc.id)
          ? prev.documents.map((item) => (item.id === doc.id ? doc : item))
          : [...prev.documents, doc],
      }));
    });
    return () => {
      unsubscribe?.();
    };
  }, [loadInitialData]);

  // Folder selection fallback
  useEffect(() => {
    if ((!activeFolderId || !index.folders.some((folder) => folder.id === activeFolderId)) && index.folders[0]) {
      setActiveFolderId(index.folders[0].id);
    }
  }, [activeFolderId, index.folders]);

  return {
    index,
    activeFolderId,
    listLoading,
    loading,
    showCreateFolder,
    newFolderName,
    creatingFolder,
    activeFolder,
    documentsByFolder,
    documents,
    setActiveFolderId,
    setShowCreateFolder,
    setNewFolderName,
    loadInitialData,
    applyKnowledgeIndex,
    createFolder,
    uploadDocuments,
    renameFolder,
    deleteFolder,
  };
}
