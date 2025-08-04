// @AI-HINT: This is the Next.js route file for the AI Chatbot page. It delegates to the Chatbot component.
'use client';

import React from 'react';
import Chatbot from './Chatbot';
import { useTheme } from '@/app/contexts/ThemeContext';

const ChatbotPage = () => {
  const { theme } = useTheme();

  return <Chatbot theme={theme} />;
};

export default ChatbotPage;
