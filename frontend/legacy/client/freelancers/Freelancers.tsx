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
import { FaStar } from 'react-icons/fa';
import commonStyles from './Freelancers.common.module.css';
import lightStyles from './Freelancers.light.module.css';
import darkStyles from './Freelancers.dark.module.css';

// @AI-HINT: This component displays the 'My Freelancers' page for clients, listing freelancers they have worked with, using a premium Table-based UI.

const mockFreelancers = [
  {
    id: 'fl1',
    name: 'John D.',
    avatar: '/avatars/john-d.png',
    specialty: 'AI & Machine Learning',
    rating: 4.9,
    completedProjects: 3,
    tags: ['Top Rated', 'AI Expert'],
  },
  {
    id: 'fl2',
    name: 'Jane S.',
    avatar: '/avatars/jane-s.png',
    specialty: 'UX/UI Design',
    rating: 5.0,
    completedProjects: 5,
    tags: ['Top Rated Plus', 'Design Lead'],
  },
  {
    id: 'fl3',
    name: 'Mike R.',
    avatar: '/avatars/mike-r.png',
    specialty: 'E-commerce Development',
    rating: 4.8,
    completedProjects: 2,
    tags: ['Rising Talent'],
  },
  {
    id: 'fl4',
    name: 'Sarah K.',
    avatar: '/avatars/sarah-k.png',
    specialty: 'Backend Development (Node.js)',
    rating: 4.9,
    completedProjects: 8,
    tags: ['Top Rated'],
  },
];

const Freelancers: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => ({
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  }), [theme]);

  return (
    <div className={styles.freelancersContainer}>
      <header className={styles.freelancersHeader}>
        <h1 className={styles.headerTitle}>My Freelancers</h1>
        <p className={styles.headerSubtitle}>Manage your network of trusted freelancers.</p>
      </header>

      <main className={styles.freelancersMainContent}>
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Freelancer</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Completed Projects</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFreelancers.map((freelancer) => (
                <TableRow key={freelancer.id}>
                  <TableCell className={styles.freelancerCell}>
                    {/* Placeholder for avatar */}
                    <div className={styles.avatarPlaceholder}></div>
                    <div className={styles.freelancerInfo}>
                      <span className={styles.freelancerName}>{freelancer.name}</span>
                      <div className={styles.tagsContainer}>
                        {freelancer.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{freelancer.specialty}</TableCell>
                  <TableCell className={styles.ratingCell}>
                    <FaStar className={styles.starIcon} />
                    <span>{freelancer.rating.toFixed(1)}</span>
                  </TableCell>
                  <TableCell>{freelancer.completedProjects}</TableCell>
                  <TableCell className={styles.actionsCell}>
                    <Button variant="secondary" size="sm">View Profile</Button>
                    <Button size="sm" className={styles.contactButton}>Contact</Button>
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

export default Freelancers;
