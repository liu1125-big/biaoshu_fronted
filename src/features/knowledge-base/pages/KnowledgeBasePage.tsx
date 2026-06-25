import { startTransition, useEffect } from 'react';
import { trackPageView } from '../../../shared/analytics/analytics';
import { useDocumentParseNotice, useToast } from '../../../shared/ui';
import { statusLabels } from '../utils/constants';
import { canOpenAnalysis, canOpenMarkdown, canMoveKnowledgeDocument } from '../utils/helpers';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { useKnowledgeBaseDrag } from '../hooks/useKnowledgeBaseDrag';
import { useKnowledgeBaseViewer } from '../hooks/useKnowledgeBaseViewer';
import KnowledgeMigrationDialog from '../components/KnowledgeMigrationDialog';
import KnowledgeDocumentViewer from '../components/KnowledgeDocumentViewer';

declare global {
  interface Window {
    __knowledgeRenderDebugLogs?: Array<Record<string, unknown>>;
  }
}

function KnowledgeBasePage() {
  const { showToast } = useToast();
  const { showDocumentParseNotice } = useDocumentParseNotice();

  const kb = useKnowledgeBase({
    showToast,
    showDocumentParseNotice,
  });

  const viewerState = useKnowledgeBaseViewer({ developerMode: kb.developerMode, showToast });

  const drag = useKnowledgeBaseDrag({
    migrationRunning: kb.migrationRunning,
    applyKnowledgeIndex: kb.applyKnowledgeIndex,
    setActiveFolderId: kb.setActiveFolderId,
    showToast,
  });

  // Sync viewer when SSE or retry updates a document
  const { viewer, syncDocument, closeViewer } = viewerState;
  useEffect(() => {
    if (!viewer) return;
    const updatedDoc = kb.index.documents.find((d) => d.id === viewer.document.id);
    if (updatedDoc) {
      syncDocument(updatedDoc);
    }
  }, [kb.index.documents, viewer, syncDocument]);

  // Analytics
  useEffect(() => {
    trackPageView(viewer ? `knowledge-base/viewer/${viewer.mode}` : 'knowledge-base/library');
  }, [viewer?.mode]);

  // Clear viewer if viewed document/folder no longer exists
  useEffect(() => {
    if (!viewer) return;
    const docExists = kb.index.documents.some((d) => d.id === viewer.document.id);
    const folderExists = kb.index.folders.some((f) => f.id === viewer.document.folder_id);
    if (!docExists || !folderExists) {
      closeViewer();
    }
  }, [kb.index.documents, kb.index.folders, viewer, closeViewer]);

  const migrationDialog = kb.pendingMigrationStatus ? (
    <KnowledgeMigrationDialog
      open={kb.migrationDialogOpen}
      status={kb.pendingMigrationStatus}
      running={kb.migrationRunning}
      onCancel={kb.cancelMigration}
      onConfirm={() => void kb.confirmMigration()}
    />
  ) : null;

  if (viewer) {
    return (
      <>
        <KnowledgeDocumentViewer
          document={viewer.document}
          mode={viewer.mode}
          itemsPreview={viewerState.itemsPreview}
          markdownPreview={viewerState.markdownPreview}
          analysisSnapshot={viewerState.analysisSnapshot}
          viewerLoading={viewerState.viewerLoading}
          viewerTrace={viewerState.viewerTrace}
          batchSize={viewerState.batchSize}
          startingMatching={viewerState.startingMatching}
          developerMode={kb.developerMode}
          onBatchSizeChange={viewerState.setBatchSize}
          onBack={closeViewer}
          onModeChange={(mode) => void viewerState.openDocument(viewer!.document, mode)}
          onStartMatching={() => void viewerState.startViewerMatching()}
          onRefreshAnalysis={() => void viewerState.loadAnalysis(viewer!.document.id)}
        />
        {migrationDialog}
      </>
    );
  }

  return (
    <>
      <div className="page-stack knowledge-page">
        <section className="knowledge-workspace-bar">
          <div className="knowledge-breadcrumb">
            <span>知识库</span>
            <strong>{kb.activeFolder?.name || '未选择文件夹'}</strong>
            <small>{kb.index.folders.length} 个文件夹 / {kb.index.documents.length} 个文档</small>
          </div>
          <div className="knowledge-toolbar-actions">
            <button type="button" className="secondary-action" onClick={() => kb.setShowCreateFolder((value) => !value)} disabled={kb.migrationRunning || kb.listLoading}>新建文件夹</button>
            <button type="button" className="primary-action" onClick={kb.uploadDocuments} disabled={kb.loading || kb.migrationRunning || !kb.activeFolder}>
              {kb.migrationRunning ? '迁移中...' : kb.loading ? '处理中...' : '上传文档'}
            </button>
          </div>
        </section>

        {kb.showCreateFolder && (
          <form
            className="knowledge-create-folder-bar"
            onSubmit={(event) => {
              event.preventDefault();
              void kb.createFolder();
            }}
          >
            <input
              autoFocus
              value={kb.newFolderName}
              onChange={(event) => kb.setNewFolderName(event.target.value)}
              placeholder="输入文件夹名称"
              disabled={kb.migrationRunning}
            />
            <button type="submit" className="primary-action" disabled={kb.creatingFolder || kb.migrationRunning}>{kb.creatingFolder ? '创建中...' : '创建'}</button>
            <button
              type="button"
              className="secondary-action"
              onClick={() => {
                kb.setNewFolderName('');
                kb.setShowCreateFolder(false);
              }}
            >
              取消
            </button>
          </form>
        )}

        <section className="knowledge-layout">
          <aside className="knowledge-folder-panel">
            <div className="knowledge-panel-head">
              <strong>文件夹</strong>
              <span>{kb.index.folders.length} 个</span>
            </div>
            {kb.listLoading ? (
              <div className="knowledge-empty-box">
                <strong>正在读取知识库...</strong>
                <p>请稍候，正在加载文件夹和文档列表。</p>
              </div>
            ) : kb.index.folders.length ? (
              <div className="knowledge-folder-list">
                {kb.index.folders.map((folder) => {
                  const count = kb.documentsByFolder.get(folder.id)?.length || 0;
                  const dragging = drag.dragPayload?.kind === 'folder' && drag.dragPayload.folderId === folder.id;
                  const dropTarget = drag.folderDropTargetId === folder.id;
                  return (
                    <article
                      key={folder.id}
                      className={`knowledge-folder-card ${folder.id === kb.activeFolder?.id ? 'is-active' : ''}${dragging ? ' is-dragging' : ''}${dropTarget ? ' is-drop-target' : ''}`}
                      onDragOver={(event) => drag.handleFolderDragOver(event, folder.id)}
                      onDrop={(event) => { void drag.handleFolderDrop(event, folder.id); }}
                    >
                      <div className="knowledge-folder-row">
                        <span
                          className="knowledge-drag-handle"
                          draggable={!kb.migrationRunning && !drag.dragSaving}
                          onDragStart={(event) => drag.startFolderDrag(event, folder.id)}
                          onDragEnd={drag.clearDragState}
                          title="拖拽排序"
                          aria-hidden="true"
                        >⋮⋮</span>
                        <button type="button" className="knowledge-folder-main" onClick={() => startTransition(() => kb.setActiveFolderId(folder.id))} disabled={kb.migrationRunning}>
                          <span aria-hidden="true">F</span>
                          <strong>{folder.name}</strong>
                          <small>{dropTarget && drag.dragPayload?.kind === 'document' ? '松开移动到此文件夹' : `${count} 个文档`}</small>
                        </button>
                      </div>
                      <div className="knowledge-folder-actions">
                        <button type="button" onClick={() => void kb.renameFolder(folder.id, folder.name)} disabled={kb.migrationRunning}>重命名</button>
                        <button type="button" className="is-danger" onClick={() => void kb.deleteFolder(folder.id, folder.name)} disabled={kb.migrationRunning}>删除</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="knowledge-empty-box">
                <strong>还没有文件夹</strong>
                <p>先创建一个文件夹，再上传历史资料。</p>
              </div>
            )}
          </aside>

          <main className="knowledge-document-panel">
            <div className="knowledge-panel-head">
              <strong>{kb.activeFolder?.name || '未选择文件夹'}</strong>
              <span>{kb.documents.length} 个文档</span>
            </div>

            {kb.listLoading ? (
              <div className="knowledge-empty-box large">
                <strong>正在读取知识库...</strong>
                <p>文档列表加载完成后会自动显示。</p>
              </div>
            ) : kb.documents.length ? (
              <div className="knowledge-document-list">
                {kb.visibleDocuments.map((document) => {
                  const retrying = kb.retryingDocumentIds.has(document.id);
                  const canDragDocument = canMoveKnowledgeDocument(document) && !kb.migrationRunning && !drag.dragSaving;
                  const dragging = drag.dragPayload?.kind === 'document' && drag.dragPayload.documentId === document.id;
                  const dropTarget = drag.documentDropTarget?.documentId === document.id ? ` is-drop-${drag.documentDropTarget.position}` : '';
                  return (
                    <article
                      className={`knowledge-document-card${dragging ? ' is-dragging' : ''}${dropTarget}`}
                      key={document.id}
                      onDragOver={(event) => drag.handleDocumentDragOver(event, document)}
                      onDrop={(event) => { void drag.handleDocumentDrop(event, document); }}
                    >
                      <div className="knowledge-document-title">
                        <div className="knowledge-document-title-main">
                          <span
                            className="knowledge-drag-handle"
                            draggable={canDragDocument}
                            onDragStart={(event) => drag.startDocumentDrag(event, document)}
                            onDragEnd={drag.clearDragState}
                            title={canDragDocument ? '拖拽排序或移动到文件夹' : '处理中，暂不可拖动'}
                            aria-hidden="true"
                          >⋮⋮</span>
                          <div className="knowledge-document-name">
                            <strong>{document.file_name}</strong>
                            {kb.developerMode && <code className="knowledge-entity-id">文档ID：{document.id}</code>}
                          </div>
                        </div>
                        <span className={`knowledge-status is-${document.status}`}>{statusLabels[document.status]}</span>
                      </div>
                      <div className="knowledge-progress-track" aria-label={`处理进度 ${document.progress}%`}>
                        <span style={{ width: `${Math.max(0, Math.min(100, document.progress || 0))}%` }} />
                      </div>
                      <div className="knowledge-document-meta">
                        <span>{document.message}</span>
                        <span>{document.item_count || 0} 条知识</span>
                        <span>{document.candidate_item_count || 0} 个候选</span>
                        <span>{document.block_count || 0} 个 block</span>
                      </div>
                      <div className="knowledge-document-actions">
                        {kb.developerMode && <button type="button" onClick={() => void viewerState.openDocument(document, 'analysis')} disabled={kb.migrationRunning || !canOpenAnalysis(document)}>分析调试</button>}
                        <button type="button" onClick={() => void viewerState.openDocument(document, 'items')} disabled={kb.migrationRunning || document.status !== 'success'}>查看条目</button>
                        <button type="button" onClick={() => void viewerState.openDocument(document, 'markdown')} disabled={kb.migrationRunning || !canOpenMarkdown(document)}>查看 Markdown</button>
                        {document.status === 'error' && (
                          <button type="button" className="is-retry" onClick={() => void kb.retryDocument(document)} disabled={kb.migrationRunning || retrying}>
                            {retrying ? '重试中...' : '重试'}
                          </button>
                        )}
                        <button type="button" className="is-danger" onClick={() => void kb.deleteDocument(document)} disabled={kb.migrationRunning}>删除</button>
                      </div>
                    </article>
                  );
                })}
                {kb.visibleDocuments.length < kb.documents.length && (
                  <div className="knowledge-empty-box">
                    <strong>正在加载更多文档...</strong>
                    <p>已显示 {kb.visibleDocuments.length} / {kb.documents.length} 个文档。</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="knowledge-empty-box large">
                <strong>当前文件夹暂无文档</strong>
                <p>支持上传 .doc、.docx、.wps、.pdf、.md 文档。</p>
              </div>
            )}
          </main>
        </section>
      </div>
      {migrationDialog}
    </>
  );
}

export default KnowledgeBasePage;
