import { useState, useCallback, type DragEvent } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { KnowledgeBaseIndex, KnowledgeDocument } from '../types';
import { canMoveKnowledgeDocument } from '../utils/helpers';

type DropPosition = 'before' | 'after';
type DragPayload =
  | { kind: 'folder'; folderId: string }
  | { kind: 'document'; documentId: string; folderId: string };

interface DocumentDropTarget {
  documentId: string;
  position: DropPosition;
}

interface UseKnowledgeBaseDragOptions {
  migrationRunning: boolean;
  applyKnowledgeIndex: (data: KnowledgeBaseIndex) => void;
  setActiveFolderId: (id: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useKnowledgeBaseDrag({ migrationRunning, applyKnowledgeIndex, setActiveFolderId, showToast }: UseKnowledgeBaseDragOptions) {
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [folderDropTargetId, setFolderDropTargetId] = useState<string | null>(null);
  const [documentDropTarget, setDocumentDropTarget] = useState<DocumentDropTarget | null>(null);
  const [dragSaving, setDragSaving] = useState(false);

  const clearDragState = useCallback(() => {
    setDragPayload(null);
    setFolderDropTargetId(null);
    setDocumentDropTarget(null);
  }, []);

  const getDropPosition = useCallback((event: DragEvent<HTMLElement>): DropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? 'before' : 'after';
  }, []);

  const startFolderDrag = useCallback((event: DragEvent<HTMLElement>, folderId: string) => {
    if (migrationRunning || dragSaving) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `folder:${folderId}`);
    setDragPayload({ kind: 'folder', folderId });
  }, [migrationRunning, dragSaving]);

  const startDocumentDrag = useCallback((event: DragEvent<HTMLElement>, document: KnowledgeDocument) => {
    if (migrationRunning || dragSaving || !canMoveKnowledgeDocument(document)) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `document:${document.id}`);
    setDragPayload({ kind: 'document', documentId: document.id, folderId: document.folder_id });
  }, [migrationRunning, dragSaving]);

  const handleFolderDragOver = useCallback((event: DragEvent<HTMLElement>, folderId: string) => {
    if (!dragPayload || migrationRunning || dragSaving) return;
    if (dragPayload.kind === 'folder' && dragPayload.folderId === folderId) return;
    if (dragPayload.kind === 'document' && dragPayload.folderId === folderId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setFolderDropTargetId(folderId);
    setDocumentDropTarget(null);
  }, [dragPayload, migrationRunning, dragSaving]);

  const handleFolderDrop = useCallback(async (event: DragEvent<HTMLElement>, folderId: string) => {
    if (!dragPayload || migrationRunning || dragSaving) return;
    event.preventDefault();
    const payload = dragPayload;
    const position = getDropPosition(event);
    setDragSaving(true);
    try {
      const result = payload.kind === 'folder'
        ? await apiClient.knowledgeBase.reorderFolder(payload.folderId, folderId, position)
        : await apiClient.knowledgeBase.moveDocument(payload.documentId, folderId, null, 'after');
      if (!result?.success || !result.index) {
        throw new Error(result?.message || '拖拽操作失败');
      }
      applyKnowledgeIndex(result.index);
      showToast(result.message, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '拖拽操作失败', 'error');
    } finally {
      setDragSaving(false);
      clearDragState();
    }
  }, [dragPayload, migrationRunning, dragSaving, getDropPosition, applyKnowledgeIndex, clearDragState, showToast]);

  const handleDocumentDragOver = useCallback((event: DragEvent<HTMLElement>, document: KnowledgeDocument) => {
    if (!dragPayload || dragPayload.kind !== 'document' || migrationRunning || dragSaving || dragPayload.documentId === document.id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setFolderDropTargetId(null);
    setDocumentDropTarget({ documentId: document.id, position: getDropPosition(event) });
  }, [dragPayload, migrationRunning, dragSaving, getDropPosition]);

  const handleDocumentDrop = useCallback(async (event: DragEvent<HTMLElement>, document: KnowledgeDocument) => {
    if (!dragPayload || dragPayload.kind !== 'document' || migrationRunning || dragSaving || dragPayload.documentId === document.id) return;
    event.preventDefault();
    const position = getDropPosition(event);
    setDragSaving(true);
    try {
      const result = await apiClient.knowledgeBase.moveDocument(dragPayload.documentId, document.folder_id, document.id, position);
      if (!result?.success || !result.index) {
        throw new Error(result?.message || '文档排序失败');
      }
      applyKnowledgeIndex(result.index);
      setActiveFolderId(document.folder_id);
      showToast(result.message, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '文档排序失败', 'error');
    } finally {
      setDragSaving(false);
      clearDragState();
    }
  }, [dragPayload, migrationRunning, dragSaving, getDropPosition, applyKnowledgeIndex, setActiveFolderId, clearDragState, showToast]);

  return {
    dragPayload,
    folderDropTargetId,
    documentDropTarget,
    dragSaving,
    clearDragState,
    startFolderDrag,
    startDocumentDrag,
    handleFolderDragOver,
    handleFolderDrop,
    handleDocumentDragOver,
    handleDocumentDrop,
  };
}
