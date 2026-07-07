/**
 * 项目列表页(创建/删除/筛选项目)
 */
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useToast } from '../../../shared/ui';
import { useProjectList } from '../hooks/useProjectList';
import { useProject } from '../hooks/useProject';
import type { Project } from '../types';

interface ProjectListPageProps {
  onSelect: (project: Project) => void;
}

const statusLabels: Record<string, string> = { draft: '草稿', in_progress: '进行中', completed: '已完成', archived: '已归档' };

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface CreateDialogState {
  open: boolean;
  name: string;
  bidDeadline: string;
  description: string;
}

function ProjectListPage({ onSelect }: ProjectListPageProps) {
  const { showToast } = useToast();
  const list = useProjectList({ showToast });
  const [createDialog, setCreateDialog] = useState<CreateDialogState>({ open: false, name: '', bidDeadline: '', description: '' });
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const { project: detailProject, loading: detailLoading } = useProject(detailProjectId);
  const [countdown, setCountdown] = useState('');

  // 计算倒计时
  useEffect(() => {
    if (!detailProject?.bid_deadline) { setCountdown(''); return; }
    const calc = () => {
      const diff = new Date(detailProject.bid_deadline!).getTime() - Date.now();
      if (diff <= 0) { setCountdown('已截止'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}天${h}小时${m}分`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [detailProject?.bid_deadline]);

  const filteredProjects = list.projects.filter((p) => list.filters.status === '' || p.status === list.filters.status);

  const statusCounts: Record<string, number> = { all: list.projects.length };
  list.projects.forEach((p) => { statusCounts[p.status] = (statusCounts[p.status] || 0) + 1; });

  const statusTabs = [
    { id: '', label: '全部' },
    { id: 'draft', label: '草稿' },
    { id: 'in_progress', label: '进行中' },
    { id: 'completed', label: '已完成' },
    { id: 'archived', label: '已归档' },
  ];

  const openCreate = () => setCreateDialog({ open: true, name: '', bidDeadline: '', description: '' });

  const closeCreate = () => { if (list.creating) return; setCreateDialog((prev) => ({ ...prev, open: false })); };

  const submitCreate = async () => {
    const name = createDialog.name.trim();
    if (!name) { showToast('请输入项目名称', 'info'); return; }
    const project = await list.create(name, createDialog.bidDeadline || undefined, createDialog.description || undefined);
    if (project) { setCreateDialog({ open: false, name: '', bidDeadline: '', description: '' }); onSelect(project); }
  };

  const startRename = (project: Project) => { setRenameTarget(project); setRenameValue(project.name); };

  const submitRename = async () => {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) { showToast('项目名称不能为空', 'info'); return; }
    const updated = await list.rename(renameTarget.id, name);
    if (updated) { setRenameTarget(null); setRenameValue(''); }
  };

  const confirmDelete = async (project: Project) => { if (!window.confirm(`确定删除项目"${project.name}"吗？`)) return; await list.remove(project.id); };

  return (
    <>
      <div className="page-stack project-list-page">
        <section className="project-list-workspace-bar">
          <div className="project-list-breadcrumb"><span>标书生成</span><strong>生成技术方案</strong><small>共 {list.projects.length} 个项目</small></div>
          <div className="project-list-toolbar-actions"><button type="button" className="primary-action" onClick={openCreate} disabled={list.loading}>{list.loading ? '读取中...' : '新建项目'}</button></div>
        </section>

        <div className="project-list-filter-bar">
          {statusTabs.map((tab) => (
            <button key={tab.id} type="button" className={`project-filter-btn${list.filters.status === tab.id ? ' is-active' : ''}`} onClick={() => list.setFilter('status', tab.id)}>
              {tab.label}<span className="project-filter-count">{statusCounts[tab.id] || 0}</span>
            </button>
          ))}
        </div>

        {list.loading && filteredProjects.length === 0 ? (
          <div className="knowledge-empty-box large"><strong>正在读取项目...</strong><p>项目列表加载完成后会自动显示。</p></div>
        ) : filteredProjects.length === 0 ? (
          <div className="knowledge-empty-box large"><strong>该状态下没有项目</strong><p>点击右上角"新建项目"开始创建一个项目。</p><button type="button" className="primary-action" onClick={openCreate} style={{ marginTop: 16 }}>新建项目</button></div>
        ) : (
          <section className="project-card-grid">
            {filteredProjects.map((project) => (
              <article key={project.id} className="project-card" data-status={project.status} onClick={() => setDetailProjectId(project.id)}>
                <header className="project-card-head">
                  <div className="project-card-title-row">
                    <h3 className="project-card-title" title={project.name}>{project.name}</h3>
                    <span className={`project-status-badge is-${project.status}`}>{statusLabels[project.status] || project.status}</span>
                  </div>
                  <div className="project-card-meta-row"><span className="project-card-time">更新于 {formatDate(project.updated_at)}</span></div>
                </header>
                <dl className="project-card-stats">
                  <div><dt>项目编码</dt><dd>{project.code || '—'}</dd></div>
                  <div><dt>投标截止</dt><dd>{formatDate(project.bid_deadline)}</dd></div>
                  <div><dt>项目描述</dt><dd>{project.description || '—'}</dd></div>
                  <div><dt>创建时间</dt><dd>{formatDate(project.created_at)}</dd></div>
                </dl>
                <footer className="project-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="secondary-action" onClick={() => startRename(project)}>重命名</button>
                  <button type="button" className="secondary-action" onClick={() => alert('导出功能（待后端实现）')}>导出</button>
                  <button type="button" className="secondary-action" style={{ color: 'red' }} onClick={() => void confirmDelete(project)}>删除</button>
                </footer>
              </article>
            ))}
          </section>
        )}
      </div>

      <Dialog.Root open={createDialog.open} onOpenChange={(open) => { if (!open) closeCreate(); }}>
        <Dialog.Portal><Dialog.Overlay className="content-regenerate-modal" /><Dialog.Content className="project-dialog-card">
          <div className="knowledge-migration-head"><span className="section-kicker">新建项目</span><Dialog.Title>创建一个新的标书生成项目</Dialog.Title><Dialog.Description>填写项目名称后即可进入工作流。</Dialog.Description></div>
          <div className="project-dialog-body">
            <label className="project-dialog-field"><span>项目名称</span><input autoFocus value={createDialog.name} onChange={(e) => setCreateDialog((p) => ({ ...p, name: e.target.value }))} placeholder="例如：XX 公路工程" disabled={list.creating} onKeyDown={(e) => { if (e.key === 'Enter') void submitCreate(); }} /></label>
            <label className="project-dialog-field"><span>投标截止时间</span><input type="datetime-local" value={createDialog.bidDeadline} onChange={(e) => setCreateDialog((p) => ({ ...p, bidDeadline: e.target.value }))} disabled={list.creating} /></label>
            <label className="project-dialog-field"><span>项目描述</span><input value={createDialog.description} onChange={(e) => setCreateDialog((p) => ({ ...p, description: e.target.value }))} placeholder="简要描述项目内容" disabled={list.creating} /></label>
          </div>
          <div className="content-regenerate-actions"><button type="button" className="secondary-action" onClick={closeCreate} disabled={list.creating}>取消</button><button type="button" className="primary-action" onClick={() => void submitCreate()} disabled={list.creating}>{list.creating ? '创建中...' : '创建并进入'}</button></div>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(renameTarget)} onOpenChange={(open) => { if (!open) setRenameTarget(null); }}>
        <Dialog.Portal><Dialog.Overlay className="content-regenerate-modal" /><Dialog.Content className="project-dialog-card">
          <div className="knowledge-migration-head"><span className="section-kicker">重命名项目</span><Dialog.Title>修改项目名称</Dialog.Title><Dialog.Description>新名称会立即保存到项目记录中。</Dialog.Description></div>
          <div className="project-dialog-body"><label className="project-dialog-field"><span>项目名称</span><input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void submitRename(); }} /></label></div>
          <div className="content-regenerate-actions"><button type="button" className="secondary-action" onClick={() => setRenameTarget(null)}>取消</button><button type="button" className="primary-action" onClick={() => void submitRename()}>保存</button></div>
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(detailProjectId)} onOpenChange={(open) => { if (!open) setDetailProjectId(null); }}>
        <Dialog.Portal><Dialog.Overlay className="content-regenerate-modal" /><Dialog.Content className="project-dialog-card" style={{ maxWidth: 520 }}>
          {detailLoading ? (
            <div className="knowledge-migration-head"><span className="section-kicker">项目详情</span><Dialog.Description>加载中...</Dialog.Description></div>
          ) : detailProject ? (
            <>
              <div className="knowledge-migration-head">
                <span className="section-kicker">项目详情</span>
                <Dialog.Title>{detailProject.name}</Dialog.Title>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className={`project-status-badge is-${detailProject.status}`}>{statusLabels[detailProject.status] || detailProject.status}</span>
                  <span style={{ color: '#8c9aad', fontSize: 13 }}>编码：{detailProject.code || '—'}</span>
                </div>
              </div>
              <div className="project-dialog-body">
                <div className="project-detail-grid">
                  <div className="detail-item"><span className="detail-label">投标截止时间</span><span className="detail-value">{formatDate(detailProject.bid_deadline)}</span>{countdown && <span className="countdown">{countdown}</span>}</div>
                  <div className="detail-item"><span className="detail-label">负责人ID</span><span className="detail-value">{detailProject.owner_id || '—'}</span></div>
                  <div className="detail-item"><span className="detail-label">创建时间</span><span className="detail-value">{formatDate(detailProject.created_at)}</span></div>
                  <div className="detail-item"><span className="detail-label">更新时间</span><span className="detail-value">{formatDate(detailProject.updated_at)}</span></div>
                </div>
                <div className="detail-item full"><span className="detail-label">项目描述</span><span className="detail-value">{detailProject.description || '暂无描述'}</span></div>
              </div>
              <div className="content-regenerate-actions">
                <button type="button" className="secondary-action" onClick={() => setDetailProjectId(null)}>关闭</button>
                <button type="button" className="primary-action" onClick={() => { setDetailProjectId(null); onSelect(detailProject); }}>进入编辑</button>
              </div>
            </>
          ) : (
            <div className="knowledge-migration-head"><span className="section-kicker">项目详情</span><Dialog.Description>加载失败</Dialog.Description></div>
          )}
        </Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default ProjectListPage;
