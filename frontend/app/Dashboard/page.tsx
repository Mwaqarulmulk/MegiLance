// @AI-HINT: This is the Next.js route file for the Dashboard page. It delegates to the Dashboard component.
'use client';

import React from 'react';
import Dashboard from './Dashboard';
import { useTheme } from '@/app/contexts/ThemeContext';

const DashboardPage = () => {
  const { theme } = useTheme();

  return <Dashboard theme={theme} />;
};

export default DashboardPage;
