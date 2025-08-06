// @AI-HINT: This is a reusable accordion component for displaying collapsible content, like FAQs.
'use client';

import React, { useState, useContext, createContext, useId } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Accordion.common.module.css';
import lightStyles from './Accordion.light.module.css';
import darkStyles from './Accordion.dark.module.css';

// @AI-HINT: The Accordion is now context-aware to allow for 'single' or 'multiple' open items.

interface AccordionContextType {
  openItems: string[];
  toggleItem: (id: string) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextType | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an Accordion component');
  }
  return context;
};

interface AccordionItemProps {
  value: string; // Unique value for this item
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ value, title, children }) => {
  const { openItems, toggleItem } = useAccordion();
  const { theme } = useTheme();
  const contentId = useId();
  const buttonId = useId();

  const isOpen = openItems.includes(value);
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.accordionItem, themeStyles.accordionItem, isOpen && commonStyles.open)}>
      <h3>
        <button
          id={buttonId}
          onClick={() => toggleItem(value)}
          aria-expanded={isOpen}
          aria-controls={contentId}
          className={commonStyles.accordionTrigger}
        >
          <span className={commonStyles.accordionTitle}>{title}</span>
          <span className={cn(commonStyles.accordionIcon, isOpen && commonStyles.iconOpen)} aria-hidden="true" />
        </button>
      </h3>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(commonStyles.accordionContent, isOpen ? commonStyles.contentOpen : commonStyles.contentClosed)}
      >
        <div className={commonStyles.accordionContentText}>{children}</div>
      </div>
    </div>
  );
};

interface AccordionProps {
  children: React.ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ 
  children, 
  type = 'single', 
  defaultValue, 
  className 
}) => {
  const [openItems, setOpenItems] = useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    return [];
  });

  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const toggleItem = (id: string) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(id) ? [] : [id]);
    } else {
      setOpenItems(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, type }}>
      <div className={cn(commonStyles.accordionRoot, themeStyles.accordionRoot, className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

export default Accordion;
