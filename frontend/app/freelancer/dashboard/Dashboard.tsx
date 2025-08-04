// @AI-HINT: This is the Freelancer Dashboard root component. It serves as the main hub for freelancers. All styles are per-component only.
'use client';

import React from 'react';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import ProjectCard from '@/app/components/ProjectCard/ProjectCard';
import TransactionRow from '@/app/components/TransactionRow/TransactionRow';
import './Dashboard.common.css';
import './Dashboard.light.css';
import './Dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Dashboard Dashboard--${theme}`}>
      <header className="Dashboard-header">
        <h1>Welcome back, Freelancer!</h1>
        <p>Here’s what’s happening with your projects today.</p>
      </header>

      <div className="Dashboard-widgets">
        <DashboardWidget theme={theme} title="Active Projects" value="3" />
        <DashboardWidget theme={theme} title="Pending Proposals" value="5" />
        <DashboardWidget theme={theme} title="Wallet Balance" value="$1,234.56" />
        <DashboardWidget theme={theme} title="Freelancer Rank" value="Top 10%" />
      </div>

      <div className="Dashboard-main-content">
        <section className="Dashboard-section">
          <h2>Recent Job Postings</h2>
          <div className="Dashboard-project-list">
            <ProjectCard
              theme={theme}
              title="AI Chatbot Integration"
              clientName="Innovate Inc."
              budget="$5,000"
              postedTime="2 hours ago"
              tags={['React', 'AI', 'NLP']}
            />
            <ProjectCard
              theme={theme}
              title="E-commerce Platform UI/UX"
              clientName="Shopify Plus Experts"
              budget="$8,000"
              postedTime="1 day ago"
              tags={['UI/UX', 'Figma', 'Next.js']}
            />
          </div>
        </section>

        <section className="Dashboard-section">
          <h2>Recent Transactions</h2>
          <div className="Dashboard-transaction-list">
            <TransactionRow theme={theme} type="payment" amount={500} date="2025-08-03" description="Milestone 1 for Project X" />
            <TransactionRow theme={theme} type="withdrawal" amount={-200} date="2025-08-01" description="Withdrawal to bank" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
