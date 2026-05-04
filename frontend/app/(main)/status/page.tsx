// @AI-HINT: Status directory
import React from 'react';
import type { Metadata } from 'next';
import Status from './Status';

export const metadata: Metadata = {
  title: 'System Status | MegiLance',
  description: 'Real-time platform system status and API health monitoring.',
};

export default function StatusPage() {
  return (
    <main>
      <Status />
    </main>
  );
}
