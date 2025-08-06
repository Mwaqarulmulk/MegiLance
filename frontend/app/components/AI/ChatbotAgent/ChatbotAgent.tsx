// @AI-HINT: This component provides a chat interface for interacting with an AI agent. All styles are per-component only.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import { cn } from '@/lib/utils';
import commonStyles from './ChatbotAgent.common.module.css';
import lightStyles from './ChatbotAgent.light.module.css';
import darkStyles from './ChatbotAgent.dark.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatbotAgent: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! How can I help you with your project today?', sender: 'bot' },
    { id: 2, text: 'I need to find a developer skilled in Next.js and Web3.', sender: 'user' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');

    // Mock bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: 'Searching for top-rated Next.js and Web3 developers for you...',
        sender: 'bot',
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  return (
    <div className={styles.chatbotAgent}>
      <div className={styles.chatbotAgentMessages}>
        {messages.map(message => (
          <div key={message.id} className={cn(styles.message, message.sender === 'bot' ? styles.messageBot : styles.messageUser)}>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      <form className={styles.chatbotAgentInputForm} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          className={styles.chatbotAgentInput}
        />
        <Button type="submit" variant="primary">Send</Button>
      </form>
    </div>
  );
};

export default ChatbotAgent;
