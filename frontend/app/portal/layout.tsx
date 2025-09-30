// @AI-HINT: This is the layout for all authenticated user portals. It uses the AppLayout component to provide a consistent shell with a sidebar and navbar.

import React from 'react';
import AppLayout from '../components/AppLayout/AppLayout';

export default function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
