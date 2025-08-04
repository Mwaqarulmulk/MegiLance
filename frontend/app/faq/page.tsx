// @AI-HINT: This is the Next.js route file for the FAQ page. It delegates to the Faq component.
'use client';

import React from 'react';
import Faq from './Faq';
import { useTheme } from '@/app/contexts/ThemeContext';

const FaqPage = () => {
  const { theme } = useTheme();

  return <Faq theme={theme} />;
};

export default FaqPage;
