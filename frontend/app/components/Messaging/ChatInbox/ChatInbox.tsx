// @AI-HINT: This component displays a list of conversations, allowing the user to navigate between chats.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Badge from '@/app/components/Badge/Badge';
import { cn } from '@/lib/utils';
import commonStyles from './ChatInbox.common.module.css';
import lightStyles from './ChatInbox.light.module.css';
import darkStyles from './ChatInbox.dark.module.css';

interface Conversation {
  id: string;
  userName: string;
  avatarUrl: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const mockConversations: Conversation[] = [
  { id: 'convo_001', userName: 'Bob Williams', avatarUrl: '/avatars/bob.png', lastMessage: 'Sure, I can get that done by tomorrow.', timestamp: '10:30 AM', unreadCount: 2 },
  { id: 'convo_002', userName: 'Diana Prince', avatarUrl: '/avatars/diana.png', lastMessage: 'The project files are attached.', timestamp: 'Yesterday', unreadCount: 0 },
  { id: 'convo_003', userName: 'Ethan Hunt', avatarUrl: '/avatars/ethan.png', lastMessage: 'Great work on the last milestone!', timestamp: '2 days ago', unreadCount: 0 },
  { id: 'convo_004', userName: 'Support Bot', avatarUrl: '/avatars/bot.png', lastMessage: 'How can I help you today?', timestamp: '1 week ago', unreadCount: 0 },
];

const ChatInbox: React.FC = () => {
  const { theme } = useTheme();
  const [activeConversation, setActiveConversation] = useState('convo_001');

  if (!theme) return null;

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.themeWrapper)}>
      <div className={commonStyles.header}>
        <h2 className={commonStyles.title}>Inbox</h2>
      </div>
      <div className={commonStyles.list}>
        {mockConversations.map(convo => (
          <div 
            key={convo.id} 
            className={cn(
              commonStyles.item, 
              themeStyles.item, 
              activeConversation === convo.id && themeStyles.active
            )}
            onClick={() => setActiveConversation(convo.id)}
            role="button"
            tabIndex={0}
            aria-current={activeConversation === convo.id}
          >
            <UserAvatar src={convo.avatarUrl} name={convo.userName} size="medium" />
            <div className={commonStyles.itemDetails}>
              <div className={commonStyles.itemRow}>
                <span className={commonStyles.userName}>{convo.userName}</span>
                <span className={commonStyles.timestamp}>{convo.timestamp}</span>
              </div>
              <div className={commonStyles.itemRow}>
                <p className={commonStyles.lastMessage}>{convo.lastMessage}</p>
                {convo.unreadCount > 0 && (
                  <Badge variant="primary">{convo.unreadCount}</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatInbox;
