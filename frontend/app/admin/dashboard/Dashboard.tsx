// @AI-HINT: This is the main Admin Dashboard page, providing an overview of platform activity. All styles are per-component only.
'use client';

import React from 'react';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import './Dashboard.common.css';
import './Dashboard.light.css';
import './Dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

// Mock data for the admin dashboard
const adminStats = {
  totalUsers: 1250,
  activeProjects: 340,
  totalTransactions: 5200,
  pendingTickets: 15,
};

const recentRegistrations = [
  { id: 'u1', name: 'Alex Johnson', date: '2025-08-04', type: 'Freelancer' },
  { id: 'u2', name: 'Beta Corp', date: '2025-08-04', type: 'Client' },
  { id: 'u3', name: 'Sam Lee', date: '2025-08-03', type: 'Freelancer' },
];

const flaggedProjects = [
  { id: 'p1', title: 'Urgent Data Entry', reason: 'Potential Spam' },
  { id: 'p2', title: 'Social Media Manager Needed', reason: 'Unusual Activity' },
];

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  return (
    <div className={`AdminDashboard AdminDashboard--${theme}`}>
      <header className="AdminDashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <div className="AdminDashboard-widgets">
        <DashboardWidget theme={theme} title="Total Users" value={adminStats.totalUsers.toLocaleString()} />
        <DashboardWidget theme={theme} title="Active Projects" value={adminStats.activeProjects.toLocaleString()} />
        <DashboardWidget theme={theme} title="Total Transactions" value={adminStats.totalTransactions.toLocaleString()} />
        <DashboardWidget theme={theme} title="Pending Support Tickets" value={adminStats.pendingTickets.toLocaleString()} variant="warning" />
      </div>

      <div className="AdminDashboard-lists">
        <div className={`List-card List-card--${theme}`}>
          <h2>Recent Registrations</h2>
          <ul>
            {recentRegistrations.map(user => (
              <li key={user.id}>
                <span>{user.name} ({user.type})</span>
                <span>{user.date}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`List-card List-card--${theme}`}>
          <h2>Flagged Projects</h2>
          <ul>
            {flaggedProjects.map(project => (
              <li key={project.id}>
                <span>{project.title}</span>
                <span className="flagged-reason">{project.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
