/* AI-HINT: This component renders a single FAQ item with an expandable answer. It manages its own open/closed state and uses CSS transitions for a smooth accordion effect. */

'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FaqItem.module.css';
import lightStyles from './FaqItem.light.module.css';
import darkStyles from './FaqItem.dark.module.css';

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const itemClasses = [
    styles.item,
    lightStyles.theme,
    darkStyles.theme,
  ].join(' ');

  const chevronClasses = [
    styles.chevron,
    isOpen ? styles.chevronOpen : ''
  ].join(' ');

  const answerClasses = [
    styles.answer,
    isOpen ? styles.answerOpen : ''
  ].join(' ');

  return (
    <div className={itemClasses}>
      <button className={styles.question} onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <ChevronDown className={chevronClasses} />
      </button>
      <div className={answerClasses}>
        <div className={styles.answerContent}>
          {children}
        </div>
      </div>
    </div>
  );
};
