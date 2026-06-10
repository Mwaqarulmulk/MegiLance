'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  Send, Paperclip, Loader2, CheckCheck, Check,
  Phone, Video, MoreVertical, Smile,
} from 'lucide-react';
import UserAvatar from '@/app/components/atoms/UserAvatar/UserAvatar';

import commonStyles from './RealtimeChat.common.module.css';
import lightStyles from './RealtimeChat.light.module.css';
import darkStyles from './RealtimeChat.dark.module.css';

const toNumericUserId = (value: string | number | undefined): number | null => {
  if (value === undefined || value === null) return null;
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const toMessageId = (value: string | number | undefined): string => String(value ?? Date.now());

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  timestamp: string;
  read_by?: string[];
  read_at?: string;
  metadata?: {
    attachment_url?: string;
    attachment_name?: string;
  };
}

interface RealtimeChatProps {
  roomId: string;
  conversationId: number;
  currentUserId: string;
  currentUserName: string;
  otherUserId?: number;
  otherUserName?: string;
  otherUserAvatar?: string;
  isDemo?: boolean;
}

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'd1', sender_id: 'other', sender_name: 'Alex Johnson',
    message: 'Hi! I reviewed your portfolio and I\'m really impressed with your work.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'd2', sender_id: 'me', sender_name: 'You',
    message: 'Thank you! I\'d love to work on your project. What are the main requirements?',
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    read_by: ['other'],
  },
  {
    id: 'd3', sender_id: 'other', sender_name: 'Alex Johnson',
    message: 'We need a full-stack web app with React and Node.js. The timeline is about 3 months.',
    timestamp: new Date(Date.now() - 6800000).toISOString(),
  },
  {
    id: 'd4', sender_id: 'other', sender_name: 'Alex Johnson',
    message: 'Budget is flexible for the right candidate. Can you share your rate?',
    timestamp: new Date(Date.now() - 6750000).toISOString(),
  },
  {
    id: 'd5', sender_id: 'me', sender_name: 'You',
    message: 'I charge $85/hr for full-stack development. For a 3-month project I can offer a small discount.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read_by: ['other'],
  },
  {
    id: 'd6', sender_id: 'other', sender_name: 'Alex Johnson',
    message: 'That sounds great! Can we schedule a call to discuss the details?',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
];

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateSep(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function needsSep(prev: ChatMessage | undefined, curr: ChatMessage): boolean {
  if (!prev) return true;
  return new Date(prev.timestamp).toDateString() !== new Date(curr.timestamp).toDateString();
}

const RealtimeChat: React.FC<RealtimeChatProps> = ({
  roomId,
  conversationId,
  currentUserId,
  currentUserName,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  isDemo,
}) => {
  const { resolvedTheme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { connected, on, off, joinRoom, leaveRoom, sendMessage, sendReadReceipt } = useWebSocket({ autoConnect: true });
  const { isAnyoneTyping, sendTyping, stopTyping } = useTypingIndicator(conversationId);
  const { isOnline } = useOnlineStatus(otherUserId ? [otherUserId] : []);
  const otherOnline = otherUserId ? isOnline(otherUserId) : false;
  const numericCurrentUserId = toNumericUserId(currentUserId);

  const buildDemoMessages = useCallback((): ChatMessage[] => {
    return DEMO_MESSAGES.map(m => ({
      ...m,
      sender_id: m.sender_id === 'me' ? currentUserId : 'other',
      sender_name: m.sender_id === 'me' ? currentUserName : (otherUserName || 'User'),
    }));
  }, [currentUserId, currentUserName, otherUserName]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingHistory(true);
      try {
        if (isDemo) throw new Error('demo');
        const data = await (api as any).messages.getMessages?.(conversationId);
        if (cancelled) return;
        if (data && Array.isArray(data) && data.length > 0) {
          setMessages(data.map((msg: any) => ({
            id: msg.id.toString(),
            sender_id: msg.sender_id.toString(),
            sender_name: msg.sender_id.toString() === currentUserId ? currentUserName : (otherUserName || 'User'),
            message: msg.content,
            timestamp: msg.created_at,
            read_at: msg.read_at,
            metadata: msg.attachments ? { attachment_url: msg.attachments.url, attachment_name: msg.attachments.name } : undefined,
          })).reverse());
        } else {
          // Empty conversation — no demo data
          setMessages([]);
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [conversationId, currentUserId, currentUserName, otherUserName, isDemo, buildDemoMessages]);

  useEffect(() => {
    if (!connected || isDemo) return;
    joinRoom(roomId);
    const handleMsg = (data: any) => {
      const senderId = toMessageId(data.user_id ?? data.sender_id);
      const msg: ChatMessage = {
        id: toMessageId(data.id),
        sender_id: senderId,
        sender_name: data.sender_name || 'User',
        message: data.message,
        timestamp: data.timestamp,
        metadata: { attachment_url: data.attachment_url, attachment_name: data.attachment_name },
      };
      setMessages(prev => [...prev, msg]);
      if (senderId !== currentUserId && numericCurrentUserId !== null && Number.isFinite(Number(msg.id))) {
        sendReadReceipt(Number(msg.id), conversationId);
      }
    };
    const handleReceipt = (data: { message_id: string; read_by: string; read_at: string }) => {
      setMessages(prev => prev.map(m => m.id === data.message_id
        ? { ...m, read_by: [...(m.read_by || []), data.read_by], read_at: data.read_at }
        : m
      ));
    };
    on('new_message', handleMsg);
    on('read_receipt', handleReceipt);
    return () => { off('new_message', handleMsg); off('read_receipt', handleReceipt); leaveRoom(roomId); };
  }, [connected, roomId, currentUserId, conversationId, isDemo, joinRoom, leaveRoom, on, off, sendReadReceipt, numericCurrentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    resizeTextarea();
    if (numericCurrentUserId !== null) {
      sendTyping(conversationId, numericCurrentUserId, currentUserName);
    }
  };

  const handleSend = useCallback(async () => {
    const text = newMessage.trim();
    if (!text) return;
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (numericCurrentUserId !== null) {
      stopTyping(conversationId, numericCurrentUserId);
    }
    const opt: ChatMessage = {
      id: Date.now().toString(), sender_id: currentUserId, sender_name: currentUserName,
      message: text, timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, opt]);
    if (!isDemo) {
      try {
        await (api as any).messages.sendMessage({ conversation_id: conversationId, receiver_id: otherUserId, content: text });
        sendMessage(roomId, text, { sender_id: currentUserId, sender_name: currentUserName });
      } catch { /* optimistic shown */ }
    }
  }, [newMessage, conversationId, currentUserId, currentUserName, otherUserId, roomId, isDemo, sendMessage, stopTyping, numericCurrentUserId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const res = isDemo ? null : await (api as any).uploads.upload('document', file);
      const url = res?.url || '#';
      const opt: ChatMessage = {
        id: Date.now().toString(), sender_id: currentUserId, sender_name: currentUserName,
        message: `Sent an attachment: ${file.name}`,
        timestamp: new Date().toISOString(),
        metadata: { attachment_url: url, attachment_name: file.name },
      };
      setMessages(prev => [...prev, opt]);
    } catch { /* ignore */ } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const readStatus = (msg: ChatMessage) => {
    if (msg.sender_id !== currentUserId) return null;
    if (msg.read_by && msg.read_by.length > 0) return <CheckCheck size={13} style={{ color: '#60a5fa' }} />;
    return <Check size={13} style={{ opacity: 0.45 }} />;
  };

  const th = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, th.container)}>
      {/* Header */}
      <div className={cn(commonStyles.header, th.header)}>
        <div className={commonStyles.headerUser}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <UserAvatar src={otherUserAvatar || ''} name={otherUserName || 'User'} size="small" />
            <span style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: '50%',
              background: otherOnline ? '#22c55e' : '#9ca3af',
              border: '2px solid transparent',
            }} />
          </div>
          <div className={commonStyles.headerUserInfo}>
            <span className={cn(commonStyles.headerName, th.headerName)}>{otherUserName || 'User'}</span>
            <span className={cn(commonStyles.headerStatus, th.headerStatus)}>
              {otherOnline ? '● Active now' : '○ Offline'}
            </span>
          </div>
        </div>
        <div className={commonStyles.headerActions}>
          <button className={cn(commonStyles.iconBtn, th.iconBtn)} title="Voice call"><Phone size={17} /></button>
          <button className={cn(commonStyles.iconBtn, th.iconBtn)} title="Video call"><Video size={17} /></button>
          <button className={cn(commonStyles.iconBtn, th.iconBtn)} title="More"><MoreVertical size={17} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className={cn(commonStyles.messagesArea, th.messagesArea)}>
        {loadingHistory ? (
          <div className={commonStyles.centerState}>
            <Loader2 size={22} className={commonStyles.spinIcon} />
            <span style={{ fontSize: '0.875rem', opacity: 0.5, marginTop: 8 }}>Loading…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className={commonStyles.centerState}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👋</div>
            <p style={{ fontWeight: 600 }}>Say hello!</p>
            <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Start the conversation.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const isOwn = msg.sender_id === currentUserId;
              const prev = messages[idx - 1];
              return (
                <div key={msg.id}>
                  {needsSep(prev, msg) && (
                    <div className={cn(commonStyles.dateSep, th.dateSep)}>
                      <span>{formatDateSep(msg.timestamp)}</span>
                    </div>
                  )}
                  <div className={cn(commonStyles.msgRow, isOwn ? commonStyles.msgRowOwn : commonStyles.msgRowOther)}>
                    {!isOwn && (
                      <div style={{ flexShrink: 0, alignSelf: 'flex-end' }}>
                        <UserAvatar src={otherUserAvatar || ''} name={msg.sender_name} size="small" />
                      </div>
                    )}
                    <div className={cn(
                      commonStyles.bubble,
                      isOwn ? cn(commonStyles.bubbleOwn, th.bubbleOwn) : cn(commonStyles.bubbleOther, th.bubbleOther)
                    )}>
                      <div className={commonStyles.bubbleText}>{msg.message}</div>
                      {msg.metadata?.attachment_url && (
                        <a
                          href={msg.metadata.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(commonStyles.attachment, th.attachment)}
                        >
                          <Paperclip size={13} />
                          <span>{msg.metadata.attachment_name || 'Attachment'}</span>
                        </a>
                      )}
                      <div className={cn(commonStyles.bubbleMeta, isOwn && commonStyles.bubbleMetaOwn)}>
                        <span className={cn(commonStyles.bubbleTime, th.bubbleTime)}>{formatMsgTime(msg.timestamp)}</span>
                        {readStatus(msg)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {isAnyoneTyping && (
              <div className={cn(commonStyles.msgRow, commonStyles.msgRowOther)}>
                <UserAvatar src={otherUserAvatar || ''} name={otherUserName || 'User'} size="small" />
                <div className={cn(commonStyles.bubble, commonStyles.bubbleOther, th.bubbleOther, commonStyles.typingBubble)}>
                  <span className={commonStyles.dot} />
                  <span className={commonStyles.dot} />
                  <span className={commonStyles.dot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className={cn(commonStyles.inputArea, th.inputArea)}>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        <button
          className={cn(commonStyles.inputIconBtn, th.inputIconBtn)}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          aria-label="Attach file"
        >
          {isUploading ? <Loader2 size={18} className={commonStyles.spinIcon} /> : <Paperclip size={18} />}
        </button>
        <button className={cn(commonStyles.inputIconBtn, th.inputIconBtn)} aria-label="Emoji">
          <Smile size={18} />
        </button>
        <div className={commonStyles.textareaWrap}>
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherUserName || 'User'}…`}
            className={cn(commonStyles.textarea, th.textarea)}
            rows={1}
            aria-label="Type a message"
          />
        </div>
        <button
          className={cn(commonStyles.sendBtn, th.sendBtn, newMessage.trim() ? commonStyles.sendBtnActive : '')}
          onClick={handleSend}
          disabled={!newMessage.trim()}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default RealtimeChat;
