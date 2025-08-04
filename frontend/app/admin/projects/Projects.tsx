// @AI-HINT: This is the Project Management page for admins to view, search, and manage platform projects. All styles are per-component only.
'use client';

import React from 'react';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import './Projects.common.css';
import './Projects.light.css';
import './Projects.dark.css';

interface ProjectsProps {
  theme?: 'light' | 'dark';
}

// Mock data for projects
const mockProjects = [
  { id: 'p1', title: 'AI Chatbot Integration', client: 'Innovate Inc.', freelancer: 'John D.', status: 'In Progress', budget: 5000, flagged: false },
  { id: 'p2', title: 'E-commerce UI/UX Redesign', client: 'Shopify Plus Store', freelancer: 'Mike R.', status: 'Completed', budget: 8000, flagged: false },
  { id: 'p3', title: 'Urgent Data Entry', client: 'Data Co.', freelancer: 'N/A', status: 'Open for Proposals', budget: 500, flagged: true },
  { id: 'p4', title: 'Mobile App Development', client: 'Appify Ltd.', freelancer: 'Jane S.', status: 'In Progress', budget: 12000, flagged: false },
  { id: 'p5', title: 'Social Media Manager Needed', client: 'Startup X', freelancer: 'N/A', status: 'Dispute', budget: 1500, flagged: true },
];

const Projects: React.FC<ProjectsProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Projects Projects--${theme}`}>
      <header className="Projects-header">
        <h1>Project Management</h1>
        <div className="Projects-actions">
          <Input theme={theme} type="search" placeholder="Search by title or user..." />
        </div>
      </header>

      <div className={`Projects-table-container Projects-table-container--${theme}`}>
        <table className="Projects-table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Client</th>
              <th>Freelancer</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map(project => (
              <tr key={project.id} className={project.flagged ? 'flagged' : ''}>
                <td>{project.title}</td>
                <td>{project.client}</td>
                <td>{project.freelancer}</td>
                <td>${project.budget.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${project.status.replace(/\s+/g, '-')}`}>{project.status}</span>
                </td>
                <td>
                  <div className="Table-actions">
                    <Button theme={theme} variant="outline" size="small">Details</Button>
                    <Button theme={theme} variant="danger-outline" size="small">Remove</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
