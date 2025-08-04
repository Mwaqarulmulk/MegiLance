// @AI-HINT: This is the Next.js route file for the Client Reviews page. It delegates to the Reviews component.
'use client';

import React from 'react';
import Reviews from './Reviews';
import { useTheme } from '@/app/contexts/ThemeContext';

const ReviewsPage = () => {
  const { theme } = useTheme();

  return <Reviews theme={theme} />;
};

export default ReviewsPage;
