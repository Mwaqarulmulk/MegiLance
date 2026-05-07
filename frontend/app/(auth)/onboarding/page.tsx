'use client';

import { Suspense } from 'react';
import Onboarding from './Onboarding';

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <Onboarding />
    </Suspense>
  );
}
