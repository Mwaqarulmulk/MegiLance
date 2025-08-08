// @AI-HINT: This file provides static mock data for the dashboard components. Using mock data is a crucial practice for frontend-first development, allowing for UI/UX perfection without backend dependencies, which is a core requirement for this project.

import { DashboardMetric, RecentProject, ActivityFeedItem } from './types';

export const mockMetrics: DashboardMetric[] = [
  {
    id: 1,
    label: 'Total Revenue',
    value: '$48,895.00',
    icon: 'FaChartBar',
    change: '+12.5%',
    changeType: 'increase',
  },
  {
    id: 2,
    label: 'Active Projects',
    value: '24',
    icon: 'FaBriefcase',
  },
  {
    id: 3,
    label: 'Completed Tasks',
    value: '1,284',
    icon: 'FaTasks',
    change: '-2.1%',
    changeType: 'decrease',
  },
  {
    id: 4,
    label: 'Active Clients',
    value: '16',
    icon: 'FaUsers',
  },
];

export const mockRecentProjects: RecentProject[] = [
  {
    id: 1,
    title: 'Project Phoenix - UI/UX Overhaul',
    client: 'Innovate Inc.',
    status: 'In Progress',
    progress: 75,
    deadline: '2024-08-15',
    budget: '$15,000',
  },
  {
    id: 2,
    title: 'E-commerce Platform Migration',
    client: 'Shopify Masters',
    status: 'Completed',
    progress: 100,
    deadline: '2024-07-20',
    budget: '$25,000',
  },
  {
    id: 3,
    title: 'Mobile App Development (iOS)',
    client: 'Appify Solutions',
    status: 'Review',
    progress: 90,
    deadline: '2024-08-01',
    budget: '$30,000',
  },
    {
    id: 4,
    title: 'Marketing Campaign Analytics',
    client: 'DataDriven Co.',
    status: 'Overdue',
    progress: 60,
    deadline: '2024-07-25',
    budget: '$8,500',
  },
];

export const mockActivityFeed: ActivityFeedItem[] = [
  {
    id: 1,
    message: 'Client payment received from Innovate Inc.',
    time: '2 hours ago',
    icon: 'FaDollarSign',
    amount: '+$5,000',
  },
  {
    id: 2,
    message: 'New project started: E-commerce Platform Migration',
    time: '1 day ago',
    icon: 'FaBriefcase',
  },
  {
    id: 3,
    message: 'Task completed: Design user profile page',
    time: '3 days ago',
    icon: 'FaTasks',
  },
  {
    id: 4,
    message: 'New client onboarded: Appify Solutions',
    time: '5 days ago',
    icon: 'FaUsers',
  },
];
