// @AI-HINT: This is a Tabs component, a molecular element for switching between content panes.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Tabs.common.css';
import './Tabs.light.css';
import './Tabs.dark.css';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].id : ''));

  const activeContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`Tabs Tabs--${theme}`}>
      <div className="Tabs-list" role="tablist">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isSelected ? 'true' : 'false'}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`Tabs-button ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="Tabs-panel"
      >
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;
