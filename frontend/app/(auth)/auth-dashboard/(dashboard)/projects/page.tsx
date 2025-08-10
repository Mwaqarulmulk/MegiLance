// @AI-HINT: Premium Projects page: interactive search, filtering, and sorting with responsive table layout.

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
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
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | 'In Progress' | 'Completed' | 'On Hold' | 'Canceled'>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'budget' | 'status'>('deadline');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter(p =>
      (status === 'All' || p.status === status) &&
      (
        p.id.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q)
      )
    );
    list = [...list].sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === 'budget') {
        return b.budget - a.budget; // high to low
      }
      // status ordering
      const order = ['In Progress', 'Completed', 'On Hold', 'Canceled'] as const;
      return order.indexOf(a.status as any) - order.indexOf(b.status as any);
    });
    return list;
  }, [query, status, sortBy]);

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
          <input
            type="text"
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search projects"
          />
        </div>
        <div className={styles.filters}>
          <button className={`${styles.filterButton} ${status !== 'All' ? styles.filterButtonActive : ''}`} aria-haspopup="listbox">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <select
            className={`${styles.select}`}
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            aria-label="Filter by status"
          >
            {['All','In Progress','Completed','On Hold','Canceled'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className={styles.filterButton} role="group" aria-label="Sort by">
            <span>Sort:</span>
            <button
              className={`${styles.filterButton} ${sortBy === 'deadline' ? styles.filterButtonActive : ''}`}
              onClick={() => setSortBy('deadline')}
            >Deadline</button>
            <button
              className={`${styles.filterButton} ${sortBy === 'budget' ? styles.filterButtonActive : ''}`}
              onClick={() => setSortBy('budget')}
            >Budget</button>
            <button
              className={`${styles.filterButton} ${sortBy === 'status' ? styles.filterButtonActive : ''}`}
              onClick={() => setSortBy('status')}
            >Status</button>
          </div>
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
        {filtered.map(project => (
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
                <Image key={index} src={avatar} alt={`Team member ${index + 1}`} className={styles.teamAvatar} width={32} height={32} />
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

