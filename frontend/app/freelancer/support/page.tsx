// @AI-HINT: This page provides support resources for freelancers, including a contact form and an FAQ section. It has been fully refactored for a premium, theme-aware design.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';
import Textarea from '@/app/components/Textarea/Textarea';
import Accordion, { AccordionItem } from '@/app/components/Accordion/Accordion';
import commonStyles from './SupportPage.common.module.css';
import lightStyles from './SupportPage.light.module.css';
import darkStyles from './SupportPage.dark.module.css';

// @AI-HINT: Mock data for FAQ items.
const faqItems = [
  {
    question: 'How do I withdraw my earnings?',
    answer: 'You can withdraw your earnings from the /freelancer/withdraw page. You will need a valid crypto wallet address. Withdrawals are processed in USDC.'
  },
  {
    question: 'What are the platform fees?',
    answer: 'MegiLance charges a 10% service fee on all completed projects. This fee is automatically deducted from the payment before it is credited to your account.'
  },
  {
    question: 'How do disputes work?',
    answer: 'If there is a disagreement with a client, you can raise a dispute from the contract page. A decentralized arbitration service will mediate the dispute, and their decision is final.'
  },
  {
    question: 'How can I improve my Freelancer Rank?',
    answer: 'Your rank is determined by factors like job success rate, client reviews, and on-time delivery. Consistently delivering high-quality work is the best way to improve your rank.'
  }
];

const SupportPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  return (
    <div className={cn(styles.pageWrapper)}>
      <header className={cn(styles.header)}>
        <h1>Support Center</h1>
        <p>We&apos;re here to help. Find answers or get in touch with our team.</p>
      </header>

      <main className={cn(styles.mainGrid)}>
        <div className={cn(styles.card)} role="region" aria-label="Contact support" title="Contact support">
          <h2 className={cn(styles.cardTitle)}>Contact Support</h2>
          <form className={cn(styles.form)}>
            <Input
              id="subject"
              label="Subject"
              placeholder="e.g., Issue with a contract"
            />
            <Textarea
              id="message"
              label="Message"
              placeholder="Describe your issue in detail..."
              rows={6}
            />
            <Button variant="primary" title="Submit support ticket" aria-label="Submit support ticket">Submit Ticket</Button>
          </form>
        </div>

        <div className={cn(styles.card)} role="region" aria-label="Frequently asked questions" title="Frequently asked questions">
          <h2 className={cn(styles.cardTitle)}>Frequently Asked Questions</h2>
          <span className={cn(styles.srOnly)} aria-live="polite">{faqItems.length} FAQ item{faqItems.length === 1 ? '' : 's'}</span>
          <Accordion>
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`} title={item.question}>
                <p>{item.answer}</p>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;

