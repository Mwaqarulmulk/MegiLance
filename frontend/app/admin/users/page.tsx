// @AI-HINT: This is the Next.js route file for the Admin User Management page. It delegates to the Users component.
'use client';

import React from 'react';
import Users from './Users';
import { useTheme } from '@/app/contexts/ThemeContext';

const UsersPage = () => {
  const { theme } = useTheme();

  return <Users theme={theme} />;
};

export default UsersPage;
