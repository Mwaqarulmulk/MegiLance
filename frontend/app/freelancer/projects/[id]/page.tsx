// @AI-HINT: This is the Next.js dynamic route file for a single project. It extracts the project ID from the URL.
'use client';

import React from 'react';
import ProjectDetails from './ProjectDetails';

const ProjectDetailsPage = ({ params }: { params: { id: string } }) => {
  return <ProjectDetails projectId={params.id} />;
};

export default ProjectDetailsPage;
