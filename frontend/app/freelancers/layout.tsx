// @AI-HINT: Freelancers section layout uses PublicLayout (marketing site chrome).
import React from 'react';
import PublicLayout from '../layouts/PublicLayout/PublicLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
