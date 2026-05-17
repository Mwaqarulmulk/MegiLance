export {
  fetchWithFallback,
  unwrapResponse,
  errorToString,
  getTotalCount,
} from './base.service';

export {
  normalizeUser,
  normalizeCurrentUser,
  getRedirectPath,
  setupTokenRefresh,
  broadcastLogout,
} from './auth.service';
export type { User, CurrentUser } from './auth.service';

export {
  fetchDashboardData,
  buildMetrics,
  buildRecentProjects,
  buildActivityFeed,
  formatTimeAgo,
  getActivityIcon,
} from './dashboard.service';
export type {
  DashboardData,
  DashboardMetric,
  DashboardProject,
  DashboardActivity,
} from './dashboard.service';

export {
  fetchMyProjects,
  fetchProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatusLabel,
  getBudgetDisplay,
} from './project.service';
export type { ProjectFilters } from './project.service';

export {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from './notification.service';
export type { Notification } from './notification.service';

export {
  fetchUserProfile,
  updateProfile,
  uploadAvatar,
} from './user.service';
export type { ProfileData } from './user.service';
