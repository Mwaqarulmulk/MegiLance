// @AI-HINT: This is the Next.js route file for the Forgot Password page. It delegates to the ForgotPassword component.
'use client';

import React from 'react';
import ForgotPassword from './ForgotPassword';
import { useTheme } from '@/app/contexts/ThemeContext';

const ForgotPasswordPage = () => {
  const { theme } = useTheme();

  return <ForgotPassword theme={theme} />;
};

export default ForgotPasswordPage;
