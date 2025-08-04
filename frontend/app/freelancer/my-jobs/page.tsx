// @AI-HINT: This is the Next.js route file for the Freelancer 'My Jobs' page. It delegates to the MyJobs component.
'use client';

import React from 'react';
import MyJobs from './MyJobs';
import { useTheme } from '@/app/contexts/ThemeContext';

const MyJobsPage = () => {
  const { theme } = useTheme();

  return <MyJobs theme={theme} />;
};

export default MyJobsPage;
