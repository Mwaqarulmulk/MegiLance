// @AI-HINT: This file defines the TypeScript types for the MegiLance dashboard components. Centralizing types ensures data consistency, type safety, and easier maintenance across the modular dashboard architecture, adhering to premium SaaS development standards.

/**
 * Represents the authenticated user.
 * This type is used across all dashboard components to ensure consistency.
 */
export interface User {
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
  notificationCount: number;
}



/**
 * Represents a single metric displayed on the dashboard.
 * Conforms to investor-grade UI standards for data visualization.
 */
export interface DashboardMetric {
  id: number | string;
  label: string;
  value: string;
  icon: string;
  // Optional: for future trend indicators
  change?: string;
  changeType?: 'increase' | 'decrease';
}

/**
 * Represents a recent project in the dashboard list.
 * Designed for clarity and quick status assessment, matching premium SaaS UIs.
 */
export interface RecentProject {
  id: number | string;
  title: string;
  client: string;
  status: 'In Progress' | 'Review' | 'Completed' | 'Overdue';
  progress: number;
  deadline: string;
  budget: string;
}

/**
 * Represents a single item in the user's activity feed.
 * Provides a clear and concise log of recent platform events.
 */

export interface ActivityFeedItem {
  id: number | string;
  message: string;
  time: string;
  icon: string;
  // Optional: for transaction-related activities
  amount?: string;
}
