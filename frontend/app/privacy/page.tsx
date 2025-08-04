// @AI-HINT: This is the Next.js route file for the Privacy Policy page. It delegates to the Privacy component.
'use client';

import React from 'react';
import Privacy from './Privacy';
import { useTheme } from '@/app/contexts/ThemeContext';

const PrivacyPage = () => {
  const { theme } = useTheme();

  return <Privacy theme={theme} />;
};

export default PrivacyPage;
