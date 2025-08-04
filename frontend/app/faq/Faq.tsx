// @AI-HINT: This is the FAQ page root component. It uses an accordion for questions. All styles are per-component only. See Faq.common.css, Faq.light.css, and Faq.dark.css for theming.
'use client';

import React, { useState } from 'react';
import './Faq.common.css';
import './Faq.light.css';
import './Faq.dark.css';

interface FaqProps {
  theme?: 'light' | 'dark';
}

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

const FaqItem = ({ item, isOpen, onClick, theme }: any) => (
  <div className="FaqItem">
    <button className="FaqItem-question" onClick={onClick}>
      <span>{item.question}</span>
      <span className={`FaqItem-icon ${isOpen ? 'open' : ''}`}>{isOpen ? '−' : '+'}</span>
    </button>
    {isOpen && <div className="FaqItem-answer"><p>{item.answer}</p></div>}
  </div>
);

const Faq: React.FC<FaqProps> = ({ theme = 'light' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`Faq Faq--${theme}`}>
      <div className="Faq-container">
        <header className="Faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about MegiLance.</p>
        </header>
        <div className="Faq-list">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
