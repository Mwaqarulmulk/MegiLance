// @AI-HINT: Premium Real-time Messages page with Framer Motion integration
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import ChatInbox, { Conversation } from '@/app/components/organisms/Messaging/ChatInbox/ChatInbox';
import RealtimeChat from '@/app/components/organisms/Messaging/RealtimeChat';
import { motion, AnimatePresence } from 'framer-motion';

import commonStyles from './Messages.common.module.css';
import lightStyles from './Messages.light.module.css';
import darkStyles from './Messages.dark.module.css';

const Messages: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(commonStyles.container, themeStyles.container)}
    >
      <div className={commonStyles.glassPane}>
        <ChatInbox onConversationSelect={(c) => setActiveConversation(c)} />
      </div>

      <div className={cn(commonStyles.chatSection, themeStyles.chatSection, commonStyles.glassPane)}>
        <AnimatePresence mode="wait">
          {activeConversation ? (
            <motion.div
              key={activeConversation.numericId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className={commonStyles.fullHeight}
            >
              <RealtimeChat
                roomId={`conversation_${activeConversation.numericId}`}
                conversationId={activeConversation.numericId}
                currentUserId={user.id.toString()}
                currentUserName={user.name}
                otherUserId={activeConversation.userId}
                otherUserName={activeConversation.userName}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={commonStyles.emptyState}
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className={commonStyles.iconGlowWrapper}>
                  <MessageSquare className={commonStyles.emptyIcon} />
                </div>
              </motion.div>
              <h2 className={commonStyles.emptyTitle}>Select a Conversation</h2>
              <p className={commonStyles.emptySub}>Engage seamlessly with clients and freelancers</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Messages;
