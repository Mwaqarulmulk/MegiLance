// @AI-HINT: This component displays a feed of recent user and system activities in a premium timeline format. It's designed to be clear, scannable, and informative, enhancing user engagement and providing transparency—hallmarks of a premium SaaS experience.

'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { FaDollarSign, FaBriefcase, FaTasks, FaUsers } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { mockActivityFeed } from '../../mock-data';

import commonStyles from './DashboardActivityFeed.common.module.css';
import lightStyles from './DashboardActivityFeed.light.module.css';
import darkStyles from './DashboardActivityFeed.dark.module.css';

// Map string names from mock data to actual React icon components
const iconMap: { [key: string]: React.ElementType } = {
  FaDollarSign,
  FaBriefcase,
  FaTasks,
  FaUsers,
};

const DashboardActivityFeed: React.FC = () => {
  const { theme } = useTheme();

  const styles = React.useMemo(() => {
    const themeStyles = theme === 'light' ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={styles.activityFeedCard}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Activity Feed</h2>
        <Link href="/activity" className={styles.viewAllLink}>
          View All
        </Link>
      </div>
      <ul className={styles.activityList}>
        {mockActivityFeed.map((activity) => {
          const IconComponent = iconMap[activity.icon];
          return (
            <li key={activity.id} className={styles.activityItem}>
              <div className={styles.timeline}></div>
              <div className={styles.activityIconContainer}>
                {IconComponent && <IconComponent className={styles.activityIcon} />}
              </div>
              <div className={styles.activityContent}>
                <p>{activity.message}</p>
                <p className={styles.activityTimestamp}>{activity.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardActivityFeed;
