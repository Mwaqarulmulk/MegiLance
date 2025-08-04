// @AI-HINT: This is the Projects page root component. All styles are per-component only. See Projects.common.css, Projects.light.css, and Projects.dark.css for theming.
import React from 'react';
import ProjectCard from '../components/ProjectCard/ProjectCard';
import './Projects.common.css';
import './Projects.light.css';
import './Projects.dark.css';

interface ProjectsProps {
  theme?: 'light' | 'dark';
}

const Projects: React.FC<ProjectsProps> = ({ theme = 'light' }) => {
  const mockProjects = [
    {
      title: 'E-commerce Platform Redesign',
      client: 'Global Retail Inc.',
      budget: '$25,000',
      status: 'active' as const,
    },
    {
      title: 'Mobile App Development',
      client: 'Startup Hub',
      budget: '$15,000',
      status: 'completed' as const,
    },
    {
      title: 'Marketing Website',
      client: 'Creative Agency',
      budget: '$8,000',
      status: 'pending' as const,
    },
    {
      title: 'Data Analytics Dashboard',
      client: 'Tech Solutions LLC',
      budget: '$18,000',
      status: 'active' as const,
    },
  ];

  return (
    <div className={`Projects Projects--${theme}`}>
      <div className="Projects-header">
        <h1>My Projects</h1>
        {/* Add Project Button will go here */}
      </div>
      <div className="Projects-list">
        {mockProjects.map((project, index) => (
          <ProjectCard
            key={index}
            theme={theme}
            title={project.title}
            client={project.client}
            budget={project.budget}
            status={project.status}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
