// @AI-HINT: Admin dashboard, analytics, metrics, audit trail, compliance, feature flags API
import { apiFetch } from './core';
import type { ResourceId } from './core';

export const adminApi = {
  getDashboardStats: () => apiFetch('/admin/dashboard/stats'),
  getUserActivity: () => apiFetch('/admin/dashboard/user-activity'),
  getProjectMetrics: () => apiFetch('/admin/dashboard/project-metrics'),
  getFinancialMetrics: () => apiFetch('/admin/dashboard/financial-metrics'),
  getTopFreelancers: (limit = 10) => apiFetch(`/admin/dashboard/top-freelancers?limit=${limit}`),
  getTopClients: (limit = 10) => apiFetch(`/admin/dashboard/top-clients?limit=${limit}`),
  getRecentActivity: (limit = 20) => apiFetch(`/admin/dashboard/recent-activity?limit=${limit}`),
  
  getUsers: (filters?: { role?: string; search?: string; page?: number; page_size?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/admin/users?${params}`);
  },
  
  toggleUserStatus: (userId: ResourceId) => 
    apiFetch(`/admin/users/${userId}/toggle-status`, { method: 'POST' }),
    
  getProjects: (filters?: { status?: string; page?: number; page_size?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/admin/projects?${params}`);
  },
  
  getPayments: (filters?: { status?: string; page?: number; page_size?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/admin/payments?${params}`);
  },
  
  getAnalytics: () => apiFetch('/admin/analytics/overview'),
  getSettings: () => apiFetch('/admin/settings'),
  getPlatformReviewStats: () => apiFetch('/admin/dashboard/reviews'),
  getFraudAlerts: (limit = 10) => apiFetch(`/admin/dashboard/fraud?limit=${limit}`),
};

export const analyticsApi = {
  getDashboardSummary: () => apiFetch('/analytics/dashboard/summary'),
  
  getRegistrationTrends: (startDate: string, endDate: string, interval: 'day' | 'week' | 'month' = 'day') => 
    apiFetch(`/analytics/users/registration-trends?start_date=${startDate}&end_date=${endDate}&interval=${interval}`),
    
  getRevenueTrends: (startDate: string, endDate: string, interval: 'day' | 'week' | 'month' = 'day') => 
    apiFetch(`/analytics/revenue/trends?start_date=${startDate}&end_date=${endDate}&interval=${interval}`),
    
  getActiveUserStats: (days: number = 30) => 
    apiFetch(`/analytics/users/active-stats?days=${days}`),
    
  getCompletionRate: () => 
    apiFetch('/analytics/projects/completion-rate'),

  getUserDistribution: () => 
    apiFetch('/analytics/users/location-distribution'),

  getPlatformHealth: () =>
    apiFetch('/analytics/platform/health'),

  getEngagementMetrics: (days: number = 30) =>
    apiFetch(`/analytics/engagement/metrics?days=${days}`),

  getRevenueStats: (days: number = 30) =>
    apiFetch(`/analytics/revenue/stats?days=${days}`),

  getRegistrationCohorts: (months: number = 6) =>
    apiFetch(`/analytics/cohorts/registration?months=${months}`),

  getConversionFunnel: () =>
    apiFetch('/analytics/funnel/conversion'),

  getGrowthSummary: () =>
    apiFetch('/analytics/growth/summary'),
};

export const metricsApi = {
  getRealtime: () => apiFetch('/metrics/realtime'),
  getOverview: (period = '30d') => apiFetch(`/metrics/overview?period=${period}`),
  getRevenue: (startDate: string, endDate: string, interval = 'day') =>
    apiFetch(`/metrics/revenue?start_date=${startDate}&end_date=${endDate}&interval=${interval}`),
  getUsers: (period = '30d') => apiFetch(`/metrics/users?period=${period}`),
  getProjects: (period = '30d') => apiFetch(`/metrics/projects?period=${period}`),
  getConversions: (period = '30d') => apiFetch(`/metrics/conversions?period=${period}`),
  getCustom: (metricId: ResourceId, filters?: Record<string, string>) => {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return apiFetch(`/metrics/custom/${metricId}${params}`);
  },
};

export const auditTrailApi = {
  getEvents: (filters?: {
    event_type?: string;
    actor_id?: string;
    resource_type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/audit-trail/events?${params}`);
  },
  getEvent: (eventId: ResourceId) => apiFetch(`/audit-trail/events/${eventId}`),
  createEvent: (data: {
    event_type: string;
    resource_type: string;
    resource_id: string;
    action: string;
    details?: Record<string, unknown>;
  }) =>
    apiFetch('/audit-trail/events', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSummary: (days = 30) => apiFetch(`/audit-trail/summary?days=${days}`),
  getUserActivity: (userId: ResourceId, page = 1, pageSize = 50) =>
    apiFetch(`/audit-trail/user/${userId}/activity?page=${page}&page_size=${pageSize}`),
  getResourceHistory: (resourceType: string, resourceId: ResourceId) =>
    apiFetch(`/audit-trail/resource/${resourceType}/${resourceId}/history`),
  exportLogs: (filters: Record<string, string>, format = 'csv') =>
    apiFetch('/audit-trail/export', {
      method: 'POST',
      body: JSON.stringify({ filter: filters, format }),
    }),
  getExportStatus: (exportId: ResourceId) => apiFetch(`/audit-trail/export/${exportId}/status`),
  getComplianceReport: (startDate: string, endDate: string) =>
    apiFetch(`/audit-trail/compliance/report?start_date=${startDate}&end_date=${endDate}`),
  getRetentionPolicy: () => apiFetch('/audit-trail/retention/policy'),
  updateRetentionPolicy: (retentionDays: number) =>
    apiFetch(`/audit-trail/retention/policy?retention_days=${retentionDays}`, { method: 'PUT' }),
};

export const complianceApi = {
  getStatus: () => apiFetch('/compliance/status'),
  getGDPRStatus: () => apiFetch('/compliance/gdpr'),
  requestDataExport: () => apiFetch('/compliance/gdpr/export', { method: 'POST' }),
  requestDataDeletion: (reason: string) =>
    apiFetch('/compliance/gdpr/delete', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  getConsents: () => apiFetch('/compliance/consents'),
  updateConsent: (consentType: string, granted: boolean) =>
    apiFetch(`/compliance/consents/${consentType}`, {
      method: 'PUT',
      body: JSON.stringify({ granted }),
    }),
  getAuditReport: (reportType: string) => apiFetch(`/compliance/reports/${reportType}`),
};

export const featureFlagsApi = {
  checkFlag: (flagName: string) => apiFetch(`/feature-flags/check/${flagName}`),
  checkMultiple: (flagNames: string[]) =>
    apiFetch('/feature-flags/check-multiple', { method: 'POST', body: JSON.stringify({ flag_names: flagNames }) }),
  myFlags: () => apiFetch('/feature-flags/my-flags'),
  adminList: () => apiFetch('/feature-flags/admin/all'),
  adminGet: (flagName: string) => apiFetch(`/feature-flags/admin/${flagName}`),
  adminCreate: (data: { name: string; description?: string; rollout_percentage?: number; rollout_type?: string; variants?: unknown[]; default_variant?: string; is_active?: boolean }) =>
    apiFetch('/feature-flags/admin/create', { method: 'POST', body: JSON.stringify(data) }),
  adminUpdate: (flagName: string, data: Record<string, unknown>) =>
    apiFetch(`/feature-flags/admin/${flagName}`, { method: 'PUT', body: JSON.stringify(data) }),
  adminDelete: (flagName: string) =>
    apiFetch(`/feature-flags/admin/${flagName}`, { method: 'DELETE' }),
  adminRollout: (flagName: string, percentage: number) =>
    apiFetch(`/feature-flags/admin/${flagName}/rollout`, { method: 'POST', body: JSON.stringify({ percentage }) }),
  adminAnalytics: (flagName: string) => apiFetch(`/feature-flags/admin/${flagName}/analytics`),
  adminAnalyticsSummary: () => apiFetch('/feature-flags/admin/analytics/summary'),
};
