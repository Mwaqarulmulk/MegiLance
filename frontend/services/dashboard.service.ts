import api from '@/lib/api';
import { fetchWithFallback, unwrapResponse, getTotalCount } from './base.service';

export interface DashboardMetric {
  id: number;
  label: string;
  value: string;
  icon: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export interface DashboardProject {
  id: number;
  title: string;
  client: string;
  status: 'In Progress' | 'Review' | 'Completed' | 'Overdue';
  progress: number;
  deadline: string;
  budget?: string;
}

export interface DashboardActivity {
  id: number;
  message: string;
  time: string;
  icon: string;
  amount?: string;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  recentProjects: DashboardProject[];
  activityFeed: DashboardActivity[];
  unreadMessages: number;
}

interface ActivityFeedItem {
  id: number;
  activity_type?: string;
  type?: string;
  description?: string;
  message?: string;
  amount?: number;
  created_at?: string;
}

interface DashboardProjectResponse {
  id?: number;
  title?: string;
  client_name?: string;
  client_id?: number;
  status?: string;
  progress?: number;
  deadline?: string;
  updated_at?: string;
  budget_max?: number;
}

export function getActivityIcon(type: string): string {
  switch (type) {
    case 'payment': case 'payment_received': return 'FaDollarSign';
    case 'project': case 'project_created': return 'FaBriefcase';
    case 'proposal': case 'proposal_submitted': return 'FaFileAlt';
    case 'contract': case 'contract_created': return 'FaHandshake';
    case 'review': case 'review_received': return 'FaStar';
    case 'milestone': case 'milestone_completed': return 'FaCheckCircle';
    case 'message': return 'FaEnvelope';
    default: return 'FaBell';
  }
}

export function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function buildMetrics(
  stats: { active_projects?: number; total_earnings?: number; pending_proposals?: number; completed_projects?: number },
  projects: DashboardProjectResponse[]
): DashboardMetric[] {
  return [
    {
      id: 1,
      label: 'Active Projects',
      value: String(stats.active_projects || projects.filter((p) => p.status === 'in_progress').length || 0),
      icon: 'FaBriefcase',
    },
    {
      id: 2,
      label: 'Total Earnings',
      value: `$${((stats.total_earnings || 0) / 1000).toFixed(1)}K`,
      icon: 'FaChartBar',
    },
    {
      id: 3,
      label: 'Pending Proposals',
      value: String(stats.pending_proposals || 0),
      icon: 'FaTasks',
    },
    {
      id: 4,
      label: 'Completed',
      value: String(stats.completed_projects || projects.filter((p) => p.status === 'completed').length || 0),
      icon: 'FaUsers',
    },
  ];
}

export function buildRecentProjects(projects: DashboardProjectResponse[]): DashboardProject[] {
  return projects.slice(0, 4).map((p, idx) => ({
    id: p.id || idx + 1,
    title: p.title || 'Untitled Project',
    client: p.client_name || `Client #${p.client_id}`,
    status: p.status === 'in_progress' ? 'In Progress'
      : p.status === 'completed' ? 'Completed'
      : p.status === 'review' ? 'Review'
      : 'In Progress',
    progress: p.progress || 0,
    deadline: p.deadline || p.updated_at || new Date().toISOString(),
    budget: p.budget_max ? `$${p.budget_max.toLocaleString()}` : undefined,
  }));
}

export function buildActivityFeed(raw: unknown): DashboardActivity[] {
  const items: ActivityFeedItem[] = unwrapResponse<ActivityFeedItem>(raw, 'activities');
  return items.map((item, idx) => ({
    id: item.id || idx + 1,
    message: item.description || item.message || 'Activity recorded',
    time: formatTimeAgo(item.created_at || ''),
    icon: getActivityIcon(item.activity_type || item.type || ''),
    amount: item.amount ? `$${item.amount.toLocaleString()}` : undefined,
  }));
}

export async function fetchDashboardData(userRole: 'client' | 'freelancer' | 'admin'): Promise<DashboardData> {
  const statsPromise = userRole === 'client'
    ? api.portal.client.getDashboardStats()
    : userRole === 'admin'
      ? api.admin.getDashboardStats()
      : api.portal.freelancer.getDashboardStats();

  const projectsPromise = userRole === 'client'
    ? api.portal.client.getProjects()
    : api.portal.freelancer.getProjects();

  const [statsRes, projectsRes, activityRes, unreadRes] = await Promise.all([
    fetchWithFallback(statsPromise, {}, 'dashboard.stats'),
    fetchWithFallback(projectsPromise, { projects: [] }, 'dashboard.projects'),
    fetchWithFallback(api.activityFeed.list({ page: 1, page_size: 10 }).catch(() => ({ activities: [] })), { activities: [] }, 'dashboard.activity'),
    fetchWithFallback(api.messages.getUnreadCount().catch(() => ({ unread_count: 0 })), { unread_count: 0 }, 'dashboard.unread'),
  ]);

  const projects: DashboardProjectResponse[] = (projectsRes as { projects?: DashboardProjectResponse[] }).projects || [];
  const stats = statsRes as { active_projects?: number; total_earnings?: number; pending_proposals?: number; completed_projects?: number };

  return {
    metrics: buildMetrics(stats, projects),
    recentProjects: buildRecentProjects(projects),
    activityFeed: buildActivityFeed(activityRes),
    unreadMessages: getTotalCount(unreadRes),
  };
}
