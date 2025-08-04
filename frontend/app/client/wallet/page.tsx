// @AI-HINT: This is the Next.js route file for the Client Wallet page. It delegates to the Wallet component.
'use client';

import React from 'react';
import Wallet from './Wallet';
import { useTheme } from '@/app/contexts/ThemeContext';

const WalletPage = () => {
  const { theme } = useTheme();

  return <Wallet theme={theme} />;
};

export default WalletPage;
