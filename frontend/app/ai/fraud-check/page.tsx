// @AI-HINT: This is the Next.js route file for the AI Fraud Check page. It delegates to the FraudCheck component.
'use client';

import React from 'react';
import FraudCheck from './FraudCheck';
import { useTheme } from '@/app/contexts/ThemeContext';

const FraudCheckPage = () => {
  const { theme } = useTheme();

  return <FraudCheck theme={theme} />;
};

export default FraudCheckPage;
