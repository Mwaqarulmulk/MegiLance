'use client';

import React from 'react';

import Button from '@/app/components/Button/Button';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './ProjectDetails.common.css';
import './ProjectDetails.light.css';
import './ProjectDetails.dark.css';

interface ProjectDetailsClientProps {
  projectId: string;
}

// Mock data - in a real app, this would be fetched based on projectId
const mockProject = {
  id: '1',
  title: 'AI Chatbot Integration',
  description: 'We are looking for an expert developer to integrate a new AI-powered chatbot into our existing customer support platform. The ideal candidate will have experience with natural language processing (NLP) APIs, WebSocket communication, and building scalable frontend components in React. The project involves creating a seamless user interface for the chat, connecting to our backend services for user authentication, and ensuring the chatbot can handle a high volume of concurrent conversations.',
  status: 'In Progress',
  budget: 5000,
  jobType: 'Fixed Price',
  hiredFreelancer: {
    name: 'John D.',
    avatarUrl: '/avatars/john.png',
    rank: 'Top 10%',
  },
  proposals: [
    { id: 'p1', freelancerName: 'Jane S.', rate: '$65/hr', coverLetterSnippet: 'I have extensive experience with NLP...' },
    { id: 'p2', freelancerName: 'Alex P.', rate: '$4,800 (Fixed)', coverLetterSnippet: 'My portfolio includes several chatbot projects...' },
  ],
};

const ProjectDetailsClient: React.FC<ProjectDetailsClientProps> = ({ projectId }) => {
  const project = mockProject; // Using mock data for now

  return (
    <div className="ProjectDetails">
      <div className="ProjectDetails-container">
        <header className="ProjectDetails-header">
          <div>
            <h1>{project.title}</h1>
            <span className={`status status--${project.status.replace(/\s+/g, '-')}`}>{project.status}</span>
          </div>
          <Button theme={theme} variant="outline">Edit Job Post</Button>
        </header>

        <div className="ProjectDetails-layout">
          <main className="ProjectDetails-main">
            <section className="ProjectDetails-section">
              <h2>Project Description</h2>
              <p>{project.description}</p>
            </section>

            {project.status === 'In Progress' && project.hiredFreelancer && (
              <section className="ProjectDetails-section">
                <h2>Hired Freelancer</h2>
                <div className={`FreelancerInfoCard FreelancerInfoCard--${theme}`}>
                  <UserAvatar theme={theme} name={project.hiredFreelancer.name} src={project.hiredFreelancer.avatarUrl} />
                  <div className="FreelancerInfo-details">
                    <strong>{project.hiredFreelancer.name}</strong>
                    <span>Rank: {project.hiredFreelancer.rank}</span>
                  </div>
                  <Button theme={theme} variant="primary">Send Message</Button>
                </div>
              </section>
            )}

            {project.status.includes('Proposals') && (
              <section className="ProjectDetails-section">
                <h2>Proposals ({project.proposals.length})</h2>
                <div className="Proposal-list">
                  {project.proposals.map(p => (
                    <div key={p.id} className={`ProposalCard ProposalCard--${theme}`}>
                      <div className="ProposalCard-header">
                        <strong>{p.freelancerName}</strong>
                        <span>{p.rate}</span>
                      </div>
                      <p>&quot;{p.coverLetterSnippet}&quot;</p>
                      <div className="ProposalCard-actions">
                        <Button theme={theme} variant="outline" size="small">View Proposal</Button>
                        <Button theme={theme} variant="primary" size="small">Hire</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="ProjectDetails-sidebar">
            <div className={`Sidebar-card Sidebar-card--${theme}`}>
              <h3>Project Details</h3>
              <p><strong>Budget:</strong> ${project.budget.toLocaleString()}</p>
              <p><strong>Job Type:</strong> {project.jobType}</p>
              <p><strong>Project ID:</strong> {projectId}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsClient;
