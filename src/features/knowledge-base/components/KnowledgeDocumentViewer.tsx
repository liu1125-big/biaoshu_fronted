import { useState, useRef, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MarkdownRenderer, useToast } from '../../../shared/ui';
import type { KnowledgeAnalysisSnapshot, KnowledgeDocument, KnowledgeItem } from '../types';
import { canOpenMarkdown } from '../utils/helpers';
import { createRenderDebugTrace, finishRenderDebugTrace, logRenderDebug, type RenderDebugTrace } from '../utils/renderDebug';
import DebuggableMarkdownContent from './DebuggableMarkdownContent';
import KnowledgeItemCard from './KnowledgeItemCard';
import KnowledgeItemSourceDialog from './KnowledgeItemSourceDialog';
import KnowledgeAnalysisView from './KnowledgeAnalysisView';

type KnowledgeViewerMode = 'analysis' | 'items' | 'markdown';

interface KnowledgeDocumentViewerProps {
  document: KnowledgeDocument;
  mode: KnowledgeViewerMode;
  itemsPreview: KnowledgeItem[];
  markdownPreview: string;
  analysisSnapshot: KnowledgeAnalysisSnapshot | null;
  viewerLoading: boolean;
  viewerTrace: RenderDebugTrace | null;
  batchSize: number;
  startingMatching: boolean;
  developerMode: boolean;
  onBatchSizeChange: (value: number) => void;
  onBack: () => void;
  onModeChange: (mode: KnowledgeViewerMode) => void;
  onStartMatching: () => void;
  onRefreshAnalysis: () => void;
}

function KnowledgeDocumentViewer({
  document,
  mode,
  itemsPreview,
  markdownPreview,
  analysisSnapshot,
  viewerLoading,
  viewerTrace,
  batchSize,
  startingMatching,
  developerMode,
  onBatchSizeChange,
  onBack,
  onModeChange,
  onStartMatching,
  onRefreshAnalysis,
}: KnowledgeDocumentViewerProps) {
  const { showToast } = useToast();
  const [sourceItem, setSourceItem] = useState<KnowledgeItem | null>(null);
  const [sourceRendering, setSourceRendering] = useState(false);
  const [sourceTrace, setSourceTrace] = useState<RenderDebugTrace | null>(null);
  const renderRequestIdRef = useRef(0);
  const sourceTraceRef = useRef<RenderDebugTrace | null>(null);

  useEffect(() => {
    finishRenderDebugTrace(sourceTraceRef.current, 'viewer-reset');
    sourceTraceRef.current = null;
    setSourceItem(null);
    setSourceRendering(false);
    setSourceTrace(null);
    renderRequestIdRef.current += 1;
  }, [document.id, mode]);

  const openSourceItem = (item: KnowledgeItem) => {
    renderRequestIdRef.current += 1;
    const requestId = renderRequestIdRef.current;
    finishRenderDebugTrace(sourceTraceRef.current, 'source-trace-replaced');
    const trace = developerMode ? createRenderDebugTrace('item-source', document, item.content || '', item) : null;
    sourceTraceRef.current = trace;

    setSourceItem(item);
    setSourceRendering(true);
    setSourceTrace(trace);
    logRenderDebug(trace, 'click:open-source');
    window.requestAnimationFrame(() => {
      if (renderRequestIdRef.current === requestId) {
        logRenderDebug(trace, 'raf:release-markdown-render');
        setSourceRendering(false);
      }
    });
  };

  const closeSourceItem = () => {
    renderRequestIdRef.current += 1;
    finishRenderDebugTrace(sourceTraceRef.current, 'source-view-closed');
    sourceTraceRef.current = null;
    setSourceItem(null);
    setSourceRendering(false);
    setSourceTrace(null);
  };

  const copyDebugLogs = async () => {
    const logs = window.__knowledgeRenderDebugLogs || [];
    if (!logs.length) {
      showToast('暂无渲染调试日志', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
      showToast(`渲染调试日志已复制（${logs.length} 条）`, 'success');
    } catch (error) {
      console.warn('复制渲染调试日志失败', error);
      showToast('复制调试日志失败', 'error');
    }
  };

  return (
    <div className="page-stack knowledge-viewer-page">
      <section className="knowledge-workspace-bar knowledge-viewer-bar">
        <div className="knowledge-breadcrumb">
          <span>知识库</span>
          <strong>{document.file_name}</strong>
          {developerMode && <code className="knowledge-entity-id">文档ID：{document.id}</code>}
          <small>{mode === 'analysis' ? '分析调试' : mode === 'items' ? `${document.item_count || 0} 条知识` : 'Markdown 原文'}</small>
        </div>
        <div className="knowledge-toolbar-actions">
          <button type="button" className="secondary-action" onClick={onBack}>返回知识库</button>
          {developerMode && <button type="button" className="secondary-action" onClick={() => void copyDebugLogs()}>复制调试日志</button>}
          {developerMode && <button type="button" className={`secondary-action ${mode === 'analysis' ? 'is-active' : ''}`} onClick={() => onModeChange('analysis')}>分析调试</button>}
          <button type="button" className={`secondary-action ${mode === 'items' ? 'is-active' : ''}`} onClick={() => onModeChange('items')} disabled={document.status !== 'success'}>知识条目</button>
          <button type="button" className={`secondary-action ${mode === 'markdown' ? 'is-active' : ''}`} onClick={() => onModeChange('markdown')} disabled={!canOpenMarkdown(document)}>Markdown</button>
        </div>
      </section>

      <section className="knowledge-viewer-panel">
        {mode === 'analysis' && developerMode ? (
          <KnowledgeAnalysisView
            document={document}
            snapshot={analysisSnapshot}
            batchSize={batchSize}
            startingMatching={startingMatching}
            onBatchSizeChange={onBatchSizeChange}
            onStartMatching={onStartMatching}
            onRefresh={onRefreshAnalysis}
          />
        ) : mode === 'items' ? (
          viewerLoading ? (
            <div className="knowledge-empty-box">
              <strong>正在读取知识条目...</strong>
              <p>条目较多时需要稍等片刻。</p>
            </div>
          ) : (
            <DebuggableMarkdownContent
              className="knowledge-item-list knowledge-viewer-item-list"
              debugTrace={mode === 'items' ? viewerTrace : null}
              developerMode={developerMode}
              profilerId="knowledge-items-list"
            >
              {itemsPreview.length ? itemsPreview.map((item) => (
                <KnowledgeItemCard
                  key={item.id}
                  item={item}
                  developerMode={developerMode}
                  onOpenSource={() => openSourceItem(item)}
                />
              )) : <div className="knowledge-empty-box"><strong>暂无知识条目</strong><p>文档完成整理后会显示结果。</p></div>}
            </DebuggableMarkdownContent>
          )
        ) : (
          <div className="markdown-viewer knowledge-viewer-markdown">
            {viewerLoading ? (
              <div className="knowledge-empty-box large">
                <strong>正在读取 Markdown...</strong>
                <p>原文内容较大时需要稍等片刻。</p>
              </div>
            ) : (
              <DebuggableMarkdownContent
                className="knowledge-markdown-debug-content"
                debugTrace={mode === 'markdown' ? viewerTrace : null}
                developerMode={developerMode}
                profilerId="knowledge-document-markdown"
              >
                <MarkdownRenderer>{markdownPreview || '暂无 Markdown 内容'}</MarkdownRenderer>
              </DebuggableMarkdownContent>
            )}
          </div>
        )}
      </section>

      <Dialog.Root open={Boolean(sourceItem)} onOpenChange={(open) => !open && closeSourceItem()}>
        <Dialog.Portal>
          <Dialog.Overlay className="knowledge-source-modal" />
          {sourceItem && (
            <KnowledgeItemSourceDialog
              item={sourceItem}
              developerMode={developerMode}
              rendering={sourceRendering}
              debugTrace={sourceTrace}
              onClose={closeSourceItem}
            />
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default KnowledgeDocumentViewer;
