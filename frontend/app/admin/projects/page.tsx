// @AI-HINT: This is the Next.js route file for the Admin Project Management page. It delegates to the Projects component.
'use client';

import React from 'react';
import Projects from './Projects';
import { useTheme } from '@/app/contexts/ThemeContext';

const ProjectsPage = () => {
  const { theme } = useTheme();

  return <Projects theme={theme} />;
};

export default ProjectsPage;
