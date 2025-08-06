// @AI-HINT: This is the Next.js route file for the Security page. It delegates to the Security component.
'use client';

import React from 'react';
import Security from '@/app/security/Security';
import { useTheme } from '@/contexts/ThemeContext';

const SecurityPage = () => {
  const { theme } = useTheme();

  return <Security theme={theme} />;
};

export default SecurityPage;
