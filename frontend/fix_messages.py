import os

messages_tsx = '''// @AI-HINT: Premium Real-time Messages page with Framer Motion integration
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
                roomId={\conversation_\\}
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
'''

messages_css = '''/* @AI-HINT: Premium glassy layout for Messages */
.container {
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 100px);
  min-height: 700px;
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 2rem;
  padding: 2rem 1rem;
  perspective: 1000px;
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
    height: calc(100vh - 80px);
    padding: 1rem;
  }
}

.glassPane {
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chatSection {
  position: relative;
}

.fullHeight {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.iconGlowWrapper {
  position: relative;
  margin-bottom: 2rem;
}

.iconGlowWrapper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(69, 115, 239, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(10px);
  z-index: -1;
}

.emptyIcon {
  width: 4rem;
  height: 4rem;
  opacity: 0.8;
  color: var(--primary-color, #4573df);
}

.emptyTitle {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}

.emptySub {
  font-size: 1.1rem;
  opacity: 0.6;
}
'''

with open('E:/MegiLance/frontend/app/Messages/Messages.tsx', 'w', encoding='utf-8') as f:
    f.write(messages_tsx)

with open('E:/MegiLance/frontend/app/Messages/Messages.common.module.css', 'w', encoding='utf-8') as f:
    f.write(messages_css)

print("Messages files updated smoothly.")
