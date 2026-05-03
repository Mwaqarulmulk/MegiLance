// @AI-HINT: AI section layout - uses main layout Header/Footer, only adds spacing
'use client';

import React from 'react';

interface AILayoutProps {
  children: React.ReactNode;
}

export default function AILayout({ children }: AILayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
