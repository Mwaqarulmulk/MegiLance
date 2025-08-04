// @AI-HINT: This component displays a list of conversations, allowing the user to navigate between chats.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Badge from '@/app/components/Badge/Badge';
import './ChatInbox.common.css';
import './ChatInbox.light.css';
import './ChatInbox.dark.css';

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

  return (
    <div className={`ChatInbox-container ChatInbox-container--${theme}`}>
      <div className="ChatInbox-header">
        <h2 className="ChatInbox-title">Inbox</h2>
      </div>
      <div className="ChatInbox-list">
        {mockConversations.map(convo => (
          <div 
            key={convo.id} 
            className={`ChatInbox-item ${activeConversation === convo.id ? 'active' : ''} ChatInbox-item--${theme}`}
            onClick={() => setActiveConversation(convo.id)}
            role="button"
            tabIndex={0}
            aria-current={activeConversation === convo.id}
          >
            <UserAvatar src={convo.avatarUrl} alt={convo.userName} size="medium" />
            <div className="ChatInbox-item-details">
              <div className="ChatInbox-item-row">
                <span className="ChatInbox-userName">{convo.userName}</span>
                <span className="ChatInbox-timestamp">{convo.timestamp}</span>
              </div>
              <div className="ChatInbox-item-row">
                <p className="ChatInbox-lastMessage">{convo.lastMessage}</p>
                {convo.unreadCount > 0 && (
                  <Badge theme={theme} variant="primary">{convo.unreadCount}</Badge>
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
