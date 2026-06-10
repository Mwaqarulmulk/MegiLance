'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { Search, MessageSquarePlus } from 'lucide-react';
import UserAvatar from '@/app/components/atoms/UserAvatar/UserAvatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import commonStyles from './ChatInbox.common.module.css';
import lightStyles from './ChatInbox.light.module.css';
import darkStyles from './ChatInbox.dark.module.css';

export interface Conversation {
  id: string;
  numericId: number;
  userName: string;
  userId: number;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isDemo?: boolean;
}

interface ApiConversation {
  id: number;
  client_id: number;
  freelancer_id: number;
  project_id: number | null;
  status: string;
  is_archived: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  other_user_id?: number;
  other_user_name?: string;
  other_user_avatar?: string;
  last_message_content?: string;
  unread_count?: number;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 'demo_1', numericId: 1001, userName: 'Alex Johnson', userId: 1, avatarUrl: 'https://i.pravatar.cc/150?img=1', lastMessage: 'Hi! I reviewed your proposal — I\'m interested. Can we discuss?', timestamp: '2m ago', unreadCount: 2, isDemo: true },
  { id: 'demo_2', numericId: 1002, userName: 'Sarah Chen', userId: 2, avatarUrl: 'https://i.pravatar.cc/150?img=5', lastMessage: 'The designs look great! Just a few tweaks on mobile.', timestamp: '1h ago', unreadCount: 0, isDemo: true },
  { id: 'demo_3', numericId: 1003, userName: 'Marcus Williams', userId: 3, avatarUrl: 'https://i.pravatar.cc/150?img=3', lastMessage: 'You: Sent the updated files. Let me know!', timestamp: 'Yesterday', unreadCount: 0, isDemo: true },
  { id: 'demo_4', numericId: 1004, userName: 'Priya Patel', userId: 4, avatarUrl: 'https://i.pravatar.cc/150?img=9', lastMessage: 'Can we schedule a call to review requirements?', timestamp: '2d ago', unreadCount: 1, isDemo: true },
  { id: 'demo_5', numericId: 1005, userName: 'James Thompson', userId: 5, avatarUrl: 'https://i.pravatar.cc/150?img=11', lastMessage: 'You: Payment released. Great work!', timestamp: '3d ago', unreadCount: 0, isDemo: true },
];

function fmtTime(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60000);
  const diffDays = Math.floor(diffMins / 1440);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

interface ChatInboxProps {
  onConversationSelect?: (conversation: Conversation) => void;
  onNewMessage?: () => void;
}

const ChatInbox: React.FC<ChatInboxProps> = ({ onConversationSelect, onNewMessage }) => {
  const { resolvedTheme } = useTheme();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<string | null>(null);

  const userIds = useMemo(() => conversations.map(c => c.userId).filter(Boolean), [conversations]);
  const { isOnline } = useOnlineStatus(userIds);
  const { typingUsers } = useTypingIndicator();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data: ApiConversation[] = await (api.messages as any).getConversations?.() || [];
        if (cancelled) return;
        if (data.length === 0) throw new Error('empty');
        const mapped: Conversation[] = data.map(conv => ({
          id: `convo_${conv.id}`,
          numericId: conv.id,
          userName: conv.other_user_name || `User ${conv.other_user_id || conv.client_id}`,
          userId: conv.other_user_id || conv.client_id || conv.freelancer_id,
          avatarUrl: conv.other_user_avatar || '/avatars/default.png',
          lastMessage: conv.last_message_content || 'No messages yet',
          timestamp: fmtTime(conv.last_message_at || conv.created_at),
          unreadCount: conv.unread_count || 0,
        }));
        setConversations(mapped);
        if (mapped.length > 0) { setActive(mapped[0].id); onConversationSelect?.(mapped[0]); }
      } catch (err) {
        if (!cancelled) {
          // Show empty state instead of demo data — real conversations load from API
          setConversations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => c.userName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [conversations, search]);

  const getTyping = (id: number) => typingUsers.filter(t => t.conversationId === id);

  const handleSelect = (c: Conversation) => { setActive(c.id); onConversationSelect?.(c); };

  const th = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const totalUnread = conversations.reduce((a, c) => a + c.unreadCount, 0);

  return (
    <div className={cn(commonStyles.container, th.container)}>
      {/* Header */}
      <div className={cn(commonStyles.header, th.header)}>
        <div className={commonStyles.headerTop}>
          <div className={commonStyles.headerLeft}>
            <h2 className={cn(commonStyles.title, th.title)}>Messages</h2>
            {totalUnread > 0 && <span className={cn(commonStyles.unreadBadge, th.unreadBadge)}>{totalUnread}</span>}
          </div>
          <button className={cn(commonStyles.composeBtn, th.composeBtn)} onClick={onNewMessage} title="New message" aria-label="New message">
            <MessageSquarePlus size={18} />
          </button>
        </div>
        <div className={cn(commonStyles.searchWrap, th.searchWrap)}>
          <Search size={14} className={cn(commonStyles.searchIcon, th.searchIcon)} />
          <input
            type="text"
            placeholder="Search conversations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={cn(commonStyles.searchInput, th.searchInput)}
          />
        </div>
      </div>

      {/* List */}
      <div className={commonStyles.list}>
        {loading ? (
          <div className={commonStyles.loadingState}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={cn(commonStyles.skeletonItem, th.skeletonItem)}>
                <div className={cn(commonStyles.skeletonAvatar, th.skeletonPulse)} />
                <div className={commonStyles.skeletonLines}>
                  <div className={cn(commonStyles.skeletonLine, th.skeletonPulse)} style={{ width: '60%' }} />
                  <div className={cn(commonStyles.skeletonLine, th.skeletonPulse)} style={{ width: '80%', height: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={cn(commonStyles.emptyState, th.emptyState)}>
            <MessageSquarePlus size={32} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No conversations</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.55 }}>Start a new message to connect</p>
          </div>
        ) : filtered.map(convo => {
          const typing = getTyping(convo.numericId);
          const online = isOnline(convo.userId);
          const isActive = active === convo.id;
          return (
            <div
              key={convo.id}
              className={cn(commonStyles.item, th.item, isActive && commonStyles.active, isActive && th.active)}
              onClick={() => handleSelect(convo)}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              onKeyDown={e => e.key === 'Enter' && handleSelect(convo)}
            >
              <div className={commonStyles.avatarWrap}>
                <UserAvatar src={convo.avatarUrl} name={convo.userName} size="medium" />
                <span className={cn(commonStyles.onlineDot, online ? commonStyles.onlineDotGreen : commonStyles.onlineDotGray)} />
              </div>
              <div className={commonStyles.details}>
                <div className={commonStyles.row}>
                  <span className={cn(commonStyles.userName, th.userName)}>{convo.userName}</span>
                  <span className={cn(commonStyles.timestamp, th.timestamp)}>{convo.timestamp}</span>
                </div>
                <div className={commonStyles.row}>
                  {typing.length > 0 ? (
                    <span className={commonStyles.typingText}>{typing[0].userName} is typing…</span>
                  ) : (
                    <span className={cn(commonStyles.lastMsg, th.lastMsg, convo.unreadCount > 0 ? commonStyles.lastMsgUnread : '')}>{convo.lastMessage}</span>
                  )}
                  {convo.unreadCount > 0 && <span className={cn(commonStyles.badge, th.badge)}>{convo.unreadCount}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInbox;
