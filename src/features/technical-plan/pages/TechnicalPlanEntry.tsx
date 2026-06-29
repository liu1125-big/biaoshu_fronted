import { useEffect, useState } from 'react';
import ProjectListPage from './ProjectListPage';
import TechnicalPlanHome from './TechnicalPlanHome';
import type { Project } from '../types';

function TechnicalPlanEntry() {
  useEffect(() => { document.title = '标书生成'; }, []);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!selectedProject) {
    return (
      <ProjectListPage onSelect={setSelectedProject} />
    );
  }

  return (
    <TechnicalPlanHome
      projectId={selectedProject.id}
      onBackToProjects={() => setSelectedProject(null)}
    />
  );
}

export default TechnicalPlanEntry;
