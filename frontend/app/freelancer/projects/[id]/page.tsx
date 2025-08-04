// @AI-HINT: This is the Next.js dynamic route file for a single project. It extracts the project ID from the URL.
'use client';

import React from 'react';
import ProjectDetails from './ProjectDetails';
import { useTheme } from '@/app/contexts/ThemeContext';

const ProjectDetailsPage = ({ params }: { params: { id: string } }) => {
  const { theme } = useTheme();

  return <ProjectDetails theme={theme} projectId={params.id} />;
};

export default ProjectDetailsPage;
