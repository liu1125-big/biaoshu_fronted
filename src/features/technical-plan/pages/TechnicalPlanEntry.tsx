import { useEffect, useState } from 'react';  // 入口组件
import ProjectListPage from './ProjectListPage';
import TechnicalPlanHome from './TechnicalPlanHome';
import type { Project } from '../types';

function TechnicalPlanEntry() {  // 设置文档标题
  useEffect(() => { document.title = '标书生成'; }, []);  // 组件挂载时设置浏览器标签页标题
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);  // 项目选择状态

  if (!selectedProject) {  // 条件渲染: 项目列表，未选择项目时显示项目列表页面
    return (
      <ProjectListPage onSelect={setSelectedProject} />
    );
  }

  return (  // 条件渲染: 工作台，选择项目后显示技术方案工作台
    <TechnicalPlanHome
      projectId={selectedProject.id}
      onBackToProjects={() => setSelectedProject(null)}
    />
  );
}

export default TechnicalPlanEntry;
