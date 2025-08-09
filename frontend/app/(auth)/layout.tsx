// @AI-HINT: Chrome-less auth layout. Keep it minimal and let pages handle their own positioning/layout.

import React from 'react';

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
