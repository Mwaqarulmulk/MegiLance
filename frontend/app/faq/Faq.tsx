// @AI-HINT: This is the FAQ page root component. It uses an accordion for questions. All styles are per-component only. See Faq.common.css, Faq.light.css, and Faq.dark.css for theming.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Faq.common.module.css';
import lightStyles from './Faq.light.module.css';
import darkStyles from './Faq.dark.module.css';

// @AI-HINT: This is the FAQ page root component. It uses an accordion for questions and is styled with CSS modules.

const faqData = [
  {
    question: 'What is MegiLance?',
    answer: 'MegiLance is a next-generation freelance platform that uses AI for intelligent project matching and blockchain for secure, transparent payments in USDC.',
  },
  {
    question: 'How does the AI ranking work?',
    answer: 'Our proprietary AI analyzes your skills, project history, client feedback, and other data points to generate an objective ranking. A higher rank increases your visibility to top clients.',
  },
  {
    question: 'What are the fees?',
    answer: 'It is free for freelancers to join and apply for jobs. We charge clients a competitive 5% platform fee on all payments, which is handled securely through our smart contract escrow system.',
  },
  {
    question: 'What is USDC and why do you use it?',
    answer: 'USDC is a stablecoin pegged to the US Dollar. We use it for payments to ensure low transaction fees, fast settlement times, and global accessibility without the volatility of other cryptocurrencies.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes. When a client funds a project, the USDC is held in a secure, audited smart contract escrow. Funds are only released to the freelancer upon successful completion and approval of the work.',
  },
];

interface FaqItemProps {
  item: { question: string; answer: string; };
  isOpen: boolean;
  onClick: () => void;
}

const FaqItem = ({ item, isOpen, onClick }: FaqItemProps) => (
  <div className={commonStyles.faqItem}>
    <button className={commonStyles.faqItemQuestion} onClick={onClick}>
      <span>{item.question}</span>
      <span className={cn(commonStyles.faqItemIcon, isOpen && commonStyles.faqItemIconOpen)}>{isOpen ? '−' : '+'}</span >
    </button>
    {isOpen && <div className={commonStyles.faqItemAnswer}><p>{item.answer}</p></div>}
  </div>
);

const Faq: React.FC = () => {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.faq, themeStyles.themeWrapper)}>
      <div className={commonStyles.faqContainer}>
        <header className={commonStyles.faqHeader}>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about MegiLance.</p>
        </header>
        <div className={commonStyles.faqList}>
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
