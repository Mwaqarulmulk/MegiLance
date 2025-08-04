// @AI-HINT: This is the Next.js route file for the Login page. It delegates to the Login component and passes theme via context/props only.
'use client';

import React from 'react';
import Login from './Login';
import { useTheme } from '@/app/contexts/ThemeContext';

const LoginPage = () => {
  const { theme } = useTheme();

  return <Login theme={theme} />;
};

export default LoginPage;
