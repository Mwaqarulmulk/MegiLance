// @AI-HINT: Enterprise-grade Dashboard component for MegiLance platform. Features comprehensive metrics, activity feeds, project management, and responsive design following brand guidelines. Uses per-component CSS architecture with theme support.
import React from 'react';
import ProfileMenu from '@/app/components/ProfileMenu/ProfileMenu';
import SidebarNav from '@/app/components/SidebarNav/SidebarNav';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import './dashboard.common.css';
import './dashboard.light.css';
import './dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  const sidebarLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Projects', href: '/projects', icon: '💼' },
    { label: 'Messages', href: '/messages', icon: '💬' },
    { label: 'Payments', href: '/payments', icon: '💰' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  // Mock data for enterprise dashboard
  const recentProjects = [
    { id: 1, title: 'E-commerce Platform Redesign', client: 'TechCorp Inc.', status: 'In Progress', progress: 75, deadline: '2025-08-15', budget: '$5,200' },
    { id: 2, title: 'Mobile App Development', client: 'StartupXYZ', status: 'Review', progress: 90, deadline: '2025-08-10', budget: '$3,800' },
    { id: 3, title: 'Brand Identity Package', client: 'Creative Agency', status: 'Completed', progress: 100, deadline: '2025-08-05', budget: '$2,100' },
  ];

  const recentActivity = [
    { id: 1, type: 'payment', message: 'Payment received from TechCorp Inc.', amount: '$1,300', time: '2 hours ago', icon: '💰' },
    { id: 2, type: 'message', message: 'New message from StartupXYZ', time: '4 hours ago', icon: '💬' },
    { id: 3, type: 'project', message: 'Project milestone completed', time: '1 day ago', icon: '✅' },
    { id: 4, type: 'review', message: 'New 5-star review received', time: '2 days ago', icon: '⭐' },
  ];

  const quickActions = [
    { label: 'Create Proposal', icon: '📝', action: 'proposal' },
    { label: 'Browse Jobs', icon: '🔍', action: 'browse' },
    { label: 'Withdraw Funds', icon: '🏦', action: 'withdraw' },
    { label: 'Update Profile', icon: '👤', action: 'profile' },
  ];

  return (
    <div className={`Dashboard Dashboard--${theme}`}>
      <div className="Dashboard-container">
        <aside className="Dashboard-sidebar">
          <div className="Dashboard-logo">
            <h1 className="Dashboard-logo-text">MegiLance</h1>
            <span className="Dashboard-logo-badge">Pro</span>
          </div>
          <SidebarNav theme={theme} links={sidebarLinks} activeHref="/dashboard" />
        </aside>
        
        <main className="Dashboard-main">
          <header className="Dashboard-header">
            <div className="Dashboard-header-content">
              <div className="Dashboard-welcome">
                <h1 className="Dashboard-title">Welcome back, Jane! 👋</h1>
                <p className="Dashboard-subtitle">Here's what's happening with your freelance business today.</p>
              </div>
              <div className="Dashboard-header-actions">
                <button className="Dashboard-notification-btn">
                  <span className="Dashboard-notification-icon">🔔</span>
                  <span className="Dashboard-notification-badge">3</span>
                </button>
                <ProfileMenu theme={theme} userName="Jane Doe" />
              </div>
            </div>
          </header>

          <div className="Dashboard-content">
            {/* Key Metrics Section */}
            <section className="Dashboard-metrics">
              <div className="Dashboard-metrics-grid">
                <DashboardWidget 
                  theme={theme} 
                  title="Active Projects" 
                  value="3" 
                  icon="💼"
                  trend="+2 this month"
                  trendType="positive"
                />
                <DashboardWidget 
                  theme={theme} 
                  title="Total Earnings" 
                  value="$12,450" 
                  icon="💰"
                  trend="+$2,100 this month"
                  trendType="positive"
                />
                <DashboardWidget 
                  theme={theme} 
                  title="Success Rate" 
                  value="94%" 
                  icon="📈"
                  trend="+3% from last month"
                  trendType="positive"
                />
                <DashboardWidget 
                  theme={theme} 
                  title="Client Rating" 
                  value="4.9/5" 
                  icon="⭐"
                  trend="Based on 47 reviews"
                  trendType="neutral"
                />
              </div>
            </section>

            {/* Quick Actions */}
            <section className="Dashboard-quick-actions">
              <h2 className="Dashboard-section-title">Quick Actions</h2>
              <div className="Dashboard-actions-grid">
                {quickActions.map((action, index) => (
                  <button key={index} className="Dashboard-action-card">
                    <span className="Dashboard-action-icon">{action.icon}</span>
                    <span className="Dashboard-action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="Dashboard-content-grid">
              {/* Recent Projects */}
              <section className="Dashboard-projects">
                <div className="Dashboard-section-header">
                  <h2 className="Dashboard-section-title">Recent Projects</h2>
                  <button className="Dashboard-section-action">View All</button>
                </div>
                <div className="Dashboard-projects-list">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="Dashboard-project-card">
                      <div className="Dashboard-project-header">
                        <h3 className="Dashboard-project-title">{project.title}</h3>
                        <span className={`Dashboard-project-status Dashboard-project-status--${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="Dashboard-project-meta">
                        <span className="Dashboard-project-client">👤 {project.client}</span>
                        <span className="Dashboard-project-budget">💰 {project.budget}</span>
                        <span className="Dashboard-project-deadline">📅 {project.deadline}</span>
                      </div>
                      <div className="Dashboard-project-progress">
                        <div className="Dashboard-progress-bar">
                          <div 
                            className="Dashboard-progress-fill" 
                            data-progress={project.progress}
                          ></div>
                        </div>
                        <span className="Dashboard-progress-text">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="Dashboard-activity">
                <div className="Dashboard-section-header">
                  <h2 className="Dashboard-section-title">Recent Activity</h2>
                  <button className="Dashboard-section-action">View All</button>
                </div>
                <div className="Dashboard-activity-list">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="Dashboard-activity-item">
                      <div className="Dashboard-activity-icon">{activity.icon}</div>
                      <div className="Dashboard-activity-content">
                        <p className="Dashboard-activity-message">{activity.message}</p>
                        <span className="Dashboard-activity-time">{activity.time}</span>
                      </div>
                      {activity.amount && (
                        <div className="Dashboard-activity-amount">{activity.amount}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
