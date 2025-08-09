// @AI-HINT: Blog section layout wraps content with PublicLayout for consistent public chrome.
import React from 'react';
import PublicLayout from '../layouts/PublicLayout/PublicLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
