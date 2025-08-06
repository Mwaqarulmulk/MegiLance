'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { User } from './types';

import DashboardHeader from './components/DashboardHeader/DashboardHeader';
import DashboardMetrics from './components/DashboardMetrics/DashboardMetrics';
import DashboardRecentProjects from './components/DashboardRecentProjects/DashboardRecentProjects';
import DashboardActivityFeed from './components/DashboardActivityFeed/DashboardActivityFeed';
import commonStyles from './dashboard.common.module.css';
import lightStyles from './dashboard.light.module.css';
import darkStyles from './dashboard.dark.module.css';


// @AI-HINT: This is the main Dashboard component, serving as the central hub for all roles.
// It has been completely redesigned with a premium, investor-grade UI and layout.
// It uses a responsive grid to ensure a perfect experience on all devices.



interface DashboardProps {
  userRole: string;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole, user }) => {
    const { theme } = useTheme();
    const styles = theme === 'dark' ? darkStyles : lightStyles;

    return (
        <div className={`${commonStyles.dashboardLayout} ${styles.dashboardLayout}`}>
            <div className={styles.header}>
                <DashboardHeader userName={user.fullName} userRole={userRole} />
            </div>
            <main className={styles.mainContent}>
                <div className={styles.metrics}>
                    <DashboardMetrics />
                </div>
                <div className={styles.recentProjects}>
                    <DashboardRecentProjects />
                </div>
                <div className={styles.activityFeed}>
                    <DashboardActivityFeed />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;