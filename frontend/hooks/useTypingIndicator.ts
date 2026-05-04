// @AI-HINT: Hook for managing typing indicators in conversations via WebSocket.
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface TypingUser {
  userId: number;
  userName: string;
  conversationId: number;
}

export function useTypingIndicator(conversationId?: number) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { connected, on, off, send } = useWebSocket();
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const lastSentRef = useRef<number>(0);

  // Listen for typing events
  useEffect(() => {
    if (!connected) return;

    const handleTyping = (data: { user_id: number; user_name: string; conversation_id: number; is_typing: boolean }) => {
      if (conversationId && data.conversation_id !== conversationId) return;

      if (data.is_typing) {
        setTypingUsers(prev => {
          if (prev.some(u => u.userId === data.user_id && u.conversationId === data.conversation_id)) {
            return prev;
          }
          return [...prev, { userId: data.user_id, userName: data.user_name, conversationId: data.conversation_id }];
        });

        // Auto-remove after 4 seconds of no typing
        const key = data.user_id;
        const existing = timeoutsRef.current.get(key);
        if (existing) clearTimeout(existing);
        timeoutsRef.current.set(key, setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.user_id));
          timeoutsRef.current.delete(key);
        }, 4000));
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.user_id));
        const existing = timeoutsRef.current.get(data.user_id);
        if (existing) {
          clearTimeout(existing);
          timeoutsRef.current.delete(data.user_id);
        }
      }
    };

    on('typing_indicator', handleTyping);
    on('user_typing', handleTyping);

    return () => {
      off('typing_indicator', handleTyping);
      off('user_typing', handleTyping);
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current.clear();
    };
  }, [connected, conversationId, on, off]);

  // Send typing event (throttled to max once per 2 seconds)
  const sendTyping = useCallback((convId: number, userId: number, userName: string) => {
    const now = Date.now();
    if (now - lastSentRef.current < 2000) return;
    lastSentRef.current = now;

    send('typing_indicator', {
      conversation_id: convId,
      user_id: userId,
      user_name: userName,
      is_typing: true,
    });
  }, [send]);

  const stopTyping = useCallback((convId: number, userId: number) => {
    send('typing_indicator', {
      conversation_id: convId,
      user_id: userId,
      is_typing: false,
    });
  }, [send]);

  const isAnyoneTyping = typingUsers.length > 0;

  const getTypingText = useCallback(() => {
    if (typingUsers.length === 0) return '';
    if (typingUsers.length === 1) return `${typingUsers[0].userName} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    return `${typingUsers[0].userName} and ${typingUsers.length - 1} others are typing...`;
  }, [typingUsers]);

  return {
    typingUsers,
    isAnyoneTyping,
    getTypingText,
    sendTyping,
    stopTyping,
  };
}
