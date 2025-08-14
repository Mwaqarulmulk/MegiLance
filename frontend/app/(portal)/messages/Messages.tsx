'use client';

import React, { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import ChatInbox from '@/app/components/Messaging/ChatInbox/ChatInbox';
import ChatMessageBubble from '@/app/components/Messaging/ChatMessageBubble/ChatMessageBubble';
import TypingIndicator from '@/app/components/Messaging/TypingIndicator/TypingIndicator';

import commonStyles from './Messages.common.module.css';
import lightStyles from './Messages.light.module.css';
import darkStyles from './Messages.dark.module.css';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSender: boolean;
}

const initialMessages: Message[] = [
  { id: 'm1', text: 'Hey there! Can we review the milestone details?', timestamp: '09:42', isSender: false },
  { id: 'm2', text: 'Absolutely. I\'ll summarize the scope and deliverables.', timestamp: '09:44', isSender: true },
  { id: 'm3', text: 'Thanks! Please include timelines.', timestamp: '09:45', isSender: false },
];

const Messages: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');

  const themeStyles = useMemo(() => (theme === 'dark' ? darkStyles : lightStyles), [theme]);

  if (!theme) return null; // avoid FOUC and ensure theme vars are ready

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: `m_${Date.now()}`, text: trimmed, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isSender: true },
    ]);
    setDraft('');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section className={cn(commonStyles.container, themeStyles.container)} aria-label="Messages">
      <aside className={cn(commonStyles.leftPane, themeStyles.leftPane)} aria-label="Conversations">
        <ChatInbox />
      </aside>

      <div className={cn(commonStyles.rightPane, themeStyles.rightPane)}>
        <header className={cn(commonStyles.header, themeStyles.header)}>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>Conversation</h2>
        </header>

        <div className={cn(commonStyles.conversationArea, themeStyles.conversationArea)} role="log" aria-live="polite">
          {messages.map((m) => (
            <ChatMessageBubble key={m.id} text={m.text} timestamp={m.timestamp} isSender={m.isSender} />
          ))}
          <TypingIndicator />
        </div>

        <footer className={cn(commonStyles.footer, themeStyles.footer)}>
          <label htmlFor="message-input" className="sr-only">Type a message</label>
          <input
            id="message-input"
            className={cn(commonStyles.input, themeStyles.input)}
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Message input"
          />
          <button
            type="button"
            className={cn(commonStyles.sendButton, themeStyles.sendButton)}
            onClick={sendMessage}
            aria-label="Send message"
          >
            Send
          </button>
        </footer>
      </div>
    </section>
  );
};

export default Messages;
