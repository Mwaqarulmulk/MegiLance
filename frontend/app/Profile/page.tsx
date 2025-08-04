// @AI-HINT: This is the Next.js route file for the Profile page. It delegates to the Profile component.
'use client';

import React from 'react';
import Profile from './Profile';
import { useTheme } from '../contexts/ThemeContext';

const ProfilePage = () => {
  const { theme } = useTheme();

  return <Profile theme={theme} />;
};

export default ProfilePage;
