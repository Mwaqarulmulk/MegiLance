// @AI-HINT: This is the Next.js route file for the Client 'Post a Job' page. It delegates to the PostJob component.
'use client';

import React from 'react';
import PostJob from './PostJob';
import { useTheme } from '@/app/contexts/ThemeContext';

const PostJobPage = () => {
  const { theme } = useTheme();

  return <PostJob theme={theme} />;
};

export default PostJobPage;
