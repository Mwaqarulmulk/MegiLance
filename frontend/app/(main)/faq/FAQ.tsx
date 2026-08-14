// @AI-HINT: Premium FAQ page consuming central platform FAQs, with full semantic HTML rendering for search & AI engine crawlability.
'use client';
import React from 'react';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Accordion, { AccordionItem } from '@/app/components/molecules/Accordion/Accordion';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import { FAQIllustration } from '@/app/components/Illustrations/Illustrations';
import illustrationStyles from '@/app/components/Illustrations/Illustrations.common.module.css';
import common from './FAQ.common.module.css';
import light from './FAQ.light.module.css';
import dark from './FAQ.dark.module.css';
import { PLATFORM_FAQS, PRICING_CONFIG, PLATFORM_STATUS } from '@/lib/platform-config';

const additionalFaqs = [
  {
    question: 'What types of freelance projects are supported?',
    answer: 'MegiLance supports projects across 10 categories including Web & Mobile Development, UI/UX Design, AI & Machine Learning, Data Analytics, Digital Marketing, Technical Writing, and Video Production.',
  },
  {
    question: 'What payment methods are supported on MegiLance?',
    answer: 'We support standard payment methods including major credit/debit cards via Stripe and cryptocurrency (USDC) for fast global settlements. All transactions are held in milestone escrow until deliverable approval.',
  },
  {
    question: 'What is the dispute mediation process?',
    answer: 'If a disagreement occurs regarding milestone deliverables, either party can submit a mediation request. Our team reviews project requirements, work submissions, and workroom communications to facilitate a fair resolution according to agreed milestone criteria.',
  },
  {
    question: 'How do I get started as a freelancer or client?',
    answer: 'You can immediately use any of our 11 free AI tools (such as the Price Estimator, Rate Advisor, or Proposal Writer) without an account. When ready to hire or find work, click Sign Up to create your profile or publish your project.',
  },
];

const allFaqs = [...PLATFORM_FAQS, ...additionalFaqs];

const FAQ: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const styles = React.useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? dark : light;
    return {
      root: cn(common.root, themeStyles.root),
      header: cn(common.header, themeStyles.header),
      title: cn(common.title, themeStyles.title),
      subtitle: cn(common.subtitle, themeStyles.subtitle),
      badge: cn(common.badge, themeStyles.badge),
      accordionContainer: cn(common.accordionContainer),
    };
  }, [resolvedTheme]);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
         <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
         <ParticlesSystem count={12} className="absolute inset-0" />
         <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
           <FloatingCube size={40} />
         </div>
         <div className="absolute bottom-40 right-20 opacity-10 animate-float-medium">
           <FloatingSphere size={30} variant="gradient" />
         </div>
      </div>

      <main id="main-content" role="main" aria-labelledby="faq-title" className={styles.root}>
        <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        
        <ScrollReveal>
          <header className={styles.header}>
            <div className={common.heroRow}>
              <div className={common.heroContent}>
                <span className={styles.badge}>Clear &amp; Transparent Answers</span>
                <h1 id="faq-title" className={styles.title}>Frequently Asked Questions</h1>
                <p className={styles.subtitle}>
                  Everything you need to know about MegiLance AI tools, milestone payments, fee structure, and talent discovery.
                </p>
              </div>
              <FAQIllustration className={illustrationStyles.heroIllustration} />
            </div>
          </header>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className={styles.accordionContainer}>
            <Accordion type="single" defaultValue="item-0">
              {allFaqs.map((item, idx) => (
                <AccordionItem key={`item-${idx}`} value={`item-${idx}`} title={item.question}>
                  <p>{item.answer}</p>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </ScrollReveal>
      </main>
    </PageTransition>
  );
};

export default FAQ;
