import { useLayoutEffect, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MarkdownRenderer } from '../../../shared/ui';
import type { KnowledgeItem } from '../types';
import { knowledgeItemSourceComponents } from '../utils/constants';
import { logRenderDebug, type RenderDebugTrace } from '../utils/renderDebug';
import DebuggableMarkdownContent from './DebuggableMarkdownContent';

interface KnowledgeItemSourceViewerProps {
  item: KnowledgeItem;
  developerMode: boolean;
  rendering: boolean;
  debugTrace: RenderDebugTrace | null;
  onClose: () => void;
}

function KnowledgeItemSourceDialog({ item, developerMode, rendering, debugTrace, onClose }: KnowledgeItemSourceViewerProps) {
  useLayoutEffect(() => {
    if (!developerMode || !debugTrace || !rendering) return;
    logRenderDebug(debugTrace, 'loading:commit');
  }, [debugTrace, developerMode, rendering]);

  useEffect(() => {
    if (!developerMode || !debugTrace || !rendering) return undefined;
    const frameId = window.requestAnimationFrame(() => {
      logRenderDebug(debugTrace, 'loading:next-frame-visible');
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [debugTrace, developerMode, rendering]);

  return (
    <Dialog.Content className="knowledge-source-dialog-card knowledge-source-viewer">
      <div className="knowledge-source-head">
        <div>
          <span>知识条目原文</span>
          <Dialog.Title>{item.title}</Dialog.Title>
          <Dialog.Description>查看该知识条目对应的原始 Markdown 片段。</Dialog.Description>
          {developerMode && <code className="knowledge-entity-id">条目ID：{item.id}</code>}
        </div>
        <button type="button" className="secondary-action" onClick={onClose}>关闭</button>
      </div>
      {rendering ? (
        <div className="knowledge-empty-box large knowledge-source-loading">
          <span className="inline-spinner" aria-hidden="true" />
          <strong>正在渲染原文...</strong>
          <p>内容较大时需要稍等片刻。</p>
        </div>
      ) : (
        <DebuggableMarkdownContent
          className="markdown-viewer knowledge-source-content"
          debugTrace={debugTrace}
          developerMode={developerMode}
          profilerId="knowledge-item-source"
        >
          <MarkdownRenderer enableGfm={false} components={knowledgeItemSourceComponents}>
            {item.content || '暂无原文内容'}
          </MarkdownRenderer>
        </DebuggableMarkdownContent>
      )}
    </Dialog.Content>
  );
}

export default KnowledgeItemSourceDialog;
