// @AI-HINT: This is the Next.js route file for the Pricing page. It delegates to the Pricing component.
'use client';

import React from 'react';
import Pricing from './Pricing';
import { useTheme } from '@/app/contexts/ThemeContext';

const PricingPage = () => {
  const { theme } = useTheme();

  return <Pricing theme={theme} />;
};

export default PricingPage;
