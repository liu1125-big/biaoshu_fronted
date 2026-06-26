import { useState } from 'react';
import ProjectListPage from './ProjectListPage';
import TechnicalPlanHome from './TechnicalPlanHome';
import type { Project } from '../types';

function TechnicalPlanEntry() {
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
