// @AI-HINT: This is the Projects page, designed for comprehensive project management. It features filtering, searching, and a detailed list of project cards, each showing key information like status, budget, and team members.

import React from 'react';
import { Plus, Search, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';
import styles from './Projects.module.css';

// AI-HINT: Mock data for projects. In a real application, this would be fetched from an API, with filtering and pagination handled server-side.
const projects = [
  {
    id: 'PROJ-001',
    title: 'E-commerce Platform Overhaul',
    client: 'Stellar Goods Co.',
    budget: 75000,
    status: 'In Progress',
    team: ['/avatars/avatar-1.png', '/avatars/avatar-2.png', '/avatars/avatar-3.png'],
    deadline: '2023-12-15',
  },
  {
    id: 'PROJ-002',
    title: 'Mobile App for FinTech Startup',
    client: 'CoinFlow',
    budget: 120000,
    status: 'Completed',
    team: ['/avatars/avatar-4.png', '/avatars/avatar-5.png'],
    deadline: '2023-10-30',
  },
  {
    id: 'PROJ-003',
    title: 'SaaS Dashboard Design System',
    client: 'Innovate AI',
    budget: 45000,
    status: 'On Hold',
    team: ['/avatars/avatar-1.png', '/avatars/avatar-5.png'],
    deadline: '2024-01-20',
  },
  {
    id: 'PROJ-004',
    title: 'Branding for a New Cafe',
    client: 'The Daily Grind',
    budget: 15000,
    status: 'In Progress',
    team: ['/avatars/avatar-3.png'],
    deadline: '2023-11-25',
  },
    {
    id: 'PROJ-005',
    title: 'Cloud Migration Strategy',
    client: 'DataSecure',
    budget: 95000,
    status: 'Canceled',
    team: ['/avatars/avatar-2.png', '/avatars/avatar-4.png'],
    deadline: '2023-09-01',
  },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case 'In Progress': return styles.statusInProgress;
    case 'Completed': return styles.statusCompleted;
    case 'On Hold': return styles.statusOnHold;
    case 'Canceled': return styles.statusCanceled;
    default: return '';
  }
};

const ProjectsPage = () => {
  return (
    <div className={styles.projectsContainer}>
      <div className={styles.pageHeader}>
        <h1>Projects</h1>
        <button className={styles.newProjectButton}>
          <Plus size={20} />
          <span>Create Project</span>
        </button>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input type="text" placeholder="Search projects..." />
        </div>
        <div className={styles.filters}>
          <button className={styles.filterButton}>
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className={styles.filterButton}>
            <span>Status: All</span>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className={styles.projectList}>
        <div className={styles.projectListHeader}>
          <span>Project</span>
          <span className={styles.headerItem}>Status</span>
          <span className={styles.headerItem}>Budget</span>
          <span className={styles.headerItem}>Team</span>
          <span className={styles.headerItem}>Deadline</span>
          <span className={styles.headerItem}></span>
        </div>
        {projects.map(project => (
          <div key={project.id} className={styles.projectRow}>
            <div className={styles.projectInfo}>
              <span className={styles.projectId}>{project.id}</span>
              <h3 className={styles.projectTitle}>{project.title}</h3>
              <p className={styles.projectClient}>for {project.client}</p>
            </div>
            <div className={styles.projectStatus}>
              <span className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className={styles.projectBudget}>${project.budget.toLocaleString()}</div>
            <div className={styles.projectTeam}>
              {project.team.map((avatar, index) => (
                <img key={index} src={avatar} alt={`Team member ${index + 1}`} className={styles.teamAvatar} />
              ))}
            </div>
            <div className={styles.projectDeadline}>{new Date(project.deadline).toLocaleDateString()}</div>
            <div className={styles.projectActions}>
              <button className={styles.actionButton} title="More options">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPage;

