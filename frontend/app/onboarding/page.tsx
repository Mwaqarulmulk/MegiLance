// @AI-HINT: This is the Next.js route file for the Onboarding page. It delegates to the Onboarding component.
'use client';

import React from 'react';
import Onboarding from './Onboarding';
import { useTheme } from '@/app/contexts/ThemeContext';

const OnboardingPage = () => {
  const { theme } = useTheme();

  return <Onboarding theme={theme} />;
};

export default OnboardingPage;
