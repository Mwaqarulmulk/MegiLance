// @AI-HINT: Client Project Detail page. Theme-aware, accessible, animated detail layout with sections and actions.
'use client';

import React, { useMemo, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './ProjectDetail.common.module.css';
import light from './ProjectDetail.light.module.css';
import dark from './ProjectDetail.dark.module.css';

const MOCK = {
  title: 'Marketing site build',
  status: 'In Progress',
  budget: '$4,500',
  updated: '2025-08-08',
  description:
    'Build a high-performance Next.js marketing site with blog, MDX, theme-aware UI, and CMS integration. Include analytics and A/B testing hooks.',
  requirements: [
    'Next.js 14 with App Router',
    'CSS Modules (common, light, dark)',
    'Accessibility and performance best practices',
    'Blog with MDX, code blocks',
  ],
  activity: [
    { id: 'a1', ts: '2025-08-08 10:12', text: 'Milestone 1 approved' },
    { id: 'a2', ts: '2025-08-07 16:20', text: 'Designs uploaded for review' },
    { id: 'a3', ts: '2025-08-06 09:55', text: 'Kickoff meeting notes shared' },
  ],
};

const ProjectDetail: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const params = useParams<{ id: string }>();
  const projectId = useMemo(() => params?.id ?? 'unknown', [params]);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);
  const reqRef = useRef<HTMLDivElement | null>(null);
  const actRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const descVisible = useIntersectionObserver(descRef, { threshold: 0.1 });
  const reqVisible = useIntersectionObserver(reqRef, { threshold: 0.1 });
  const actVisible = useIntersectionObserver(actRef, { threshold: 0.1 });

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>{MOCK.title}</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Project ID: {projectId}</p>
            <div className={cn(common.meta, themed.meta)}>
              <span className={cn(common.badge, themed.badge)}>{MOCK.status}</span>
              <span>•</span>
              <span>{MOCK.budget}</span>
              <span>•</span>
              <span>Updated {MOCK.updated}</span>
            </div>
          </div>
          <div className={common.actions}>
            <Link href="/client/projects" className={cn(common.button, 'secondary', themed.button)}>Back to Projects</Link>
            <button type="button" className={cn(common.button, 'primary', themed.button)}>Create Milestone</button>
          </div>
        </header>

        <section ref={descRef} className={cn(common.section, themed.section, descVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="desc-title">
          <h2 id="desc-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Description</h2>
          <p>{MOCK.description}</p>
        </section>

        <section ref={reqRef} className={cn(common.section, themed.section, reqVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="req-title">
          <h2 id="req-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Requirements</h2>
          <ul className={common.list} role="list">
            {MOCK.requirements.map((r, i) => (
              <li key={i} role="listitem" className={cn(common.item, themed.item)}>{r}</li>
            ))}
          </ul>
        </section>

        <section ref={actRef} className={cn(common.section, themed.section, actVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="activity-title">
          <h2 id="activity-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Recent Activity</h2>
          <div className={common.list} role="list">
            {MOCK.activity.map(a => (
              <div key={a.id} role="listitem" className={cn(common.item, themed.item)}>
                <div>{a.ts}</div>
                <div>{a.text}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProjectDetail;
