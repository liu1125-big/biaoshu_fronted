import { useState } from 'react';
import type { OutlineEditPageProps } from '../types';

function OutlineEditPage({
  projectOverview,
  techRequirements,
  outlineData,
  onOutlineChange,
}: OutlineEditPageProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const outline = outlineData?.outline || [];

  const selectedItem = selectedItemId
    ? outline.find((item) => item.id === selectedItemId) ||
      outline.flatMap((i) => i.children || []).find((i) => i.id === selectedItemId)
    : null;

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const startEditing = (item: { id: string; title: string; description?: string }) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description || '');
  };

  const saveEditing = () => {
    if (!outlineData || !editingItemId) return;
    const updatedOutline = outline.map((item) => {
      if (item.id === editingItemId) {
        return { ...item, title: editTitle.trim() || item.title, description: editDescription };
      }
      if (item.children) {
        return {
          ...item,
          children: item.children.map((child) =>
            child.id === editingItemId
              ? { ...child, title: editTitle.trim() || child.title, description: editDescription }
              : child
          ),
        };
      }
      return item;
    });
    onOutlineChange?.({ project_name: outlineData.project_name, outline: updatedOutline });
    setEditingItemId(null);
  };

  const addChildItem = (parentId: string) => {
    if (!outlineData) return;
    const parent = outline.find((i) => i.id === parentId) || outline.flatMap((i) => i.children || []).find((i) => i.id === parentId);
    const children = parent?.children || [];
    const newItem = { id: `${parentId}.${children.length + 1}`, title: '新目录项', description: '请编辑描述' };
    const updatedOutline = outline.map((item) => {
      if (item.id === parentId) {
        return { ...item, children: [...(item.children || []), newItem] };
      }
      if (item.children) {
        return {
          ...item,
          children: item.children.map((child) =>
            child.id === parentId
              ? { ...child, children: [...(child.children || []), newItem] }
              : child
          ),
        };
      }
      return item;
    });
    onOutlineChange?.({ project_name: outlineData.project_name, outline: updatedOutline });
    setExpandedItems((prev) => new Set(prev).add(parentId));
    setSelectedItemId(newItem.id);
    startEditing(newItem);
  };

  const removeItem = (itemId: string) => {
    if (!outlineData) return;
    const removeFromChildren = (items: typeof outline): typeof outline => {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) =>
          item.children ? { ...item, children: removeFromChildren(item.children) } : item
        );
    };
    const updatedOutline = removeFromChildren(outline);
    if (updatedOutline.length === 0) return;
    onOutlineChange?.({ project_name: outlineData.project_name, outline: updatedOutline });
    setSelectedItemId(null);
  };

  const renderItem = (item: { id: string; title: string; description?: string; children?: typeof outline }, level = 0) => {
    const hasChildren = Boolean(item.children?.length);
    const isExpanded = expandedItems.has(item.id);
    const isActive = selectedItemId === item.id;

    return (
      <div className="outline-tree-node" key={item.id} style={{ '--outline-level': level } as React.CSSProperties}>
        <div className={`outline-tree-item${isActive ? ' is-active' : ''}`}>
          <button
            type="button"
            className={`outline-tree-toggle${hasChildren ? '' : ' is-leaf'}${isExpanded ? ' is-expanded' : ''}`}
            onClick={() => hasChildren && toggleExpanded(item.id)}
            disabled={!hasChildren}
          >
            {hasChildren ? '›' : '•'}
          </button>
          <button
            type="button"
            className="outline-tree-content"
            onClick={() => setSelectedItemId(item.id)}
          >
            <strong>{item.id} {item.title}</strong>
            <small>{item.description || '无描述'}</small>
          </button>
        </div>
        {hasChildren && isExpanded && item.children?.map((child) => renderItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="plan-step-body outline-generation-page">
      <section className="outline-command-bar">
        <div>
          <span className="section-kicker">STEP 03</span>
          <strong>目录生成</strong>
          <p>基于招标文件解析结果生成技术方案目录结构。</p>
        </div>
        <div className="outline-command-actions">
          <button type="button" className="primary-action" onClick={() => {}}>
            {outlineData ? '重新生成' : '生成目录'}
          </button>
        </div>
      </section>

      <section className="outline-generation-workspace">
        <section className="outline-tree-panel">
          <div className="analysis-result-head outline-tree-head">
            <div>
              <strong>目录结构</strong>
              <span>{outline.length} 个一级目录</span>
            </div>
            <div className="outline-tree-tools">
              <button type="button" onClick={() => setExpandedItems(new Set(outline.map((i) => i.id)))}>
                全部展开
              </button>
              <button type="button" onClick={() => setExpandedItems(new Set())}>
                全部折叠
              </button>
            </div>
          </div>
          {outline.length ? (
            <div className="outline-tree-list">
              {outline.map((item) => renderItem(item))}
            </div>
          ) : (
            <div className="markdown-empty-state outline-empty-state">
              <strong>尚未生成目录</strong>
              <p>先完成招标文件解析，再生成技术方案目录。</p>
            </div>
          )}
        </section>

        <aside className="outline-detail-panel">
          <div className="analysis-result-head">
            <div>
              <strong>目录项详情</strong>
              <span>{selectedItem ? selectedItem.id : '未选择'}</span>
            </div>
          </div>
          {selectedItem ? (
            <div className="outline-detail-body">
              {editingItemId === selectedItem.id ? (
                <>
                  <label>
                    <span>标题</span>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  </label>
                  <label>
                    <span>描述</span>
                    <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                  </label>
                  <div className="outline-detail-actions">
                    <button type="button" className="primary-action" onClick={saveEditing}>保存</button>
                    <button type="button" className="secondary-action" onClick={() => setEditingItemId(null)}>取消</button>
                  </div>
                </>
              ) : (
                <>
                  <h3>{selectedItem.title}</h3>
                  <p>{selectedItem.description || '无描述'}</p>
                  <div className="outline-detail-actions">
                    <button type="button" className="primary-action" onClick={() => startEditing(selectedItem)}>编辑</button>
                    <button type="button" className="secondary-action" onClick={() => addChildItem(selectedItem.id)}>添加子目录</button>
                    <button type="button" className="danger-action" onClick={() => removeItem(selectedItem.id)}>删除</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="markdown-empty-state outline-empty-state">
              <strong>选择一个目录项</strong>
              <p>在左侧目录树中选择章节后，可查看并编辑标题和描述。</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default OutlineEditPage;