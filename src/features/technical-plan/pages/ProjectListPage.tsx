import { useState } from 'react';  // 项目列表页
import * as Dialog from '@radix-ui/react-dialog';
import { trackPageView } from '../../../shared/analytics/analytics';
import { useToast } from '../../../shared/ui';
import { useProjectList } from '../hooks/useProjectList';
import type { Project, ProjectStatus } from '../types';

interface ProjectListPageProps {
  onSelect: (project: Project) => void;
}

const statusLabels: Record<ProjectStatus, string> = {  // 状态标签映射
  draft: '草稿',
  'in-progress': '进行中',
  completed: '已完成',
  archived: '已归档',
};

function formatDateTime(value?: string) {  // 日期格式化函数
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface CreateDialogState {
  open: boolean;
  name: string;
}

function ProjectListPage({ onSelect }: ProjectListPageProps) {  // 组件状态
  const { showToast } = useToast();
  const list = useProjectList({ showToast });
  const [createDialog, setCreateDialog] = useState<CreateDialogState>({ open: false, name: '' });
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const openCreate = () => {  // 新建项目对话框逻辑
    setCreateDialog({ open: true, name: '' });
  };

  const closeCreate = () => {
    if (list.creating) return;
    setCreateDialog((prev) => ({ ...prev, open: false, name: '' }));
  };

  const submitCreate = async () => {
    const name = createDialog.name.trim();
    if (!name) {
      showToast('请输入项目名称', 'info');
      return;
    }
    const project = await list.create(name);
    if (project) {
      setCreateDialog({ open: false, name: '' });
      onSelect(project);
    }
  };

  const startRename = (project: Project) => {  // 重命名逻辑
    setRenameTarget(project);
    setRenameValue(project.name);
  };

  const submitRename = async () => {
    if (!renameTarget) return;
    const name = renameValue.trim();
    if (!name) {
      showToast('项目名称不能为空', 'info');
      return;
    }
    const updated = await list.rename(renameTarget.id, name);
    if (updated) {
      setRenameTarget(null);
      setRenameValue('');
    }
  };

  const confirmDelete = async (project: Project) => {  // 删除确认
    if (!window.confirm(`确定删除项目"${project.name}"吗？`)) return;
    await list.remove(project.id);
  };

  trackPageView('technical-plan/project-list');  // 页面埋点

  return (  // UI 渲染
    <>
      <div className="page-stack project-list-page">
        <section className="project-list-workspace-bar">
          <div className="project-list-breadcrumb">
            <span>标书生成</span>
            <strong>生成技术方案</strong>
            <small>共 {list.projects.length} 个项目</small>
          </div>
          <div className="project-list-toolbar-actions">
            <button type="button" className="primary-action" onClick={openCreate} disabled={list.loading}>
              {list.loading ? '读取中...' : '新建项目'}
            </button>
          </div>
        </section>

        {list.loading && list.projects.length === 0 ? (
          <div className="knowledge-empty-box large">
            <strong>正在读取项目...</strong>
            <p>项目列表加载完成后会自动显示。</p>
          </div>
        ) : list.projects.length === 0 ? (
          <div className="knowledge-empty-box large">
            <strong>还没有项目</strong>
            <p>点击右上角"新建项目"开始创建一个项目。</p>
            <button type="button" className="primary-action" onClick={openCreate} style={{ marginTop: 16 }}>
              新建项目
            </button>
          </div>
        ) : (
          <section className="project-card-grid">
            {list.projects.map((project) => {
              const deleting = list.deletingId === project.id;
              const renaming = list.renamingId === project.id;
              return (
                <article key={project.id} className="project-card" data-status={project.status}>
                  <header className="project-card-head">
                    <div className="project-card-title-row">
                      <h3 className="project-card-title" title={project.name}>{project.name}</h3>
                      <span className={`project-status-badge is-${project.status}`}>{statusLabels[project.status]}</span>
                    </div>
                    <div className="project-card-meta-row">
                      <span className="project-card-time">更新于 {formatDateTime(project.updated_at)}</span>
                    </div>
                  </header>
                  <dl className="project-card-stats">
                    <div>
                      <dt>招标文件</dt>
                      <dd>{project.tender_file_name || '—'}</dd>
                    </div>
                    <div>
                      <dt>大纲小节</dt>
                      <dd>{project.outline_section_count ?? 0}</dd>
                    </div>
                    <div>
                      <dt>已生成字数</dt>
                      <dd>{project.content_word_count ?? 0}</dd>
                    </div>
                    <div>
                      <dt>创建时间</dt>
                      <dd>{formatDateTime(project.created_at)}</dd>
                    </div>
                  </dl>
                  <footer className="project-card-actions">
                    <button
                      type="button"
                      className="primary-action"
                      onClick={() => onSelect(project)}
                      disabled={deleting}
                    >
                      继续编辑
                    </button>
                    <button
                      type="button"
                      className="secondary-action"
                      onClick={() => startRename(project)}
                      disabled={renaming || deleting}
                    >
                      {renaming ? '保存中...' : '重命名'}
                    </button>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => void confirmDelete(project)}
                      disabled={deleting || renaming}
                    >
                      {deleting ? '删除中...' : '删除'}
                    </button>
                  </footer>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <Dialog.Root open={createDialog.open} onOpenChange={(open) => { if (!open) closeCreate(); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="content-regenerate-modal" />
          <Dialog.Content className="project-dialog-card">
            <div className="knowledge-migration-head">
              <span className="section-kicker">新建项目</span>
              <Dialog.Title>创建一个新的标书生成项目</Dialog.Title>
              <Dialog.Description>填写项目名称后即可进入工作流。</Dialog.Description>
            </div>
            <div className="project-dialog-body">
              <label className="project-dialog-field">
                <span>项目名称</span>
                <input
                  autoFocus
                  value={createDialog.name}
                  onChange={(event) => setCreateDialog((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="例如：XX 公路工程"
                  disabled={list.creating}
                  onKeyDown={(event) => { if (event.key === 'Enter') void submitCreate(); }}
                />
              </label>
            </div>
            <div className="content-regenerate-actions">
              <button type="button" className="secondary-action" onClick={closeCreate} disabled={list.creating}>取消</button>
              <button type="button" className="primary-action" onClick={() => void submitCreate()} disabled={list.creating}>
                {list.creating ? '创建中...' : '创建并进入'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={Boolean(renameTarget)} onOpenChange={(open) => { if (!open && !list.renamingId) setRenameTarget(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="content-regenerate-modal" />
          <Dialog.Content className="project-dialog-card">
            <div className="knowledge-migration-head">
              <span className="section-kicker">重命名项目</span>
              <Dialog.Title>修改项目名称</Dialog.Title>
              <Dialog.Description>新名称会立即保存到项目记录中。</Dialog.Description>
            </div>
            <div className="project-dialog-body">
              <label className="project-dialog-field">
                <span>项目名称</span>
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  disabled={Boolean(list.renamingId)}
                  onKeyDown={(event) => { if (event.key === 'Enter') void submitRename(); }}
                />
              </label>
            </div>
            <div className="content-regenerate-actions">
              <button type="button" className="secondary-action" onClick={() => setRenameTarget(null)} disabled={Boolean(list.renamingId)}>取消</button>
              <button type="button" className="primary-action" onClick={() => void submitRename()} disabled={Boolean(list.renamingId)}>
                {list.renamingId ? '保存中...' : '保存'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export default ProjectListPage;
