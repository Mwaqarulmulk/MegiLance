'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Search, MessageSquarePlus, UserPlus, X } from 'lucide-react';
import UserAvatar from '@/app/components/atoms/UserAvatar/UserAvatar';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useRouter } from 'next/navigation';
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

interface UserSearchResult {
  id: number;
  name: string;
  user_type: string;
  profile_image_url?: string;
  headline?: string;
  location?: string;
}

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
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState<number | null>(null);

  const userIds = useMemo(() => conversations.map(c => c.userId).filter(Boolean), [conversations]);
  const { isOnline } = useOnlineStatus(userIds);
  const { typingUsers } = useTypingIndicator();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const data: ApiConversation[] = await (api.messages as any).getConversations?.() || [];
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
      if (mapped.length > 0 && !active) { setActive(mapped[0].id); onConversationSelect?.(mapped[0]); }
    } catch (err) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [active, onConversationSelect]);

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled) await loadConversations(); })();
    return () => { cancelled = true; };
  }, [loadConversations]);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setUserSearchLoading(true);
    try {
      const results = await api.users?.search?.(query) || [];
      setUserSearchResults(Array.isArray(results) ? results.slice(0, 10) : []);
    } catch {
      setUserSearchResults([]);
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(userSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [userSearchQuery, searchUsers]);

  const startConversation = useCallback(async (userId: number) => {
    setCreatingConversation(userId);
    try {
      const result = await api.messages.createConversation({ freelancer_id: userId } as any);
      const convId = (result as any)?.conversation_id;
      if (convId) {
        await loadConversations();
        setShowUserSearch(false);
        setUserSearchQuery('');
        setUserSearchResults([]);
        setActive(`convo_${convId}`);
        router.push('/messages');
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
    } finally {
      setCreatingConversation(null);
    }
  }, [loadConversations, router]);

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
          <div className="flex gap-1">
            <button 
              className={cn(commonStyles.composeBtn, th.composeBtn)} 
              onClick={() => setShowUserSearch(!showUserSearch)} 
              title="Find users to message" 
              aria-label="Find users to message"
            >
              <UserPlus size={18} />
            </button>
            <button className={cn(commonStyles.composeBtn, th.composeBtn)} onClick={onNewMessage} title="New message" aria-label="New message">
              <MessageSquarePlus size={18} />
            </button>
          </div>
        </div>

        {/* User Search Panel */}
        {showUserSearch && (
          <div className="border-b border-slate-200 p-3 dark:border-slate-700">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search freelancers or clients to message..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm dark:border-slate-700 dark:bg-slate-800"
                autoFocus
              />
              {userSearchQuery && (
                <button
                  onClick={() => { setUserSearchQuery(''); setUserSearchResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {userSearchLoading && (
              <div className="mt-2 text-center text-xs text-slate-400">Searching...</div>
            )}
            {userSearchResults.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto">
                {userSearchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <UserAvatar src={user.profile_image_url} name={user.name} size="small" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{user.name}</div>
                      <div className="truncate text-xs text-slate-500">{user.headline || user.user_type}</div>
                    </div>
                    <button
                      onClick={() => startConversation(user.id)}
                      disabled={creatingConversation === user.id}
                      className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creatingConversation === user.id ? 'Starting...' : 'Message'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {userSearchQuery.length >= 2 && !userSearchLoading && userSearchResults.length === 0 && (
              <div className="mt-2 text-center text-xs text-slate-400">No users found</div>
            )}
          </div>
        )}

        <div className={cn(commonStyles.searchWrap, th.searchWrap)}>
          <Search size={14} className={cn(commonStyles.searchIcon, th.searchIcon)} />
          <input
            type="text"
            placeholder="Search conversations..."
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
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No conversations yet</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '1rem' }}>
              Find freelancers or clients to start a conversation
            </p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              <UserPlus size={14} className="mr-1 inline" />
              Find Users
            </button>
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
                    <span className={commonStyles.typingText}>{typing[0].userName} is typing...</span>
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
