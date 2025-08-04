// @AI-HINT: This is a reusable accordion component for displaying collapsible content, like FAQs.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Accordion.common.css';
import './Accordion.light.css';
import './Accordion.dark.css';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`AccordionItem-container AccordionItem-container--${theme}`}>
      <button 
        className={`AccordionItem-button AccordionItem-button--${theme}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen ? 'true' : 'false'}
      >
        <span className="AccordionItem-title">{title}</span>
        <span className={`AccordionItem-icon ${isOpen ? 'AccordionItem-icon--open' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </span>
      </button>
      {isOpen && (
        <div className={`AccordionItem-content AccordionItem-content--${theme}`}>
          {children}
        </div>
      )}
    </div>
  );
};

interface AccordionProps {
    children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ children }) => {
    const { theme } = useTheme();
    return (
        <div className={`Accordion-container Accordion-container--${theme}`}>
            {children}
        </div>
    );
}

export default Accordion;
