// @AI-HINT: This is the Next.js route file for the Payments page. It delegates to the Payments component.
'use client';

import React from 'react';
import Payments from './Payments';
import { useTheme } from '../contexts/ThemeContext';

const PaymentsPage = () => {
  const { theme } = useTheme();

  return <Payments theme={theme} />;
};

export default PaymentsPage;
