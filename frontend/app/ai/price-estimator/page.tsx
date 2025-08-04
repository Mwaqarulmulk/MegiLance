// @AI-HINT: This is the Next.js route file for the AI Price Estimator page. It delegates to the PriceEstimator component.
'use client';

import React from 'react';
import PriceEstimator from './PriceEstimator';
import { useTheme } from '@/app/contexts/ThemeContext';

const PriceEstimatorPage = () => {
  const { theme } = useTheme();

  return <PriceEstimator theme={theme} />;
};

export default PriceEstimatorPage;
