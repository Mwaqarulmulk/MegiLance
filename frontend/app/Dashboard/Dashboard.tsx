'use client';

import React from 'react';

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



const Dashboard: React.FC = () => {
    // This is a placeholder. In a real app, you'd fetch this based on the logged-in user.
    const user = { name: 'Admin User', role: 'Admin' };

    return (
        <div className={commonStyles.dashboardLayout}>
            <div className={styles.header}>

                <DashboardHeader userName={user.name} userRole={user.role} />
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