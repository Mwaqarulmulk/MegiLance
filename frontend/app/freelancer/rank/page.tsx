// @AI-HINT: This is the Next.js route file for the Freelancer Rank page. It delegates to the Rank component.
'use client';

import React from 'react';
import Rank from './Rank';
import { useTheme } from '@/app/contexts/ThemeContext';

const RankPage = () => {
  const { theme } = useTheme();

  return <Rank theme={theme} />;
};

export default RankPage;
