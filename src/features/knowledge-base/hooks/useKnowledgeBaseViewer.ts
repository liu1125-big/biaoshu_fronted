import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import type { KnowledgeAnalysisSnapshot, KnowledgeDocument, KnowledgeItem } from '../types';
import { createRenderDebugTrace, finishRenderDebugTrace, logRenderDebug, nowMs, roundMs, updateTraceContentMetrics, updateTraceItemsMetrics, type RenderDebugTrace } from '../utils/renderDebug';

export type KnowledgeViewerMode = 'analysis' | 'items' | 'markdown';

export interface KnowledgeViewer {
  document: KnowledgeDocument;
  mode: KnowledgeViewerMode;
}

interface UseKnowledgeBaseViewerOptions {
  developerMode: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useKnowledgeBaseViewer({ developerMode, showToast }: UseKnowledgeBaseViewerOptions) {
  const [viewer, setViewer] = useState<KnowledgeViewer | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerTrace, setViewerTrace] = useState<RenderDebugTrace | null>(null);
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [itemsPreview, setItemsPreview] = useState<KnowledgeItem[]>([]);
  const [analysisSnapshot, setAnalysisSnapshot] = useState<KnowledgeAnalysisSnapshot | null>(null);
  const [batchSize, setBatchSize] = useState(20);
  const [startingMatching, setStartingMatching] = useState(false);
  const viewerRequestIdRef = useRef(0);
  const viewerTraceRef = useRef<RenderDebugTrace | null>(null);

  // Reset viewer when developer mode turns off and mode was analysis
  useEffect(() => {
    if (!developerMode && viewer?.mode === 'analysis') {
      viewerRequestIdRef.current += 1;
      setViewer(null);
      setViewerLoading(false);
      setAnalysisSnapshot(null);
    }
  }, [developerMode, viewer?.mode]);

  const loadAnalysis = useCallback(async (documentId: string, options?: { silent?: boolean }) => {
    try {
      const data = await apiClient.knowledgeBase.readAnalysis(documentId);
      if (data) setAnalysisSnapshot(data);
    } catch (error) {
      if (!options?.silent) {
        showToast(error instanceof Error ? error.message : '读取分析结果失败', 'error');
      }
    }
  }, [showToast]);

  // Auto-refresh analysis when viewer document changes
  useEffect(() => {
    if (viewer?.mode === 'analysis') {
      void loadAnalysis(viewer.document.id, { silent: true });
    }
  }, [viewer?.document.id, viewer?.document.status, viewer?.mode, loadAnalysis]);

  const finishActiveViewerTrace = useCallback((reason: string, payload: Record<string, unknown> = {}) => {
    finishRenderDebugTrace(viewerTraceRef.current, reason, payload);
    viewerTraceRef.current = null;
    setViewerTrace(null);
  }, []);

  const createViewerTrace = useCallback((document: KnowledgeDocument, mode: KnowledgeViewerMode, requestId: number) => {
    finishActiveViewerTrace('viewer-trace-replaced', { nextMode: mode, requestId });
    if (!developerMode || mode === 'analysis') {
      return null;
    }
    const kind = mode === 'markdown' ? 'document-markdown' as const : 'document-items' as const;
    const trace = createRenderDebugTrace(kind, document, '');
    viewerTraceRef.current = trace;
    setViewerTrace(trace);
    logRenderDebug(trace, 'click:open-document', {
      mode,
      requestId,
      status: document.status,
      itemCount: document.item_count || 0,
      blockCount: document.block_count || 0,
      filteredBlockCount: document.filtered_block_count || 0,
      candidateItemCount: document.candidate_item_count || 0,
    });
    return trace;
  }, [developerMode, finishActiveViewerTrace]);

  const openDocument = useCallback(async (document: KnowledgeDocument, mode: KnowledgeViewerMode) => {
    if (mode === 'analysis' && !developerMode) {
      return;
    }
    const requestId = viewerRequestIdRef.current + 1;
    viewerRequestIdRef.current = requestId;
    const trace = createViewerTrace(document, mode, requestId);
    setViewerLoading(mode !== 'analysis');
    logRenderDebug(trace, 'state:loading-start', { loading: mode !== 'analysis' });
    startTransition(() => {
      setViewer({ document, mode });
      setMarkdownPreview('');
      setItemsPreview([]);
      if (mode === 'analysis') {
        setAnalysisSnapshot(null);
      }
    });
    logRenderDebug(trace, 'state:viewer-transition-scheduled', { mode });
    if (mode === 'analysis') {
      await loadAnalysis(document.id);
      return;
    }

    try {
      if (mode === 'markdown') {
        const readStartedAt = nowMs();
        logRenderDebug(trace, 'ipc:read:start', { api: 'knowledgeBase.readMarkdown', requestId });
        const markdown = await apiClient.knowledgeBase.readMarkdown(document.id);
        const content = markdown || '';
        logRenderDebug(trace, 'ipc:read:end', {
          api: 'knowledgeBase.readMarkdown',
          requestId,
          readMs: roundMs(nowMs() - readStartedAt),
          contentLength: content.length,
        });
        if (viewerRequestIdRef.current !== requestId) {
          finishRenderDebugTrace(trace, 'stale-read-result', { requestId, latestRequestId: viewerRequestIdRef.current });
          return;
        }
        updateTraceContentMetrics(trace, content);
        if (viewerRequestIdRef.current === requestId) {
          logRenderDebug(trace, 'state:set-markdown-preview', { contentLength: content.length });
          setMarkdownPreview(content);
        }
      } else {
        const readStartedAt = nowMs();
        logRenderDebug(trace, 'ipc:read:start', { api: 'knowledgeBase.readItems', requestId });
        const items = await apiClient.knowledgeBase.readItems(document.id);
        const nextItems = items || [];
        logRenderDebug(trace, 'ipc:read:end', {
          api: 'knowledgeBase.readItems',
          requestId,
          readMs: roundMs(nowMs() - readStartedAt),
          itemCount: nextItems.length,
        });
        if (viewerRequestIdRef.current !== requestId) {
          finishRenderDebugTrace(trace, 'stale-read-result', { requestId, latestRequestId: viewerRequestIdRef.current });
          return;
        }
        updateTraceItemsMetrics(trace, nextItems);
        if (viewerRequestIdRef.current === requestId) {
          logRenderDebug(trace, 'state:set-items-preview', { itemCount: nextItems.length });
          setItemsPreview(nextItems);
        }
      }
    } catch (error) {
      if (viewerRequestIdRef.current === requestId) {
        logRenderDebug(trace, 'ipc:read:error', { message: error instanceof Error ? error.message : String(error) });
        finishRenderDebugTrace(trace, 'read-error');
        showToast(error instanceof Error ? error.message : '读取文档结果失败', 'error');
      }
    } finally {
      if (viewerRequestIdRef.current === requestId) {
        setViewerLoading(false);
        logRenderDebug(trace, 'state:loading-false');
      }
    }
  }, [developerMode, createViewerTrace, loadAnalysis, showToast]);

  const closeViewer = useCallback(() => {
    viewerRequestIdRef.current += 1;
    finishActiveViewerTrace('viewer-closed');
    startTransition(() => {
      setViewer(null);
      setViewerLoading(false);
      setViewerTrace(null);
      setItemsPreview([]);
      setMarkdownPreview('');
      setAnalysisSnapshot(null);
    });
  }, [finishActiveViewerTrace]);

  const syncDocument = useCallback((updatedDocument: KnowledgeDocument) => {
    setViewer((prev) => (prev?.document.id === updatedDocument.id ? { ...prev, document: updatedDocument } : prev));
    setAnalysisSnapshot((prev) => (prev?.document.id === updatedDocument.id ? { ...prev, document: updatedDocument } : prev));
  }, []);

  const startViewerMatching = useCallback(async () => {
    if (!viewer) return;
    try {
      setStartingMatching(true);
      const result = await apiClient.knowledgeBase.startMatching(viewer.document.id, batchSize);
      showToast(result?.message || '已提交匹配任务', result?.success ? 'success' : 'info');
      if (developerMode) {
        await loadAnalysis(viewer.document.id, { silent: true });
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : '启动段落匹配失败', 'error');
    } finally {
      setStartingMatching(false);
    }
  }, [viewer, batchSize, developerMode, loadAnalysis, showToast]);

  return {
    viewer,
    viewerLoading,
    viewerTrace,
    markdownPreview,
    itemsPreview,
    analysisSnapshot,
    batchSize,
    startingMatching,
    setBatchSize,
    loadAnalysis,
    openDocument,
    closeViewer,
    syncDocument,
    startViewerMatching,
  };
}
