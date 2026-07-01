/**
 * 工作流总调度器,渲染各步骤页面
 */

import { useEffect, useState } from 'react';
import DocumentAnalysisPage from './DocumentAnalysisPage';
import BidAnalysisPage from './BidAnalysisPage';
import OutlineEditPage from './OutlineEditPage';
import ContentEditPage from './ContentEditPage';
import { useTechnicalPlanWorkflow } from '../hooks/useTechnicalPlanWorkflow';
import { FloatingToolbar, ToolbarArrowLeftIcon, ToolbarArrowRightIcon, ToolbarDocumentIcon } from '../../../shared/ui';
import type { TechnicalPlanStep } from '../types';

interface TechnicalPlanHomeProps {
  projectId?: string;
  onBackToProjects?: () => void;
}

const steps: TechnicalPlanStep[] = [
  'document-analysis',
  'bid-analysis',
  'outline-generation',
  'content-edit',
];

const stepLabels: Record<TechnicalPlanStep, string> = {
  'document-analysis': '选择标书',
  'bid-analysis': '招标文件解析',
  'outline-generation': '目录生成',
  'content-edit': '生成正文',
};

// Mock 大纲数据
const mockOutlineData = {
  project_name: '技术方案',
  outline: [
    { id: '1', title: '项目概述', description: '项目背景和目标' },
    { id: '2', title: '技术方案', description: '技术路线和方案', children: [
      { id: '2.1', title: '系统架构', description: '总体架构设计' },
      { id: '2.2', title: '技术选型', description: '技术栈选择' },
    ]},
    { id: '3', title: '实施计划', description: '进度安排' },
    { id: '4', title: '质量保障', description: '质量控制措施' },
  ],
};

function TechnicalPlanHome({ onBackToProjects }: TechnicalPlanHomeProps) {
  useEffect(() => { document.title = '标书生成'; }, []);

  const { state, setState, switchStep } = useTechnicalPlanWorkflow();
  const [tenderMarkdown, setTenderMarkdown] = useState('');
  const [sections, setSections] = useState<Record<string, { content: string; status: string }>>({});

  const activeIndex = steps.indexOf(state.step);

  const goToOffset = (offset: number) => {
    const nextStep = steps[activeIndex + offset];
    if (nextStep) {
      switchStep(nextStep);
    }
  };

  const handleFileImported = (fileInfo: { tenderFile: { fileName: string; markdownChars: number }; markdown: string }) => {
    setState((prev) => ({
      ...prev,
      tenderFile: fileInfo.tenderFile,
      projectOverview: '项目概述内容...',
      techRequirements: '技术评分要求内容...',
    }));
    setTenderMarkdown(fileInfo.markdown);
  };

  const handleOutlineChange = (data: typeof mockOutlineData) => {
    setState((prev) => ({ ...prev, outlineData: data }));
  };

  const isLastStep = activeIndex >= steps.length - 1;

  const navigationActions = [
    {
      id: 'previous-step',
      label: '上一步',
      icon: <ToolbarArrowLeftIcon />,
      disabled: activeIndex <= 0,
      tooltip: activeIndex <= 0 ? '当前已经是第一步' : `返回${stepLabels[steps[activeIndex - 1]]}`,
      onClick: () => goToOffset(-1),
    },
    {
      id: 'next-step',
      label: isLastStep ? '导出 Word' : '下一步',
      icon: isLastStep ? <ToolbarDocumentIcon /> : <ToolbarArrowRightIcon />,
      variant: 'primary' as const,
      disabled: false,
      tooltip: isLastStep ? '导出当前技术方案正文' : `进入${stepLabels[steps[activeIndex + 1]]}`,
      onClick: isLastStep ? () => { alert('导出 Word 功能（待后端实现）'); } : () => goToOffset(1),
    },
  ];

  const handleReset = () => {
    if (window.confirm('会清空整个技术方案编写进度，是否确认？')) {
      setState((prev) => ({
        ...prev,
        step: 'document-analysis',
        tenderFile: null,
        projectOverview: '',
        techRequirements: '',
        bidAnalysisMode: 'key',
        bidAnalysisSelectedTaskIds: [],
        bidAnalysisTasks: {},
        outlineData: null,
      }));
      setSections({});
    }
  };

  const toolbarGroups = [
    {
      id: 'technical-plan-reset',
      actions: [
        {
          id: 'reset',
          label: '重置',
          variant: 'danger' as const,
          tooltip: '清空当前技术方案流程',
          onClick: handleReset,
        },
        {
          id: 'home',
          label: '首页',
          variant: 'secondary' as const,
          tooltip: '返回项目列表',
          onClick: onBackToProjects ?? (() => {}),
        },
      ],
    },
    {
      id: 'technical-plan-navigation',
      actions: navigationActions,
    },
  ];

  return (
    <div className="page-stack technical-workbench">
      {state.step === 'document-analysis' && (
        <DocumentAnalysisPage
          tenderFile={state.tenderFile}
          tenderMarkdown={tenderMarkdown}
          onFileImported={handleFileImported}
        />
      )}

      {state.step === 'bid-analysis' && (
        <BidAnalysisPage
          mode={state.bidAnalysisMode}
          tasks={state.bidAnalysisTasks}
        />
      )}

      {state.step === 'outline-generation' && (
        <OutlineEditPage
          outlineData={state.outlineData || mockOutlineData}
          onOutlineChange={handleOutlineChange}
        />
      )}

      {state.step === 'content-edit' && (
        <ContentEditPage
          outlineData={state.outlineData || mockOutlineData}
          sections={sections}
        />
      )}

      <FloatingToolbar groups={toolbarGroups} label="技术方案工具条" />
    </div>
  );
}

export default TechnicalPlanHome;