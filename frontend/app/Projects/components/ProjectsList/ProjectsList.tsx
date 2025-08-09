// @AI-HINT: This component is responsible for fetching and rendering the list of project cards. It handles its own data fetching, loading, and error states.
'use client';

import React, { useState, useEffect } from 'react';
import { ProjectType } from '../../types';
import ProjectCard from '../../../components/ProjectCard/ProjectCard';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import { mockProjects } from '../../mock-data';
import commonStyles from './ProjectsList.common.module.css';
import lightStyles from './ProjectsList.light.module.css';
import darkStyles from './ProjectsList.dark.module.css';

const ProjectsList: React.FC = () => {
  const { notify } = useToaster();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Demo: use mock data while backend is paused
        setProjects(mockProjects);
      } catch (err: any) {
        const message = err?.message || 'Unexpected error';
        setError(message);
        notify({ title: 'Error loading projects', description: message, variant: 'danger', duration: 3500 });
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [notify]);

  if (loading) return <div className="ProjectsList-loading">Loading projects...</div>;

  if (error) return <div className="ProjectsList-error" role="alert">Error: {error}</div>;

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Create a new project to start tracking milestones and budgets."
        action={
          <button
            type="button"
            onClick={() => notify({ title: 'New project', description: 'Project creation flow coming soon.', variant: 'info', duration: 3000 })}
          >
            New Project
          </button>
        }
      />
    );
  }

  return (
    <div className="ProjectsList">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          title={project.name}
          clientName={project.client}
          budget={`$${project.budget.toLocaleString()}`}
          postedTime={'Recently updated'}
          tags={[]}
        />
      ))}
    </div>
  );
};

export default ProjectsList;
