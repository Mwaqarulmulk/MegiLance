import api from '@/lib/api';
import { unwrapResponse, getTotalCount } from './base.service';

export interface Notification {
  id: string | number;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  unread?: boolean;
  created_at?: string;
  action_url?: string;
}

export async function fetchNotifications(page = 1, pageSize = 20) {
  try {
    const res = await api.notifications.list(page, pageSize);
    return {
      items: unwrapResponse<Notification>(res),
      total: getTotalCount(res),
    };
  } catch (err) {
    return { items: [], total: 0 };
  }
}

export async function markNotificationRead(id: string | number) {
  try {
    await api.notifications.markAsRead(id);
    return true;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead() {
  try {
    await api.notifications.markAllAsRead();
    return true;
  } catch {
    return false;
  }
}

export async function deleteNotification(id: string | number) {
  try {
    await api.notifications.delete(id);
    return true;
  } catch {
    return false;
  }
}
