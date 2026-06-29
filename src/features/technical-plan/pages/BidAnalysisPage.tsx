import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MarkdownRenderer } from '../../../shared/ui';
import { bidAnalysisTasks } from '../services/bidAnalysisWorkflow';
import type { BidAnalysisPageProps } from '../types';

const taskGroups = [
  { title: '关键项', ids: ['projectOverview', 'techRequirements', 'projectInfo', 'partAInfo', 'deliveryAndServiceRequirements'] },
  { title: '采购与响应', ids: ['procurementList', 'responseFileRequirements'] },
  { title: '投标流程', ids: ['keyInfo', 'marginInfo', 'openBid'] },
  { title: '评审要求', ids: ['qualificationReview', 'complianceCheck', 'evaluationBid', 'businessScoring'] },
  { title: '主体与合同', ids: ['agentInfo', 'discardedBids', 'signingProcess', 'terminationCondition'] },
];

const statusLabel: Record<string, string> = {
  idle: '待解析',
  running: '解析中',
  success: '已完成',
  error: '失败',
};

// Mock 解析结果
const mockTaskContents: Record<string, string> = {
  projectOverview: '# 项目概述\n\n本项目是某市政府投资的智慧城市建设工程，旨在提升城市管理效率和公共服务水平。',
  techRequirements: '# 技术评分要求\n\n技术标评分标准：\n- 系统架构设计 20分\n- 技术先进性 15分\n- 实施方案 25分\n- 售后服务 10分',
  projectInfo: JSON.stringify({ project_name: '智慧城市建设项目', project_number: 'ZB-2024-001', project_type: '政府投资项目', project_budget: '5000万元', project_address: '某市政府' }, null, 2),
  partAInfo: JSON.stringify({ company_name: '某市政府信息中心', address: '某市政府大楼', contact_person: '张主任', contact_phone: '010-12345678' }, null, 2),
};

function BidAnalysisPage({
  hasTenderFile,
  mode,
  selectedTaskIds,
  tasks,
}: BidAnalysisPageProps) {
  const [selectedTaskId, setSelectedTaskId] = useState('projectOverview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftSelectedTaskIds, setDraftSelectedTaskIds] = useState<string[]>(
    mode === 'full' ? bidAnalysisTasks.map((t) => t.id) : bidAnalysisTasks.filter((t) => t.required).map((t) => t.id)
  );

  const effectiveSelectedTaskIds = draftSelectedTaskIds;
  const selectedTasks = useMemo(() => {
    const selectedIdSet = new Set(effectiveSelectedTaskIds);
    return bidAnalysisTasks.filter((task) => selectedIdSet.has(task.id));
  }, [effectiveSelectedTaskIds]);

  const activeTask = selectedTasks.find((task) => task.id === selectedTaskId) || selectedTasks[0];
  const activeTaskState = activeTask ? tasks[activeTask.id] : undefined;
  const activeTaskStatus = activeTaskState?.status || 'idle';
  const activeTaskContent = mockTaskContents[activeTask?.id] || '';

  const doneCount = selectedTasks.filter((task) => tasks[task.id]?.status === 'success').length;

  const toggleDraftTask = (taskId: string) => {
    const requiredIds = bidAnalysisTasks.filter((t) => t.required).map((t) => t.id);
    if (requiredIds.includes(taskId)) return;
    setDraftSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="plan-step-body bid-analysis-page">
      <section className="bid-analysis-command-bar">
        <div>
          <span className="section-kicker">STEP 02</span>
          <strong>招标文件解析</strong>
          <p>并发解析招标文件，全部选中解析项结束后进入目录生成。</p>
        </div>
        <div className="bid-analysis-config-chip" title="当前解析配置">
          <span>{mode === 'full' ? '完整解析' : '只解析关键项'}</span>
          <small>{selectedTasks.length} 项</small>
        </div>
        <div className="bid-analysis-command-actions">
          <button
            type="button"
            className="outline-config-action"
            onClick={() => setSettingsOpen(true)}
            aria-label="打开招标文件解析配置"
            title="招标文件解析配置"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-2.83 2.83l-.05-.05a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 0 1-4 0v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.05.05a2 2 0 0 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 0 1 0-4h.08A1.7 1.7 0 0 0 4.6 8.93a1.7 1.7 0 0 0-.34-1.87l-.05-.05a2 2 0 0 1 2.83-2.83l.05.05a1.7 1.7 0 0 0 1.87.34A1.7 1.7 0 0 0 10 3.01V3a2 2 0 0 1 4 0v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.05-.05a2 2 0 0 1 2.83 2.83l-.05.05a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 0 1 0 4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
            </svg>
          </button>
          <button type="button" className="primary-action" onClick={() => setSettingsOpen(true)}>
            配置解析项
          </button>
        </div>
      </section>

      <section className="bid-analysis-workspace">
        <aside className="bid-analysis-task-pane" aria-label="解析任务列表">
          <div className="analysis-result-head bid-analysis-task-head">
            <strong>核心信息</strong>
            <span>{doneCount}/{selectedTasks.length} 项</span>
          </div>
          <div className="bid-analysis-task-list">
            {taskGroups.map((group) => {
              const groupTasks = selectedTasks.filter((task) => group.ids.includes(task.id));
              if (!groupTasks.length) return null;
              return (
                <div className="bid-analysis-task-group" key={group.title}>
                  <span>{group.title}</span>
                  {groupTasks.map((task) => {
                    const status = tasks[task.id]?.status || 'success';
                    return (
                      <button
                        type="button"
                        className={`bid-analysis-task-item is-${status}${selectedTaskId === task.id ? ' is-active' : ''}`}
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <strong>{task.label}</strong>
                        <small>{task.description.slice(0, 20)}...</small>
                        <em>{statusLabel[status]}</em>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        <article className="bid-analysis-reader">
          <div className="bid-analysis-reader-head">
            <div>
              <span className="section-kicker">解析结果</span>
              <strong>{activeTask?.label || '解析结果'}</strong>
              <p>{activeTask?.description || '选择左侧任务查看解析结果。'}</p>
            </div>
            <div className="bid-analysis-reader-actions">
              <span className={`bid-analysis-status is-${activeTaskStatus}`}>{statusLabel[activeTaskStatus]}</span>
            </div>
          </div>

          {activeTaskContent ? (
            <div className="markdown-viewer bid-analysis-output">
              <MarkdownRenderer>
                {activeTaskContent}
              </MarkdownRenderer>
            </div>
          ) : (
            <div className="markdown-empty-state bid-analysis-empty">
              <strong>等待解析结果</strong>
              <p>选择左侧任务查看解析结果。</p>
            </div>
          )}
        </article>
      </section>

      <Dialog.Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="content-regenerate-modal" />
          <Dialog.Content className="bid-analysis-config-card">
            <header className="bid-analysis-config-head">
              <div>
                <span className="section-kicker">解析项选择</span>
                <strong>自定义解析</strong>
              </div>
            </header>
            <section className="bid-analysis-config-section">
              <div className="bid-analysis-config-section-head">
                <strong>关键项</strong>
                <span>5 项必选</span>
              </div>
              <div className="bid-analysis-config-grid">
                {bidAnalysisTasks.filter((d) => d.required).map((definition) => (
                  <label className="bid-analysis-config-item is-required" key={definition.id}>
                    <input type="checkbox" checked disabled />
                    <span><strong>{definition.label}</strong></span>
                    <em>必选</em>
                  </label>
                ))}
              </div>
            </section>
            <section className="bid-analysis-config-section">
              <div className="bid-analysis-config-section-head">
                <strong>其他项</strong>
                <span>当前共选择 {draftSelectedTaskIds.length} 项</span>
              </div>
              <div className="bid-analysis-config-grid">
                {bidAnalysisTasks.filter((d) => !d.required).map((definition) => (
                  <label className={`bid-analysis-config-item${draftSelectedTaskIds.includes(definition.id) ? ' is-selected' : ''}`} key={definition.id}>
                    <input
                      type="checkbox"
                      checked={draftSelectedTaskIds.includes(definition.id)}
                      onChange={() => toggleDraftTask(definition.id)}
                    />
                    <span><strong>{definition.label}</strong></span>
                  </label>
                ))}
              </div>
            </section>
            <div className="content-regenerate-actions bid-analysis-config-actions">
              <Dialog.Close className="secondary-action" type="button">关闭</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default BidAnalysisPage;