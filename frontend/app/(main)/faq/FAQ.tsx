// @AI-HINT: Premium FAQ page with accessible accordion, theme-aware styles, and JSON-LD schema.
'use client';
import React from 'react';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import common from './FAQ.common.module.css';
import light from './FAQ.light.module.css';
import dark from './FAQ.dark.module.css';

function useInView<T extends HTMLElement>(opts: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const ob = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        ob.disconnect();
      }
    }, opts);
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, [opts]);
  return { ref, visible } as const;
}

type QA = { question: string; answer: string };
const items: QA[] = [
  { question: 'What is MegiLance?', answer: 'MegiLance is an AI-powered freelancing platform with secure blockchain payments and investor-grade UX.' },
  { question: 'How do fees work?', answer: 'Transparent pricing with simple tiers. No hidden charges. See the Pricing page for details.' },
  { question: 'Is my data safe?', answer: 'Yes. We follow strong security practices and provide clear security documentation and disclosures.' },
];

const FAQ: React.FC = () => {
  const { theme } = useTheme();
  const t = theme === 'dark' ? dark : light;
  const styles = {
    root: cn(common.root, t.root),
    header: cn(common.header, t.header),
    subtitle: cn(common.subtitle, t.subtitle),
    list: cn(common.list, t.list),
    item: cn(common.item, t.item),
    q: cn(common.q, t.q),
    a: cn(common.a, t.a),
    badge: cn(common.badge, t.badge),
    fadeIn: cn(common.fadeIn, t.fadeIn),
    visible: cn(common.visible, t.visible),
  };

  const { ref: headerRef, visible: headerVisible } = useInView<HTMLDivElement>();
  const { ref: listRef, visible: listVisible } = useInView<HTMLDivElement>({ threshold: 0.2 });

  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const count = items.length;
    const current = openIndex ?? 0;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (current + 1) % count;
      buttonRefs.current[next]?.focus();
      setOpenIndex(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (current - 1 + count) % count;
      buttonRefs.current[prev]?.focus();
      setOpenIndex(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
      setOpenIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      buttonRefs.current[count - 1]?.focus();
      setOpenIndex(count - 1);
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <main id="main-content" role="main" aria-labelledby="faq-title" className={styles.root}>
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div ref={headerRef} className={cn(styles.header, styles.fadeIn, headerVisible && styles.visible)}>
        <span className={styles.badge}>Answers you need</span>
        <h1 id="faq-title">Frequently Asked Questions</h1>
        <p className={styles.subtitle}>Quick, clear answers about pricing, security, and getting started.</p>
      </div>

      <div ref={listRef} className={cn(styles.list, styles.fadeIn, listVisible && styles.visible)} role="region" aria-labelledby="faq-title" onKeyDown={onKeyDown}>
        {items.map((qa, i) => {
          const isOpen = openIndex === i;
          const panelId = `faq-panel-${i}`;
          const buttonId = `faq-button-${i}`;
          return (
            <div key={qa.question} className={styles.item}>
              <h2 className={styles.q}>
                <button
                  id={buttonId}
                  ref={(el) => { buttonRefs.current[i] = el; }}
                  className={styles.q}
                  aria-controls={panelId}
                  aria-expanded={!!isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {qa.question}
                </button>
              </h2>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className={styles.a}
              >
                <p>{qa.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export default FAQ;
