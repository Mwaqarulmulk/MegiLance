// @AI-HINT: Testimonials page with theme-aware styling, animated sections, and accessible structure.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Testimonials.common.module.css';
import light from './Testimonials.light.module.css';
import dark from './Testimonials.dark.module.css';

const ALL = 'All';
const categories = [ALL, 'Clients', 'Freelancers', 'Enterprise'];

const testimonials = [
  {
    name: 'Nora Patel',
    role: 'Head of Product, AtlasAI',
    category: 'Enterprise',
    quote:
      'MegiLance delivered investor-grade velocity with uncompromising quality. Our AI rollout landed ahead of schedule.',
    avatar: '/images/testimonials/nora.jpg',
  },
  {
    name: 'Samir Rahman',
    role: 'Senior iOS Engineer',
    category: 'Freelancers',
    quote:
      'The platform finally treats freelancers as first-class partners. Transparent escrow and fast payouts changed my workflow.',
    avatar: '/images/testimonials/samir.jpg',
  },
  {
    name: 'Emily Stone',
    role: 'Founder, Crisp Labs',
    category: 'Clients',
    quote:
      'We shipped a polished MVP in weeks. The talent quality and tooling are on par with the best in the industry.',
    avatar: '/images/testimonials/emily.jpg',
  },
  {
    name: 'Diego Morales',
    role: 'Blockchain Architect',
    category: 'Freelancers',
    quote:
      'Audited contracts and clear milestones gave me confidence to focus on building. The experience feels premium end-to-end.',
    avatar: '/images/testimonials/diego.jpg',
  },
  {
    name: 'Hannah Lee',
    role: 'VP Engineering, NovaCloud',
    category: 'Enterprise',
    quote:
      'Security reviews and compliance were top-notch. MegiLance matched our bar on reliability and controls.',
    avatar: '/images/testimonials/hannah.jpg',
  },
  {
    name: 'Ava Johnson',
    role: 'Founder, PixelMint',
    category: 'Clients',
    quote:
      'Immaculate UI quality. The teams shipped with taste and precision you rarely see.',
    avatar: '/images/testimonials/ava.jpg',
  },
];

const Testimonials: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

  const [selected, setSelected] = useState<string>(ALL);
  const filtered = useMemo(
    () => (selected === ALL ? testimonials : testimonials.filter((t) => t.category === selected)),
    [selected]
  );

  const headerRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const controlsVisible = useIntersectionObserver(controlsRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });
  const ctaVisible = useIntersectionObserver(ctaRef, { threshold: 0.1 });

  return (
    <main id="main-content" role="main" aria-labelledby="testimonials-title" className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header
          ref={headerRef as any}
          className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}
        >
          <h1 id="testimonials-title" className={common.title}>What Our Users Say</h1>
          <p className={common.subtitle}>Real stories from clients, freelancers, and enterprise partners.</p>
        </header>

        <div
          ref={controlsRef}
          className={cn(common.controls, controlsVisible ? common.isVisible : common.isNotVisible)}
          role="toolbar"
          aria-label="Filter testimonials by category"
        >
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={common.chip}
              aria-pressed={!!(selected === c)}
              onClick={() => setSelected(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <section aria-label="Testimonials">
          <div
            ref={gridRef}
            className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}
          >
            {filtered.map((t) => (
              <figure key={t.name} className={common.card}>
                <blockquote className={common.quote}>
                  “{t.quote}”
                </blockquote>
                <figcaption className={common.person}>
                  <Image
                    className={common.avatar}
                    src={t.avatar}
                    alt={`${t.name} avatar`}
                    width={40}
                    height={40}
                    loading="lazy"
                  />
                  <div>
                    <div className={common.name}>{t.name}</div>
                    <div className={common.role}>{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={common.section} aria-label="Call to action">
          <div ref={ctaRef} className={cn(common.cta, ctaVisible ? common.isVisible : common.isNotVisible)}>
            <a href="/clients" className={common.button} aria-label="See client success stories">See Client Success</a>
            <a href="/jobs" className={cn(common.button, common.buttonSecondary)} aria-label="Browse jobs and projects">Start Building</a>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Testimonials;
