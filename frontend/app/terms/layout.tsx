// @AI-HINT: Terms section layout uses PublicLayout.
import React from 'react';
import PublicLayout from '../layouts/PublicLayout/PublicLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
