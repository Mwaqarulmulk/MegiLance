// @AI-HINT: This is the Next.js dynamic route file for a single client project. It extracts the project ID from the URL and passes it to a client component.

import React from 'react';
import ProjectDetailsClient from './ProjectDetailsClient';

const ProjectDetailsPage = ({ params }: { params: { id: string } }) => {
  return <ProjectDetailsClient projectId={params.id} />;
};

export default ProjectDetailsPage;
