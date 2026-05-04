// @AI-HINT: Hook for tracking online/offline status of users via WebSocket events and REST API fallback.
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { realtimeApi, getAuthToken } from '@/lib/api';

interface OnlineStatusMap {
  [userId: number]: boolean;
}

export function useOnlineStatus(userIds: number[] = []) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineStatusMap>({});
  const { connected, on, off } = useWebSocket();
  const fetchedRef = useRef(false);

  // Fetch initial online status
  useEffect(() => {
    if (fetchedRef.current || userIds.length === 0) return;
    fetchedRef.current = true;

    const token = getAuthToken();
    if (!token) return;

    (async () => {
      try {
        const data = await realtimeApi.getOnlineUsers();
        const onlineSet = new Set(data?.online_users || []);
        const statusMap: OnlineStatusMap = {};
        userIds.forEach(id => {
          statusMap[id] = onlineSet.has(id);
        });
        setOnlineUsers(statusMap);
      } catch {
        // Silently fail - all users shown as offline
      }
    })();
  }, [userIds]);

  // Listen for WebSocket user_status events
  useEffect(() => {
    if (!connected) return;

    const handleUserStatus = (data: { user_id: number; status: string }) => {
      setOnlineUsers(prev => ({
        ...prev,
        [data.user_id]: data.status === 'online',
      }));
    };

    on('user_status', handleUserStatus);
    return () => {
      off('user_status', handleUserStatus);
    };
  }, [connected, on, off]);

  const isOnline = useCallback((userId: number) => {
    return onlineUsers[userId] ?? false;
  }, [onlineUsers]);

  return { onlineUsers, isOnline };
}
