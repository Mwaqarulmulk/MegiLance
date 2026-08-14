'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { PLATFORM_FAQS } from '@/lib/platform-config';
import commonStyles from './HomeFAQ.common.module.css';
import lightStyles from './HomeFAQ.light.module.css';
import darkStyles from './HomeFAQ.dark.module.css';

export default function HomeFAQ() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>Frequently Asked Questions</span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>Got Questions? We Have Answers</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Everything you need to know about our free AI tools, marketplace workflows, and milestone payment safety.
        </p>
      </div>

      <div className={commonStyles.faqList} role="region" aria-label="Frequently Asked Questions">
        {PLATFORM_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className={cn(commonStyles.faqItem, themeStyles.faqItem, isOpen && commonStyles.faqItemOpen)}>
              <button
                type="button"
                className={cn(commonStyles.questionBtn, themeStyles.questionBtn)}
                onClick={() => toggleFaq(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={cn(commonStyles.chevron, isOpen && commonStyles.chevronRotated)}
                />
              </button>
              {/* Server-rendered HTML answer for crawlability */}
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={cn(commonStyles.answerWrapper, isOpen ? commonStyles.answerOpen : commonStyles.answerClosed)}
              >
                <p className={cn(commonStyles.answerText, themeStyles.answerText)}>{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={commonStyles.footer}>
        <span>Have more questions?</span>
        <Link href="/faq" className={cn(commonStyles.moreLink, themeStyles.moreLink)}>
          <span>View All Platform FAQs</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
