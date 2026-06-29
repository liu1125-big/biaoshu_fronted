import { startTransition, useEffect, useRef } from 'react';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { statusLabels } from '../utils/constants';
import { useDocumentParseNotice, useToast } from '../../../shared/ui';

function KnowledgeBasePage() {
  const { showToast } = useToast();
  const { showDocumentParseNotice } = useDocumentParseNotice();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kb = useKnowledgeBase({ showToast, showDocumentParseNotice });

  useEffect(() => {
    document.title = '知识库';
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      void kb.uploadDocuments();
    }
    if (event.target) event.target.value = '';
  };

  return (
    <div className="page-stack knowledge-page">
      {/* 顶栏 */}
      <section className="knowledge-workspace-bar">
        <div className="knowledge-breadcrumb">
          <span>知识库</span>
          <strong>{kb.activeFolder?.name || '未选择文件夹'}</strong>
          <small>{kb.index.folders.length} 个文件夹 / {kb.index.documents.length} 个文档</small>
        </div>
        <div className="knowledge-toolbar-actions">
          <button
            type="button"
            className="secondary-action"
            onClick={() => kb.setShowCreateFolder((v) => !v)}
            disabled={kb.listLoading}
          >
            新建文件夹
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={() => fileInputRef.current?.click()}
            disabled={kb.loading || !kb.activeFolder}
          >
            {kb.loading ? '处理中...' : '上传文档'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".doc,.docx,.wps,.pdf,.md"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </section>

      {/* 新建文件夹表单 */}
      {kb.showCreateFolder && (
        <form
          className="knowledge-create-folder-bar"
          onSubmit={(e) => {
            e.preventDefault();
            void kb.createFolder();
          }}
        >
          <input
            autoFocus
            value={kb.newFolderName}
            onChange={(e) => kb.setNewFolderName(e.target.value)}
            placeholder="输入文件夹名称"
            disabled={false}
          />
          <button type="submit" className="primary-action" disabled={kb.creatingFolder}>
            {kb.creatingFolder ? '创建中...' : '创建'}
          </button>
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

      {/* 主体 */}
      <section className="knowledge-layout">
        {/* 文件夹列表 */}
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
                return (
                  <article
                    key={folder.id}
                    className={`knowledge-folder-card${folder.id === kb.activeFolder?.id ? ' is-active' : ''}`}
                    onClick={() => startTransition(() => kb.setActiveFolderId(folder.id))}
                  >
                    <div className="knowledge-folder-row">
                      <span aria-hidden="true">F</span>
                      <strong>{folder.name}</strong>
                      <small>{count} 个文档</small>
                    </div>
                    <div className="knowledge-folder-actions">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void kb.renameFolder(folder.id, folder.name);
                        }}
                        disabled={false}
                      >
                        重命名
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          void kb.deleteFolder(folder.id, folder.name);
                        }}
                        disabled={false}
                      >
                        删除
                      </button>
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

        {/* 文档列表 */}
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
              {kb.documents.map((doc) => (
                <article key={doc.id} className="knowledge-document-card">
                  <div className="knowledge-document-title">
                    <strong>{doc.file_name}</strong>
                    <span className={`knowledge-status is-${doc.status}`}>{statusLabels[doc.status]}</span>
                  </div>
                  <div className="knowledge-progress-track" aria-label={`处理进度 ${doc.progress}%`}>
                    <span style={{ width: `${Math.max(0, Math.min(100, doc.progress || 0))}%` }} />
                  </div>
                  <div className="knowledge-document-meta">
                    <span>{doc.message}</span>
                    <span>{doc.item_count || 0} 条知识</span>
                    <span>{doc.block_count || 0} 个 block</span>
                  </div>
                </article>
              ))}
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
  );
}

export default KnowledgeBasePage;
