// @AI-HINT: This is the Next.js route file for the Messages page. It delegates to the Messages component.
'use client';

import React from 'react';
import Messages from './Messages';
import { useTheme } from '@/app/contexts/ThemeContext';

const MessagesPage = () => {
  const { theme } = useTheme();

  return <Messages theme={theme} />;
};

export default MessagesPage;
