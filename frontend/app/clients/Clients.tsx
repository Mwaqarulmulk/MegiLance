// @AI-HINT: Clients page with theme-aware styling, animated sections, accessible structure, and optimized images.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import common from './Clients.common.module.css';
import light from './Clients.light.module.css';
import dark from './Clients.dark.module.css';

const ALL = 'All';
const industries = [ALL, 'AI', 'Fintech', 'E-commerce', 'Healthcare'];

const logos = [
  { name: 'AtlasAI', industry: 'AI', src: '/images/clients/atlasai.png' },
  { name: 'NovaBank', industry: 'Fintech', src: '/images/clients/novabank.png' },
  { name: 'PixelMint', industry: 'E-commerce', src: '/images/clients/pixelmint.png' },
  { name: 'CureWell', industry: 'Healthcare', src: '/images/clients/curewell.png' },
  { name: 'CortexCloud', industry: 'AI', src: '/images/clients/cortexcloud.png' },
  { name: 'VoltPay', industry: 'Fintech', src: '/images/clients/voltpay.png' },
  { name: 'ShopSphere', industry: 'E-commerce', src: '/images/clients/shopsphere.png' },
  { name: 'Medisphere', industry: 'Healthcare', src: '/images/clients/medisphere.png' },
];

const cases = [
  {
    title: 'AI-assisted onboarding reduced time-to-value by 42%',
    desc: 'Enterprise-grade workflows and fine-tuned models improved user activation and retention.',
    media: '/images/cases/onboarding.jpg',
  },
  {
    title: 'Payments reliability at 99.99% with audited contracts',
    desc: 'Escrow releases, milestone tracking, and dispute resolution led to higher trust and volume.',
    media: '/images/cases/payments.jpg',
  },
  {
    title: 'Design system refresh accelerated shipping by 3x',
    desc: 'A premium, accessible component library unified teams and improved build velocity.',
    media: '/images/cases/design-system.jpg',
  },
];

const Clients: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { notify } = useToaster();

  const [selected, setSelected] = useState<string>(ALL);
  const filtered = useMemo(
    () => (selected === ALL ? logos : logos.filter((l) => l.industry === selected)),
    [selected]
  );

  const headerRef = useRef<HTMLElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const casesRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const controlsVisible = useIntersectionObserver(controlsRef, { threshold: 0.1 });
  const gridVisible = useIntersectionObserver(gridRef, { threshold: 0.1 });
  const casesVisible = useIntersectionObserver(casesRef, { threshold: 0.1 });
  const ctaVisible = useIntersectionObserver(ctaRef, { threshold: 0.1 });

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <header
          ref={headerRef as any}
          className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}
        >
          <h1 className={common.title}>Our Clients</h1>
          <p className={common.subtitle}>Trusted by high-velocity teams across AI, fintech, e‑commerce, and healthcare.</p>
        </header>

        <div
          ref={controlsRef}
          className={cn(common.controls, controlsVisible ? common.isVisible : common.isNotVisible)}
          role="toolbar"
          aria-label="Filter clients by industry"
        >
          {industries.map((c) => (
            <button
              key={c}
              type="button"
              className={common.chip}
              aria-pressed={selected === c}
              onClick={() => {
                setSelected(c);
                notify({
                  title: 'Filter applied',
                  description: c === ALL ? 'Showing all industries' : `Showing ${c} clients`,
                  variant: 'info',
                  duration: 2000,
                });
              }}
            >
              {c}
            </button>
          ))}
        </div>

        <section aria-label="Client logos">
          <div
            ref={gridRef}
            className={cn(common.grid, gridVisible ? common.isVisible : common.isNotVisible)}
          >
            {filtered.length === 0 ? (
              <div className={common.gridSpanAll}>
                <EmptyState
                  title="No clients in this category"
                  description="Try a different industry or contact our team for a tailored walkthrough."
                  action={
                    <a href="/contact" className={common.button} aria-label="Contact sales">
                      Contact Sales
                    </a>
                  }
                />
              </div>
            ) : (
              filtered.map((l) => (
                <div key={l.name} className={common.logoCard} role="img" aria-label={`${l.name} logo`}>
                  <Image src={l.src} alt="" width={140} height={100} className={common.logo} />
                </div>
              ))
            )}
          </div>
        </section>

        <section className={common.section} aria-label="Case studies">
          <h2 className={common.sectionTitle}>Case Studies</h2>
          <div
            ref={casesRef}
            className={cn(common.caseGrid, casesVisible ? common.isVisible : common.isNotVisible)}
          >
            {cases.map((c) => (
              <article key={c.title} className={common.caseCard} aria-labelledby={`case-${c.title}`}>
                <div className={common.caseMedia}>
                  <Image src={c.media} alt="" fill sizes="(max-width: 1100px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div className={common.caseBody}>
                  <h3 id={`case-${c.title}`} className={common.caseTitle}>{c.title}</h3>
                  <p className={common.caseDesc}>{c.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={common.section} aria-label="Call to action">
          <div ref={ctaRef} className={cn(common.cta, ctaVisible ? common.isVisible : common.isNotVisible)}>
            <a
              href="/contact"
              className={common.button}
              aria-label="Contact sales"
              onClick={() =>
                notify({ title: 'Opening contact', description: 'We’ll help you get started.', variant: 'success', duration: 2500 })
              }
            >
              Contact Sales
            </a>
            <a
              href="/jobs"
              className={cn(common.button, common.buttonSecondary)}
              aria-label="Find talent"
              onClick={() =>
                notify({ title: 'Explore talent', description: 'Curated experts across domains.', variant: 'info', duration: 2500 })
              }
            >
              Find Talent
            </a>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Clients;
