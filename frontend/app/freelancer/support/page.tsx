// @AI-HINT: This page provides support resources for freelancers, including a contact form and an FAQ section.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Accordion, { AccordionItem } from '@/app/components/Accordion/Accordion';
import './SupportPage.common.css';
import './SupportPage.light.css';
import './SupportPage.dark.css';

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

  return (
    <div className={`SupportPage-container SupportPage-container--${theme}`}>
      <header className="SupportPage-header">
        <h1 className="SupportPage-title">Support Center</h1>
        <p className="SupportPage-subtitle">We&apos;re here to help. Find answers or get in touch with our team.</p>
      </header>

      <main className="SupportPage-main">
        <div className={`SupportPage-card SupportPage-card--${theme}`}>
          <h2 className="SupportPage-card-title">Contact Support</h2>
          <form className="SupportPage-form">
            <div className="SupportPage-form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" placeholder="e.g., Issue with a contract" className={`SupportPage-input SupportPage-input--${theme}`} />
            </div>
            <div className="SupportPage-form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows={6} placeholder="Describe your issue in detail..." className={`SupportPage-textarea SupportPage-textarea--${theme}`}></textarea>
            </div>
            <Button theme={theme} variant="primary" fullWidth>Submit Ticket</Button>
          </form>
        </div>

        <div className={`SupportPage-card SupportPage-card--${theme}`}>
          <h2 className="SupportPage-card-title">Frequently Asked Questions</h2>
          <Accordion>
            {faqItems.map((item, index) => (
              <AccordionItem key={index} title={item.question}>
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
