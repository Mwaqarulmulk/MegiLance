// @AI-HINT: WebSocket custom hook - manages Socket.IO connection and events
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket as SocketIOSocket } from 'socket.io-client';

type Socket = SocketIOSocket;

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found for WebSocket connection');
      return;
    }

    // Create socket connection
    const newSocket = io(url, {
      path: '/ws/socket.io',
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, [url, autoConnect]);

  const send = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  const on = useCallback((event: string, handler: (data: any) => void) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event: string, handler?: (data: any) => void) => {
    if (handler) {
      socketRef.current?.off(event, handler);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    send('join_room', { room });
  }, [send]);

  const leaveRoom = useCallback((room: string) => {
    send('leave_room', { room });
  }, [send]);

  const sendMessage = useCallback((room: string, message: string, metadata?: any) => {
    send('message', {
      room,
      message,
      metadata,
    });
  }, [send]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    setConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return {
    socket,
    connected,
    messages,
    send,
    on,
    off,
    joinRoom,
    leaveRoom,
    sendMessage,
    disconnect,
    reconnect,
  };
};
