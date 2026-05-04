// @AI-HINT: Global context for real-time unread message/notification counts.
// Subscribes to WebSocket events and polls periodically for counts.
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { messagesApi, notificationsApi } from '@/lib/api';
import { getAuthToken } from '@/lib/api';

interface UnreadCounts {
  messages: number;
  notifications: number;
}

interface UnreadCountContextValue {
  counts: UnreadCounts;
  refreshCounts: () => void;
  decrementMessages: (by?: number) => void;
  decrementNotifications: (by?: number) => void;
  clearMessages: () => void;
  clearNotifications: () => void;
}

const UnreadCountContext = createContext<UnreadCountContextValue>({
  counts: { messages: 0, notifications: 0 },
  refreshCounts: () => {},
  decrementMessages: () => {},
  decrementNotifications: () => {},
  clearMessages: () => {},
  clearNotifications: () => {},
});

export const useUnreadCounts = () => useContext(UnreadCountContext);

const POLL_INTERVAL = 60_000; // 60 seconds

export const UnreadCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [counts, setCounts] = useState<UnreadCounts>({ messages: 0, notifications: 0 });
  const { connected, on, off } = useWebSocket();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchCounts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const [msgRes, notifRes] = await Promise.allSettled([
        messagesApi.getUnreadCount(),
        notificationsApi.list(1, 1),
      ]);

      setCounts(prev => {
        const next = { ...prev };
        if (msgRes.status === 'fulfilled') {
          const data = msgRes.value as any;
          next.messages = data?.unread_count ?? data?.count ?? 0;
        }
        if (notifRes.status === 'fulfilled') {
          const data = notifRes.value as any;
          next.notifications = data?.unread_count ?? (data?.notifications || []).filter((n: any) => !n.is_read).length ?? 0;
        }
        return next;
      });
    } catch {
      // Silently fail - counts stay as-is
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchCounts();
    pollRef.current = setInterval(fetchCounts, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchCounts]);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = () => {
      setCounts(prev => ({ ...prev, messages: prev.messages + 1 }));
    };

    const handleNewNotification = () => {
      setCounts(prev => ({ ...prev, notifications: prev.notifications + 1 }));
    };

    const handleMessageRead = () => {
      setCounts(prev => ({ ...prev, messages: Math.max(0, prev.messages - 1) }));
    };

    const handleNotificationRead = () => {
      setCounts(prev => ({ ...prev, notifications: Math.max(0, prev.notifications - 1) }));
    };

    on('new_message', handleNewMessage);
    on('notification', handleNewNotification);
    on('message_read', handleMessageRead);
    on('notification_read', handleNotificationRead);

    return () => {
      off('new_message', handleNewMessage);
      off('notification', handleNewNotification);
      off('message_read', handleMessageRead);
      off('notification_read', handleNotificationRead);
    };
  }, [connected, on, off]);

  const refreshCounts = useCallback(() => {
    fetchCounts();
  }, [fetchCounts]);

  const decrementMessages = useCallback((by = 1) => {
    setCounts(prev => ({ ...prev, messages: Math.max(0, prev.messages - by) }));
  }, []);

  const decrementNotifications = useCallback((by = 1) => {
    setCounts(prev => ({ ...prev, notifications: Math.max(0, prev.notifications - by) }));
  }, []);

  const clearMessages = useCallback(() => {
    setCounts(prev => ({ ...prev, messages: 0 }));
  }, []);

  const clearNotifications = useCallback(() => {
    setCounts(prev => ({ ...prev, notifications: 0 }));
  }, []);

  return (
    <UnreadCountContext.Provider value={{
      counts,
      refreshCounts,
      decrementMessages,
      decrementNotifications,
      clearMessages,
      clearNotifications,
    }}>
      {children}
    </UnreadCountContext.Provider>
  );
};
