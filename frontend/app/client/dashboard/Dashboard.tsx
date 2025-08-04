// @AI-HINT: This is the main dashboard for clients to manage their projects and hiring. All styles are per-component only.
'use client';

import React from 'react';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import Button from '@/app/components/Button/Button';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import './Dashboard.common.css';
import './Dashboard.light.css';
import './Dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  // Mock data for the client dashboard
  const stats = {
    activeProjects: 3,
    pendingHires: 2,
    totalSpent: 25800,
  };

  const recentProjects = [
    { id: '1', title: 'AI Chatbot Integration', status: 'In Progress', freelancer: 'John D.' },
    { id: '2', title: 'Data Analytics Dashboard', status: 'Awaiting Feedback', freelancer: 'Jane S.' },
    { id: '3', title: 'E-commerce Platform UI/UX', status: 'Completed', freelancer: 'Mike R.' },
  ];

  const recentTransactions = [
    { type: 'payment', amount: -5000, date: '2025-08-01', description: 'Milestone Payment for AI Chatbot' },
    { type: 'payment', amount: -8000, date: '2025-07-15', description: 'Final Payment for E-commerce UI/UX' },
    { type: 'deposit', amount: 15000, date: '2025-07-10', description: 'Wallet Deposit' },
  ];

  return (
    <div className={`Dashboard Dashboard--${theme}`}>
      <div className="Dashboard-container">
        <header className="Dashboard-header">
          <h1>Client Dashboard</h1>
          <Button theme={theme} variant="primary">Post a New Job</Button>
        </header>

        <div className="Dashboard-widgets">
          <DashboardWidget theme={theme} title="Active Projects" value={stats.activeProjects.toString()} />
          <DashboardWidget theme={theme} title="Pending Hires" value={stats.pendingHires.toString()} />
          <DashboardWidget theme={theme} title="Total Spent" value={`$${stats.totalSpent.toLocaleString()}`} />
        </div>

        <div className="Dashboard-main-content">
          <section className="Dashboard-section">
            <h2>Recent Projects</h2>
            <div className={`Project-list Project-list--${theme}`}>
              {recentProjects.map(p => (
                <div key={p.id} className="Project-list-item">
                  <span>{p.title}</span>
                  <span>{p.freelancer}</span>
                  <span className={`status status--${p.status.replace(' ', '-')}`}>{p.status}</span>
                  <Button theme={theme} variant='outline' size='small'>View Project</Button>
                </div>
              ))}
            </div>
          </section>

          <section className="Dashboard-section">
            <h2>Recent Transactions</h2>
            <div className="Transaction-list">
              {recentTransactions.map((tx, index) => (
                <TransactionRow key={index} theme={theme} {...tx} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
