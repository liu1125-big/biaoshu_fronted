import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import { isLibreOfficeRequiredMessage } from '../../../shared/ui';
import type { KnowledgeBaseIndex, KnowledgeBaseMigrationStatus, KnowledgeDocument } from '../types';
import { documentRenderBatchSize, emptyDocuments, emptyIndex } from '../utils/constants';
import { canMoveKnowledgeDocument, mergeDocuments } from '../utils/helpers';

interface UseKnowledgeBaseOptions {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  showDocumentParseNotice: (message: string) => void;
  onDocumentUpdate?: (document: KnowledgeDocument) => void;
}

export function useKnowledgeBase({ showToast, showDocumentParseNotice, onDocumentUpdate }: UseKnowledgeBaseOptions) {
  const [index, setIndex] = useState<KnowledgeBaseIndex>(emptyIndex);
  const [activeFolderId, setActiveFolderId] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [pendingMigrationStatus, setPendingMigrationStatus] = useState<KnowledgeBaseMigrationStatus | null>(null);
  const [developerMode, setDeveloperMode] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [retryingDocumentIds, setRetryingDocumentIds] = useState<Set<string>>(() => new Set());
  const [visibleDocumentCount, setVisibleDocumentCount] = useState(documentRenderBatchSize);
  const autoMatchingIdsRef = useRef(new Set<string>());
  const documentParseNoticeIdsRef = useRef(new Set<string>());
  const onDocumentUpdateRef = useRef(onDocumentUpdate);
  onDocumentUpdateRef.current = onDocumentUpdate;

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
  const visibleDocuments = documents.slice(0, Math.min(visibleDocumentCount, documents.length));

  const applyKnowledgeIndex = useCallback((data: KnowledgeBaseIndex) => {
    setIndex(data);
    setActiveFolderId((currentId) => (
      data.folders.some((folder) => folder.id === currentId) ? currentId : data.folders[0]?.id || ''
    ));
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setListLoading(true);
      setDeveloperMode(false);
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

  const startMatching = useCallback(async (documentId: string, batchSize: number, options?: { silent?: boolean }) => {
    if (migrationRunning) {
      if (!options?.silent) showToast('知识库迁移中，请稍候', 'info');
      return;
    }
    try {
      const result = await apiClient.knowledgeBase.startMatching(documentId, batchSize);
      if (!options?.silent) {
        showToast(result?.message || '已提交匹配任务', result?.success ? 'success' : 'info');
      }
    } catch (error) {
      if (!options?.silent) {
        showToast(error instanceof Error ? error.message : '启动段落匹配失败', 'error');
      }
    }
  }, [migrationRunning, showToast]);

  const createFolder = useCallback(async () => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
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
  }, [migrationRunning, newFolderName, showToast]);

  const uploadDocuments = useCallback(async () => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
    if (!activeFolder) {
      showToast('请先创建文件夹', 'info');
      return;
    }
    try {
      setLoading(true);
      const result = await apiClient.knowledgeBase.uploadDocuments(activeFolder.id);
      if (!result?.success) {
        const message = result?.message || '未选择文档';
        if (isLibreOfficeRequiredMessage(message)) {
          showDocumentParseNotice(message);
          return;
        }
        showToast(message, 'info');
        return;
      }
      if (result.documents?.length) {
        setIndex((prev) => ({ ...prev, documents: mergeDocuments(prev.documents, result.documents || []) }));
      }
      showToast(result.message, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传文档失败';
      if (isLibreOfficeRequiredMessage(message)) {
        showDocumentParseNotice(message);
        return;
      }
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [migrationRunning, activeFolder, showToast, showDocumentParseNotice]);

  const renameFolder = useCallback(async (folderId: string, currentName: string) => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
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
  }, [migrationRunning, showToast]);

  const deleteFolder = useCallback(async (folderId: string, folderName: string) => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
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
  }, [migrationRunning, documentsByFolder, index.folders, index.documents, activeFolderId, showToast]);

  const deleteDocument = useCallback(async (document: KnowledgeDocument) => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
    if (!window.confirm(`确定删除文档"${document.file_name}"吗？`)) return;
    try {
      const result = await apiClient.knowledgeBase.deleteDocument(document.id);
      setIndex((prev) => ({ ...prev, documents: prev.documents.filter((item) => item.id !== document.id) }));
      showToast(result?.message || '文档已删除', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '删除文档失败', 'error');
    }
  }, [migrationRunning, showToast]);

  const retryDocument = useCallback(async (document: KnowledgeDocument) => {
    if (migrationRunning) {
      showToast('知识库迁移中，请稍候', 'info');
      return;
    }
    setRetryingDocumentIds((prev) => new Set(prev).add(document.id));
    try {
      const result = await apiClient.knowledgeBase.retryDocument(document.id);
      if (result?.document) {
        const updatedDocument: KnowledgeDocument = result.document;
        setIndex((prev) => ({ ...prev, documents: mergeDocuments(prev.documents, [updatedDocument]) }));
        onDocumentUpdateRef.current?.(updatedDocument);
      }
      if (!result?.success) {
        const message = result?.message || '重试失败';
        if (isLibreOfficeRequiredMessage(message)) {
          showDocumentParseNotice(message);
          return;
        }
        showToast(message, 'info');
        return;
      }
      showToast(result.message || '已重新开始解析', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : '重试失败';
      if (isLibreOfficeRequiredMessage(message)) {
        showDocumentParseNotice(message);
        return;
      }
      showToast(message, 'error');
    } finally {
      setRetryingDocumentIds((prev) => {
        const next = new Set(prev);
        next.delete(document.id);
        return next;
      });
    }
  }, [migrationRunning, showToast, showDocumentParseNotice]);

  const cancelMigration = useCallback(() => {
    if (migrationRunning) return;
    setMigrationDialogOpen(false);
    setPendingMigrationStatus(null);
    showToast('已暂缓知识库迁移，下次进入知识库会继续提示', 'info');
  }, [migrationRunning, showToast]);

  const confirmMigration = useCallback(async () => {
    if (migrationRunning) return;
    setMigrationRunning(true);
    setLoading(true);
    try {
      const result = await apiClient.knowledgeBase.migrateLegacy();
      if (!result?.success) {
        throw new Error(result?.message || '知识库迁移失败');
      }
      const data = result.index;
      const fallback = await apiClient.knowledgeBase.list();
      if (data && typeof data === 'object' && Array.isArray(data.folders)) {
        applyKnowledgeIndex(data);
      } else if (fallback && typeof fallback === 'object' && Array.isArray(fallback.folders)) {
        applyKnowledgeIndex(fallback);
      } else {
        throw new Error('知识库迁移完成，但读取迁移结果失败');
      }
      setPendingMigrationStatus(null);
      setMigrationDialogOpen(false);
      showToast(result.message || '知识库迁移完成', result.cleanupPending ? 'info' : 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '知识库迁移失败', 'error');
    } finally {
      setMigrationRunning(false);
      setLoading(false);
    }
  }, [migrationRunning, applyKnowledgeIndex, showToast]);

  // SSE event listener + initial load
  useEffect(() => {
    void loadInitialData();
    const unsubscribe = apiClient.knowledgeBase.onEvent((event: { document: KnowledgeDocument }) => {
      const { document } = event;
      const parseMessage = document.error || document.message;
      if (document.status === 'error'
        && isLibreOfficeRequiredMessage(parseMessage)
        && !documentParseNoticeIdsRef.current.has(document.id)) {
        documentParseNoticeIdsRef.current.add(document.id);
        showDocumentParseNotice(parseMessage);
      }
      setIndex((prev) => ({
        ...prev,
        documents: prev.documents.some((item) => item.id === document.id)
          ? prev.documents.map((item) => (item.id === document.id ? document : item))
          : [...prev.documents, document],
      }));
      onDocumentUpdateRef.current?.(document);
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  // Reset visible count on folder/doc change
  useEffect(() => {
    setVisibleDocumentCount(documentRenderBatchSize);
  }, [activeFolder?.id, documents.length]);

  // Lazy load more documents
  useEffect(() => {
    if (visibleDocumentCount >= documents.length) return undefined;
    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setVisibleDocumentCount((count) => Math.min(count + documentRenderBatchSize, documents.length));
      });
    }, 24);
    return () => window.clearTimeout(timeoutId);
  }, [documents.length, visibleDocumentCount]);

  // Auto-matching
  useEffect(() => {
    if (developerMode) return;
    const pendingDocuments = index.documents.filter(
      (document) => document.status === 'ready_for_matching' && !autoMatchingIdsRef.current.has(document.id)
    );
    pendingDocuments.forEach((document) => {
      autoMatchingIdsRef.current.add(document.id);
      void startMatching(document.id, 20, { silent: true });
    });
  }, [developerMode, index.documents, startMatching]);

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
    migrationRunning,
    migrationDialogOpen,
    pendingMigrationStatus,
    developerMode,
    showCreateFolder,
    newFolderName,
    creatingFolder,
    retryingDocumentIds,
    visibleDocumentCount,
    activeFolder,
    documentsByFolder,
    documents,
    visibleDocuments,
    setIndex,
    setActiveFolderId,
    setShowCreateFolder,
    setNewFolderName,
    setDeveloperMode,
    setMigrationDialogOpen,
    setPendingMigrationStatus,
    loadInitialData,
    applyKnowledgeIndex,
    createFolder,
    uploadDocuments,
    renameFolder,
    deleteFolder,
    deleteDocument,
    retryDocument,
    startMatching,
    cancelMigration,
    confirmMigration,
    autoMatchingIdsRef,
    documentParseNoticeIdsRef,
  };
}
