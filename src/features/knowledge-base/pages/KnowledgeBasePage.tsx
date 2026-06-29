import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import { statusLabels, auditStatusLabels } from '../utils/constants';
import { useDocumentParseNotice, useToast } from '../../../shared/ui';
import { KNOWLEDGE_TAGS, type KnowledgeTag } from '../types';

function KnowledgeBasePage() {
  const { showToast } = useToast();
  const { showDocumentParseNotice } = useDocumentParseNotice();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kb = useKnowledgeBase({ showToast, showDocumentParseNotice });

  // 搜索和标签筛选
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tagFilter, setTagFilter] = useState<KnowledgeTag | '全部'>('全部');

  useEffect(() => {
    document.title = '知识库';
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      void kb.uploadDocuments();
    }
    if (event.target) event.target.value = '';
  };

  // 根据标签和搜索过滤文档
  const filteredDocuments = useMemo(() => {
    return kb.documents.filter((doc) => {
      if (tagFilter !== '全部' && !doc.tags?.includes(tagFilter)) return false;
      if (searchKeyword && !doc.file_name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
      return true;
    });
  }, [kb.documents, tagFilter, searchKeyword]);

  // 统计各标签文档数量
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { 全部: kb.documents.length };
    KNOWLEDGE_TAGS.forEach((tag: KnowledgeTag) => {
      counts[tag] = kb.documents.filter((d) => d.tags?.includes(tag)).length;
    });
    return counts;
  }, [kb.documents]);

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
          <button type="button" className="secondary-action" onClick={() => kb.setShowCreateFolder((v) => !v)} disabled={kb.listLoading}>
            新建文件夹
          </button>
          <button type="button" className="primary-action" onClick={() => fileInputRef.current?.click()} disabled={kb.loading || !kb.activeFolder}>
            {kb.loading ? '处理中...' : '上传文档'}
          </button>
          <input ref={fileInputRef} type="file" multiple accept=".doc,.docx,.wps,.pdf,.md" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </section>

      {/* 新建文件夹表单 */}
      {kb.showCreateFolder && (
        <form className="knowledge-create-folder-bar" onSubmit={(e) => { e.preventDefault(); void kb.createFolder(); }}>
          <input autoFocus value={kb.newFolderName} onChange={(e) => kb.setNewFolderName(e.target.value)} placeholder="输入文件夹名称" />
          <button type="submit" className="primary-action" disabled={kb.creatingFolder}>{kb.creatingFolder ? '创建中...' : '创建'}</button>
          <button type="button" className="secondary-action" onClick={() => { kb.setNewFolderName(''); kb.setShowCreateFolder(false); }}>取消</button>
        </form>
      )}

      {/* 主体 */}
      <section className="knowledge-layout">
        {/* 左侧：文件夹列表 */}
        <aside className="knowledge-folder-panel">
          <div className="knowledge-panel-head"><strong>文件夹</strong><span>{kb.index.folders.length} 个</span></div>
          {kb.listLoading ? (
            <div className="knowledge-empty-box"><strong>正在读取知识库...</strong></div>
          ) : kb.index.folders.length ? (
            <div className="knowledge-folder-list">
              {kb.index.folders.map((folder) => {
                const count = kb.documentsByFolder.get(folder.id)?.length || 0;
                return (
                  <article key={folder.id} className={`knowledge-folder-card${folder.id === kb.activeFolder?.id ? ' is-active' : ''}`} onClick={() => startTransition(() => kb.setActiveFolderId(folder.id))}>
                    <div className="knowledge-folder-row"><span aria-hidden="true">F</span><strong>{folder.name}</strong><small>{count} 个文档</small></div>
                    {folder.tags && folder.tags.length > 0 && (
                      <div className="knowledge-folder-tags">{folder.tags.map((t) => <span key={t} className="tag-badge">{t}</span>)}</div>
                    )}
                    <div className="knowledge-folder-actions">
                      <button type="button" onClick={(e) => { e.stopPropagation(); void kb.renameFolder(folder.id, folder.name); }}>重命名</button>
                      <button type="button" className="is-danger" onClick={(e) => { e.stopPropagation(); void kb.deleteFolder(folder.id, folder.name); }}>删除</button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="knowledge-empty-box"><strong>还没有文件夹</strong><p>先创建一个文件夹，再上传历史资料。</p></div>
          )}
        </aside>

        {/* 右侧：文档列表 */}
        <main className="knowledge-document-panel">
          <div className="knowledge-panel-head">
            <strong>{kb.activeFolder?.name || '未选择文件夹'}</strong>
            <span>{filteredDocuments.length} 个文档</span>
          </div>

          {/* 标签筛选和搜索容器 */}
          <div className="knowledge-filter-search">
            {/* 标签筛选栏 */}
            <div className="knowledge-tag-filter">
              {(Object.keys(tagCounts) as Array<KnowledgeTag | '全部'>).map((tag) => (
                <button key={tag} type="button" className={`tag-filter-btn${tagFilter === tag ? ' is-active' : ''}`} onClick={() => setTagFilter(tag)}>
                  {tag}<span className="tag-filter-count">{tagCounts[tag]}</span>
                </button>
              ))}
            </div>

            {/* 搜索栏 */}
            <div className="knowledge-search-bar">
              <input type="text" placeholder="搜索文档名称..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              {searchKeyword && <button type="button" className="search-clear" onClick={() => setSearchKeyword('')}>×</button>}
            </div>
          </div>

          {kb.listLoading ? (
            <div className="knowledge-empty-box large"><strong>正在读取知识库...</strong><p>文档列表加载完成后会自动显示。</p></div>
          ) : filteredDocuments.length ? (
            <div className="knowledge-document-list">
              {filteredDocuments.map((doc) => (
                <article key={doc.id} className="knowledge-document-card">
                  <div className="knowledge-document-title">
                    <strong>{doc.file_name}</strong>
                    <div className="knowledge-document-badges">
                      <span className={`knowledge-status is-${doc.status}`}>{statusLabels[doc.status]}</span>
                      {doc.audit_status && <span className={`knowledge-audit-status is-${doc.audit_status}`}>{auditStatusLabels[doc.audit_status]}</span>}
                    </div>
                  </div>
                  <div className="knowledge-progress-track" aria-label={`处理进度 ${doc.progress}%`}>
                    <span style={{ width: `${Math.max(0, Math.min(100, doc.progress || 0))}%` }} />
                  </div>
                  <div className="knowledge-document-meta">
                    <span>{doc.message}</span>
                    <span>{doc.item_count || 0} 条知识</span>
                    <span>{doc.block_count || 0} 个 block</span>
                  </div>
                  {/* 来源和批次信息 */}
                  <div className="knowledge-document-info">
                    {doc.source && <span className="doc-info-item">来源: {doc.source}</span>}
                    {doc.batch_number && <span className="doc-info-item">批次: {doc.batch_number}</span>}
                    {doc.version && <span className="doc-info-item">v{doc.version}</span>}
                  </div>
                  {/* 文档标签 */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="knowledge-document-tags">{doc.tags.map((t) => <span key={t} className="tag-badge">{t}</span>)}</div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="knowledge-empty-box large">
              <strong>{searchKeyword || tagFilter !== '全部' ? '未找到匹配的文档' : '当前文件夹暂无文档'}</strong>
              <p>{searchKeyword || tagFilter !== '全部' ? '尝试调整搜索条件或标签筛选' : '支持上传 .doc、.docx、.wps、.pdf、.md 文档。'}</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}

export default KnowledgeBasePage;
