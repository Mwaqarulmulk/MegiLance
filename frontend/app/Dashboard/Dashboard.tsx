// @AI-HINT: This is the Dashboard page root component. All styles are per-component only. See Dashboard.common.css, Dashboard.light.css, and Dashboard.dark.css for theming.
import React from 'react';
import ProfileMenu from '@/app/components/ProfileMenu/ProfileMenu';
import SidebarNav from '@/app/components/SidebarNav/SidebarNav';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import './Dashboard.common.css';
import './Dashboard.light.css';
import './Dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  const sidebarLinks = [
    { label: 'Dashboard', href: '/Dashboard' },
    { label: 'Projects', href: '/Projects' },
    { label: 'Messages', href: '/Messages' },
    { label: 'Payments', href: '/Payments' },
    { label: 'Settings', href: '/Settings' },
  ];

  return (
    <div className={`Dashboard Dashboard--${theme}`}>
      <header className="Dashboard-header">
        <h1>Dashboard</h1>
        <ProfileMenu theme={theme} userName="Jane Doe" />
      </header>
      <main className="Dashboard-main">
        <aside className="Dashboard-sidebar">
          <SidebarNav theme={theme} links={sidebarLinks} activeHref="/Dashboard" />
        </aside>
        <section className="Dashboard-content">
          <div className="Dashboard-content-header">
            <h2>Welcome Back, Jane!</h2>
            <p>Here&apos;s a summary of your activity.</p>
          </div>
          <div className="Dashboard-widgets-grid">
            <DashboardWidget theme={theme} title="Active Projects" value={3} />
            <DashboardWidget theme={theme} title="Pending Messages" value={5} />
            <DashboardWidget theme={theme} title="Earnings (Month)" value="$1,250" />
            <DashboardWidget theme={theme} title="Overall Rating" value="4.9/5" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
