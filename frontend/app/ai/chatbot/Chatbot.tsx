// @AI-HINT: This is the AI Chatbot page, providing an interactive assistant. All styles are per-component only.
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/app/components/Button/Button';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './Chatbot.common.css';
import './Chatbot.light.css';
import './Chatbot.dark.css';

interface ChatbotProps {
  theme?: 'light' | 'dark';
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC<ChatbotProps> = ({ theme = 'light' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      const botResponse: Message = { id: Date.now() + 1, text: 'Thanks for your message! I am a demo chatbot. I will be able to answer your questions soon.', sender: 'bot' };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <div className={`Chatbot Chatbot--${theme}`}>
      <div className={`Chatbot-container Card--${theme}`}>
        <header className="Chatbot-header">
          <h2>AI Assistant</h2>
          <div className="status-indicator">● Online</div>
        </header>
        <div className="Chatbot-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`Message Message--${msg.sender} Message--${theme}`}>
              {msg.sender === 'bot' && <UserAvatar theme={theme} name="AI Assistant" src="/ai-avatar.png" size="small" />}
              <div className="Message-bubble">{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form className="Chatbot-input-form" onSubmit={handleSend}>
          <input
            type="text"
            className={`Chatbot-input Chatbot-input--${theme}`}
            placeholder="Ask a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Button theme={theme} variant="primary" type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
