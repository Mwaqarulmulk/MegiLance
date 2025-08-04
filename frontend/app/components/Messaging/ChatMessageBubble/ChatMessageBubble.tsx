// @AI-HINT: This component renders a single chat message bubble, styled differently for the sender and receiver.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './ChatMessageBubble.common.css';
import './ChatMessageBubble.light.css';
import './ChatMessageBubble.dark.css';

interface ChatMessageBubbleProps {
  text: string;
  timestamp: string;
  isSender: boolean;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ text, timestamp, isSender }) => {
  const { theme } = useTheme();
  const bubbleClass = isSender ? 'sender' : 'receiver';

  return (
    <div className={`ChatMessageBubble-container ChatMessageBubble-container--${bubbleClass}`}>
      <div className={`ChatMessageBubble ChatMessageBubble--${bubbleClass} ChatMessageBubble--${theme}`}>
        <p className="ChatMessageBubble-text">{text}</p>
        <span className="ChatMessageBubble-timestamp">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
