// @AI-HINT: This is the Next.js route file for the Terms of Service page. It delegates to the Terms component.
'use client';

import React from 'react';
import Terms from './Terms';
import { useTheme } from '@/app/contexts/ThemeContext';

const TermsPage = () => {
  const { theme } = useTheme();

  return <Terms theme={theme} />;
};

export default TermsPage;
