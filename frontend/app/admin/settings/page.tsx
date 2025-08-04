// @AI-HINT: This is the Next.js route file for the Admin Settings page. It delegates to the Settings component.
'use client';

import React from 'react';
import Settings from './Settings';
import { useTheme } from '@/app/contexts/ThemeContext';

const SettingsPage = () => {
  const { theme } = useTheme();

  return <Settings theme={theme} />;
};

export default SettingsPage;
