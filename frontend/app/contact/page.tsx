// @AI-HINT: This is the Next.js route file for the Contact page. It delegates to the Contact component.
'use client';

import React from 'react';
import Contact from './Contact';
import { useTheme } from '@/app/contexts/ThemeContext';

const ContactPage = () => {
  const { theme } = useTheme();

  return <Contact theme={theme} />;
};

export default ContactPage;
