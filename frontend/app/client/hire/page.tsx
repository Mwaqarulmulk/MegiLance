// @AI-HINT: This is the Next.js route file for the Client 'Hire' page. It delegates to the Hire component.
'use client';

import React from 'react';
import Hire from './Hire';
import { useTheme } from '@/app/contexts/ThemeContext';

const HirePage = () => {
  const { theme } = useTheme();

  return <Hire theme={theme} />;
};

export default HirePage;
