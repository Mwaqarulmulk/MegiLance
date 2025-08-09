// @AI-HINT: Careers page with accessible main landmark, labeled sections, theme-aware styles, and mock roles.
'use client';
import React, { useRef } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Careers.common.module.css';
import light from './Careers.light.module.css';
import dark from './Careers.dark.module.css';

const roles = [
  { id: 'fe-lead', title: 'Senior Frontend Engineer', location: 'Remote', type: 'Full-time' },
  { id: 'pm', title: 'Product Manager', location: 'Remote', type: 'Full-time' },
  { id: 'ds', title: 'Design Systems Engineer', location: 'Remote', type: 'Contract' },
];

const Careers: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const headerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const listVisible = useIntersectionObserver(listRef, { threshold: 0.1 });

  return (
    <main id="main-content" role="main" aria-labelledby="careers-title" className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header ref={headerRef as any} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <span className={common.badge}>Join the team</span>
          <h1 id="careers-title" className={common.title}>Careers at MegiLance</h1>
          <p className={common.subtitle}>Build investor-grade software that empowers clients and freelancers globally.</p>
        </header>

        <section aria-labelledby="open-roles-heading" className={common.section}>
          <h2 id="open-roles-heading" className={common.sectionTitle}>Open Roles</h2>
          <div ref={listRef} className={cn(common.roles, listVisible ? common.isVisible : common.isNotVisible)}>
            {roles.map((r) => (
              <article key={r.id} className={common.roleCard} aria-labelledby={`role-${r.id}-title`}>
                <h3 id={`role-${r.id}-title`} className={common.roleTitle}>{r.title}</h3>
                <p className={common.roleMeta}><span>{r.location}</span> • <span>{r.type}</span></p>
                <a className={cn(common.button, common.applyButton)} href={`/apply/${r.id}`} aria-label={`Apply for ${r.title}`}>
                  Apply Now
                </a>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="values-heading" className={common.section}>
          <h2 id="values-heading" className={common.sectionTitle}>Our Values</h2>
          <ul className={common.valuesList}>
            <li>Quality with taste</li>
            <li>Security and trust</li>
            <li>Velocity with care</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default Careers;
