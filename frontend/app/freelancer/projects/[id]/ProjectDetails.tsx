// @AI-HINT: This is the Project Details page component. It displays detailed information about a single project. All styles are per-component only.
'use client';

import React from 'react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Button from '@/app/components/Button/Button';
import './ProjectDetails.common.css';
import './ProjectDetails.light.css';
import './ProjectDetails.dark.css';

interface ProjectDetailsProps {
  theme?: 'light' | 'dark';
  projectId: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ theme = 'light', projectId }) => {
  // Mock data for a single project - in a real app, this would be fetched based on projectId
  const project = {
    title: 'AI Chatbot Integration',
    clientName: 'Innovate Inc.',
    clientAvatar: '',
    budget: '$5,000',
    postedTime: '2 hours ago',
    tags: ['React', 'AI', 'NLP', 'Next.js'],
    description: 'We are looking for an experienced developer to integrate a powerful, AI-driven chatbot into our existing Next.js application. The ideal candidate will have a strong background in Natural Language Processing (NLP) and experience with third-party chatbot APIs. Key responsibilities include designing the conversation flow, implementing the chatbot UI, and ensuring seamless integration with our backend services.',
    proposals: 12,
  };

  return (
    <div className={`ProjectDetails ProjectDetails--${theme}`}>
      <div className="ProjectDetails-container">
        <div className="ProjectDetails-main">
          <header className="ProjectDetails-header">
            <h1>{project.title}</h1>
            <div className="ProjectDetails-tags">
              {project.tags.map(tag => <span key={tag} className={`Tag Tag--${theme}`}>{tag}</span>)}
            </div>
          </header>

          <section className="ProjectDetails-section">
            <h2>Project Description</h2>
            <p>{project.description}</p>
          </section>
        </div>

        <aside className="ProjectDetails-sidebar">
          <div className={`Sidebar-card Sidebar-card--${theme}`}>
            <h3>About the Client</h3>
            <div className="Client-info">
              <UserAvatar theme={theme} name={project.clientName} imageUrl={project.clientAvatar} />
              <strong>{project.clientName}</strong>
            </div>
            <Button theme={theme} variant="primary" fullWidth>Submit a Proposal</Button>
          </div>

          <div className={`Sidebar-card Sidebar-card--${theme}`}>
            <h3>Project Details</h3>
            <ul>
              <li><strong>Budget:</strong> {project.budget}</li>
              <li><strong>Posted:</strong> {project.postedTime}</li>
              <li><strong>Proposals:</strong> {project.proposals}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProjectDetails;
