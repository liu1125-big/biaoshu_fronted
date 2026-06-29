import { useMemo, useState } from 'react';
import { MarkdownEditor, MarkdownRenderer } from '../../../shared/ui';
import { collectLeaves } from '../../../shared/utils/tree';
import type { ContentEditPageProps } from '../types';

const statusLabels: Record<string, string> = {
  idle: '待生成',
  running: '生成中',
  success: '已生成',
  error: '失败',
};

// Mock 内容数据
const mockContents: Record<string, string> = {
  '1': '# 项目概述\n\n本项目是某市政府投资的智慧城市建设工程...',
  '2': '# 技术方案\n\n本技术方案包括以下内容...',
  '2.1': '# 系统架构\n\n采用微服务架构设计...',
  '2.2': '# 技术选型\n\n使用主流技术栈...',
  '3': '# 实施计划\n\n项目分为三个阶段...',
  '4': '# 质量保障\n\n制定完善的质量控制措施...',
};

function ContentEditPage({ outlineData, sections }: ContentEditPageProps) {
  const outline = outlineData?.outline || [];

  const leaves = useMemo(() => collectLeaves(outline), [outline]);

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [draftContent, setDraftContent] = useState('');

  const selectedItem = selectedItemId
    ? leaves.find((l) => l.id === selectedItemId)
    : leaves[0];

  const selectedContent = selectedItem
    ? sections?.[selectedItem?.id]?.content || mockContents[selectedItem.id] || ''
    : '';

  const completedCount = sections
    ? Object.values(sections).filter((s) => s.status === 'success').length
    : 0;

  const renderTree = (items: typeof outline, level = 0): React.ReactNode =>
    items.map((item) => {
      const isLeaf = !item.children?.length;
      const status = sections?.[item.id]?.status || (mockContents[item.id] ? 'success' : 'idle');

      return (
        <div key={item.id} style={{ paddingLeft: level * 16 }}>
          <button
            type="button"
            className={`content-outline-item is-${status}${selectedItemId === item.id ? ' is-active' : ''}`}
            onClick={() => setSelectedItemId(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', width: '100%', textAlign: 'left' }}
          >
            <span style={{ opacity: 0.5 }}>{item.id}</span>
            <strong style={{ flex: 1 }}>{item.title}</strong>
            <em style={{ fontSize: 12, color: '#666' }}>{statusLabels[status] || status}</em>
          </button>
          {item.children?.length && renderTree(item.children, level + 1)}
        </div>
      );
    });

  const startEditing = () => {
    if (!selectedItem) return;
    setEditingItemId(selectedItem.id);
    setDraftContent(selectedContent);
  };

  const saveEditing = () => {
    setEditingItemId(null);
  };

  if (!outline.length) {
    return (
      <div className="plan-step-body content-generation-page">
        <div className="markdown-empty-state content-generation-empty">
          <strong>暂无目录</strong>
          <p>请先在目录生成步骤完成技术方案目录，再进入正文生成。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-step-body content-generation-page">
      <section className="content-generation-command-bar">
        <div>
          <span className="section-kicker">STEP 04</span>
          <strong>生成正文</strong>
          <p>按目录叶子小节并发生成技术方案正文。</p>
        </div>
        <div className="content-generation-stats">
          <span><strong>{leaves.length}</strong> 个小节</span>
          <span><strong>{completedCount}</strong> 已生成</span>
        </div>
        <div className="content-generation-actions">
          <button type="button" className="primary-action" onClick={() => {}}>
            生成正文
          </button>
        </div>
      </section>

      <section className="content-generation-workspace">
        <aside className="content-outline-panel">
          <div className="analysis-result-head">
            <strong>标书目录</strong>
            <span>{leaves.length} 个小节</span>
          </div>
          <div className="content-outline-list">
            {renderTree(outline)}
          </div>
        </aside>

        <article className="content-reader-panel">
          <div className="content-reader-head">
            <div>
              <span className="section-kicker">正文内容</span>
              <strong>{selectedItem ? `${selectedItem.id} ${selectedItem.title}` : '选择小节'}</strong>
            </div>
            <div className="content-reader-actions">
              {editingItemId ? (
                <>
                  <button type="button" className="primary-action" onClick={saveEditing}>保存</button>
                  <button type="button" className="secondary-action" onClick={() => setEditingItemId(null)}>取消</button>
                </>
              ) : (
                <button type="button" className="secondary-action" onClick={startEditing} disabled={!selectedItem}>
                  编辑
                </button>
              )}
            </div>
          </div>

          {editingItemId ? (
            <MarkdownEditor
              value={draftContent}
              onChange={setDraftContent}
              placeholder="输入 Markdown 正文..."
            />
          ) : selectedContent ? (
            <div className="markdown-viewer content-generation-output">
              <MarkdownRenderer>{selectedContent}</MarkdownRenderer>
            </div>
          ) : (
            <div className="markdown-empty-state content-generation-empty">
              <strong>正文待生成</strong>
              <p>点击生成正文后，后台会按目录小节生成内容。</p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}

export default ContentEditPage;