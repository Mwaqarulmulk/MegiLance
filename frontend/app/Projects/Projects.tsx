// @AI-HINT: This is the root component for the Projects page. It assembles the modular sub-components like ProjectsHeader and ProjectsList to construct the full page view, following our per-component architecture.
'use client';

import React from 'react';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import commonStyles from './Projects.common.module.css';

// Modular Components
import ProjectsHeader from './components/ProjectsHeader/ProjectsHeader';
import ProjectsList from './components/ProjectsList/ProjectsList';



// Styles (theme modules not directly used here to avoid unused imports)

const Projects: React.FC = () => {
  const { notify } = useToaster();
  const handleAddProject = () => {
    notify({ title: 'New project', description: 'Project creation flow coming soon.', variant: 'info', duration: 3000 });
  };

  return (
    <div className={commonStyles.container}>
      <ProjectsHeader onAddProject={handleAddProject} />
      <ProjectsList />
    </div>
  );
};

export default Projects;
