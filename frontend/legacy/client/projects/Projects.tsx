'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table/table';
import commonStyles from './Projects.common.module.css';
import lightStyles from './Projects.light.module.css';
import darkStyles from './Projects.dark.module.css';

// @AI-HINT: This is the 'My Projects' page for clients. It has been fully refactored to use
// a reusable Table and Badge component system for a premium, data-driven UI.

const mockProjects = [
  {
    id: '1',
    title: 'AI Chatbot Integration',
    datePosted: '2024-07-10',
    budget: '$20,000',
    status: 'In Progress',
    proposals: 12,
  },
  {
    id: '2',
    title: 'Data Analytics Dashboard',
    datePosted: '2024-07-05',
    budget: '$35,000',
    status: 'Reviewing Proposals',
    proposals: 25,
  },
  {
    id: '3',
    title: 'E-commerce Platform UI/UX',
    datePosted: '2024-06-20',
    budget: '$25,000',
    status: 'Completed',
    proposals: 8,
  },
  {
    id: '4',
    title: 'Mobile App Backend (Node.js)',
    datePosted: '2024-06-15',
    budget: '$40,000',
    status: 'Open for Proposals',
    proposals: 5,
  },
];

const getStatusVariant = (status: string): React.ComponentProps<typeof Badge>['variant'] => {
  switch (status) {
    case 'In Progress':
      return 'secondary';
    case 'Completed':
      return 'success';
    case 'Reviewing Proposals':
    case 'Open for Proposals':
      return 'primary';
    default:
      return 'outline';
  }
};

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => ({
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  }), [theme]);

  return (
    <div className={styles.projectsContainer}>
      <header className={styles.projectsHeader}>
        <h1 className={styles.headerTitle}>My Projects</h1>
        <p className={styles.headerSubtitle}>View and manage all your job postings from one place.</p>
      </header>

      <main className={styles.projectsMainContent}>
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Proposals</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className={styles.projectTitleCell}>{project.title}</TableCell>
                  <TableCell>{project.datePosted}</TableCell>
                  <TableCell>{project.budget}</TableCell>
                  <TableCell>
                    <Badge variant="primary">{project.proposals} Proposals</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                  </TableCell>
                  <TableCell className={styles.actionsCell}>
                    <Button variant="secondary" size="sm">View Details</Button>
                    {project.status.includes('Proposals') && (
                      <Button size="sm" className={styles.reviewButton}>Review Proposals</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default Projects;
