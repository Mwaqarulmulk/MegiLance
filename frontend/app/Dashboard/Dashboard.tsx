// @AI-HINT: Enterprise-grade Dashboard component for MegiLance platform. Features comprehensive metrics, activity feeds, project management, and responsive design following brand guidelines. Uses per-component CSS architecture with theme support.
// @AI-HINT: Enterprise-grade Dashboard component for MegiLance platform. Features comprehensive metrics, activity feeds, project management, and responsive design following brand guidelines. Uses per-component CSS architecture with theme support.
import React from 'react';
import Navbar, { NavItem as NavbarNavItem } from '@/app/components/Navbar/Navbar';
import { ProfileMenuItem } from '@/app/components/ProfileMenu/ProfileMenu';
import Sidebar from '@/app/components/Sidebar/Sidebar';
import SidebarNav, { NavItem as SidebarNavItem } from '@/app/components/Sidebar/SidebarNav';
import { FaBell, FaCog, FaUser, FaSignOutAlt, FaTachometerAlt, FaBriefcase, FaComments, FaCreditCard, FaCogs, FaChartBar, FaClipboardCheck, FaUsers, FaFileSignature, FaSearch, FaUniversity, FaUserEdit } from 'react-icons/fa';
import DashboardWidget from '@/app/components/DashboardWidget/DashboardWidget';
import './dashboard.common.css';
import './dashboard.light.css';
import './dashboard.dark.css';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

const user = { name: 'Alexia Christian', email: 'alexia.c@megilance.com' };

const navItems: NavbarNavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/projects' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Team', href: '/team' },
];

const profileMenuItems: ProfileMenuItem[] = [
  { label: 'My Profile', href: '/profile', icon: <FaUser /> },
  { label: 'Settings', href: '/settings', icon: <FaCog /> },
  { label: 'Logout', onClick: () => alert('Logging out...'), icon: <FaSignOutAlt /> },
];

const Dashboard: React.FC<DashboardProps> = ({ theme = 'light' }) => {
  const sidebarNavItems: SidebarNavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { href: '/projects', label: 'Projects', icon: FaBriefcase },
    { href: '/messages', label: 'Messages', icon: FaComments },
    { href: '/payments', label: 'Payments', icon: FaCreditCard },
    { href: '/settings', label: 'Settings', icon: FaCogs },
  ];

  const recentProjects = [
    { id: 1, title: 'E-commerce Platform Redesign', client: 'TechCorp Inc.', status: 'In Progress', progress: 75, deadline: '2025-08-15', budget: '$5,200' },
    { id: 2, title: 'Mobile App Development', client: 'StartupXYZ', status: 'Review', progress: 90, deadline: '2025-08-10', budget: '$3,800' },
    { id: 3, title: 'Brand Identity Package', client: 'Creative Agency', status: 'Completed', progress: 100, deadline: '2025-08-05', budget: '$2,100' },
  ];

  const recentActivity = [
    { id: 1, message: 'Received payment from Innovate Inc.', time: '2h ago' },
    { id: 2, message: 'Task "Deploy to Staging" completed', time: '5h ago' },
    { id: 3, message: 'New project "Brand Redesign" created', time: '1d ago' },
    { id: 4, message: '@jane.doe joined the AI Dashboard team', time: '2d ago' },
  ];

  const metrics = [
    { id: 1, label: 'Active Projects', value: '12', icon: <FaBriefcase /> },
    { id: 2, label: 'Pending Tasks', value: '8', icon: <FaClipboardCheck /> },
    { id: 3, label: 'Team Members', value: '24', icon: <FaUsers /> },
    { id: 4, label: 'Revenue', value: '$45.8K', icon: <FaChartBar /> },
  ];

  return (
    <div className={`Dashboard Dashboard--${theme}`}>
      <div className="Dashboard-container">
        <Sidebar>
          <SidebarNav navItems={sidebarNavItems} />
        </Sidebar>
        
        <div className="Dashboard-main-content">
          <Navbar
            navItems={navItems}
            profileMenuItems={profileMenuItems}
            userName={user.name}
            userEmail={user.email}
          />
          <main className="Dashboard-main">
            <header className="Dashboard-header">
              <div className="Dashboard-header-content">
                <div className="Dashboard-welcome">
                  <h2 className="Dashboard-title">Welcome back, {user.name.split(' ')[0]}!</h2>
                  <p className="Dashboard-subtitle">Here’s the latest on your projects.</p>
                </div>
                <div className="Dashboard-header-actions">
                  <button className="Dashboard-notification-btn">
                    <span className="Dashboard-notification-icon">🔔</span>
                    <span className="Dashboard-notification-badge">3</span>
                  </button>
                </div>
              </div>
            </header>

            <div className="Dashboard-content">
              <div className="Dashboard-metrics-grid">
                {metrics.map(metric => (
                  <DashboardWidget key={metric.id} icon={metric.icon} title={metric.label} value={metric.value} />
                ))}
              </div>

              <div className="Dashboard-main-grid">
                <DashboardWidget title="Recent Projects" actionButton={{ label: 'View All', onClick: () => alert('Viewing all projects...') }}>
                  <div className="Dashboard-projects-list">
                    {recentProjects.map(project => (
                      <div key={project.id} className="Dashboard-project-item">
                        <div className="Dashboard-project-info">
                          <h3 className="Dashboard-project-title">{project.title}</h3>
                          <p className="Dashboard-project-client">{project.client}</p>
                        </div>
                        <div className="Dashboard-project-status">
                          <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardWidget>

                <DashboardWidget title="Recent Activity" actionButton={{ label: 'View All', onClick: () => alert('Viewing all activity...') }}>
                  <div className="Dashboard-activity-list">
                    {recentActivity.map(item => (
                      <div key={item.id} className="Dashboard-activity-item">
                        <div className="Dashboard-activity-content">
                          <p className="Dashboard-activity-message">{item.message}</p>
                          <span className="Dashboard-activity-time">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardWidget>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
