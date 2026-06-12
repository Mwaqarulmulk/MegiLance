import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance Press & Media | News, Press Kit & Brand Assets',
  description: 'MegiLance press resources: company news, recent media coverage, downloadable press kit, brand assets, logo files, and spokesperson contact. Read the story of AI-powered freelancing.',
  path: '/press',
  keywords: [
    'megilance press', 'megilance media kit', 'megilance news',
    'freelance platform press release', 'megilance brand assets',
    'megilance logo download', 'AI freelancing news', 'megilance coverage',
  ],
});

// @AI-HINT: Press directory
import React from 'react';
import commonStyles from './Press.common.module.css';

export default function PressPage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header} style={{ textAlign: 'center', padding: '6rem 2rem', background: '#0f172a', color: 'white' }}>
        <h1 className={commonStyles.title} style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>Press & Media Kit</h1>
        <p className={commonStyles.subtitle} style={{ fontSize: '1.25rem', color: '#94a3b8' }}>Download logos, read our latest announcements, and contact our PR team.</p>
      </header>
    </main>
  );
}
