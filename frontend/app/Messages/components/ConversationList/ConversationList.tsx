// @AI-HINT: This component renders the list of conversations in the sidebar. It manages the display of each conversation, highlights the active one, and handles user selection.

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Conversation } from '../types';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import commonStyles from './ConversationList.common.module.css';
import lightStyles from './ConversationList.light.module.css';
import darkStyles from './ConversationList.dark.module.css';

interface ConversationListProps {
  selectedConversationId: number | null;
  onSelectConversation: (id: number) => void;
  refreshKey: number;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  selectedConversationId, 
  onSelectConversation, 
  refreshKey 
}) => {
  const { notify } = useToaster();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/messages');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: Conversation[] = await response.json();
        setConversations(data);
        if (data.length > 0 && selectedConversationId === null) {
          onSelectConversation(data[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [onSelectConversation, selectedConversationId, refreshKey]);
  return (
    <aside className={commonStyles.sidebar}>
      <div className={commonStyles.header}>
        <h2>Conversations</h2>
        {/* Placeholder for a search input or filter actions */}
      </div>
      <div className={commonStyles.items}>
        {loading && <div className={commonStyles.loading}>Loading...</div>}
        {error && <div className={commonStyles.error}>Error: {error}</div>}
        {!loading && !error && conversations.length === 0 && (
          <EmptyState
            title="No conversations yet"
            description="Start a new chat to collaborate with your clients and teammates."
            action={
              <button
                type="button"
                className={commonStyles.emptyCta}
                onClick={() => notify({ title: 'Coming soon', description: 'New conversation flow will be available shortly.', variant: 'info', duration: 2800 })}
              >
                Start a conversation
              </button>
            }
          />
        )}
        {!loading && !error && conversations.map(convo => (
          <div 
            key={convo.id} 
            className={cn(commonStyles.item, { [commonStyles.active]: selectedConversationId === convo.id })}
            onClick={() => onSelectConversation(convo.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectConversation(convo.id)}
          >
            <Image src={convo.avatar} alt={`${convo.contactName}&apos;s avatar`} className={commonStyles.itemAvatar} width={40} height={40} />
            <div className={commonStyles.itemContent}>
              <div className={commonStyles.itemHeader}>
                <span className={commonStyles.itemName}>{convo.contactName}</span>
                <span className={commonStyles.itemTimestamp}>{convo.lastMessageTimestamp}</span>
              </div>
              <p className={commonStyles.itemPreview}>{convo.lastMessage}</p>
            </div>
            {convo.unreadCount > 0 && (
                <div className={commonStyles.itemUnread}>{convo.unreadCount}</div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ConversationList;
