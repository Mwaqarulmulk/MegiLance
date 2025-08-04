// @AI-HINT: This is a Tabs component, a molecular element for switching between content panes.
'use client';

import React, { useState, createContext, useContext, useId, Children, isValidElement, cloneElement, useRef, useEffect, KeyboardEvent, FC, ReactNode } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Tabs.common.css';
import './Tabs.light.css';
import './Tabs.dark.css';

interface TabsContextProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  tabsId: string;
}

const TabsContext = createContext<TabsContextProps | null>(null);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a <Tabs> component.');
  }
  return context;
};

// Main Tabs Component (State Provider)
interface TabsProps {
  children: ReactNode;
  defaultIndex?: number;
  className?: string;
}

const Tabs: FC<TabsProps> & { List: FC<TabsListProps>; Panels: FC<TabsPanelsProps> } = ({ children, defaultIndex = 0, className = '' }) => {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const tabsId = useId();

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex, tabsId }}>
      <div className={`Tabs Tabs--${theme} ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

// Tabs.List Component
interface TabsListProps {
  children: ReactNode;
}

const TabsList: FC<TabsListProps> & { Tab: FC<TabProps> } = ({ children }) => {
  const { selectedIndex, setSelectedIndex, tabsId } = useTabs();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (tabRefs.current[selectedIndex]) {
      tabRefs.current[selectedIndex]!.focus();
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Children.toArray(children).filter(
      (child) => isValidElement(child) && (child.type as any).displayName === 'Tab'
    );
    const tabsCount = tabs.length;
    if (tabsCount === 0) return;

    let newIndex = selectedIndex;

    if (e.key === 'ArrowRight') {
      newIndex = (selectedIndex + 1) % tabsCount;
    } else if (e.key === 'ArrowLeft') {
      newIndex = (selectedIndex - 1 + tabsCount) % tabsCount;
    } else if (e.key === 'Home') {
      newIndex = 0;
    } else if (e.key === 'End') {
      newIndex = tabsCount - 1;
    }

    if (newIndex !== selectedIndex) {
      e.preventDefault();
      setSelectedIndex(newIndex);
    }
  };

  return (
    <div role="tablist" className="Tabs-list" onKeyDown={handleKeyDown}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child) && (child.type as any).displayName === 'Tab') {
          return cloneElement(child, {
            index,
            ref: (el: HTMLButtonElement | null) => (tabRefs.current[index] = el),
          } as any); // Using `as any` to bypass strict cloneElement typing for ref and index
        }
        return child;
      })}
    </div>
  );
};

// Tabs.Tab Component
interface TabProps {
  children: ReactNode;
  index?: number; // Injected by Tabs.List
}

const Tab: FC<TabProps> = React.forwardRef<HTMLButtonElement, TabProps>(({ children, index }, ref) => {
  const { selectedIndex, setSelectedIndex, tabsId } = useTabs();
  const isSelected = selectedIndex === index;

  return (
    <button
      ref={ref}
      role="tab"
      id={`${tabsId}-tab-${index}`}
      aria-controls={`${tabsId}-panel-${index}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className="Tabs-tab"
      onClick={() => setSelectedIndex(index!)}
    >
      {children}
    </button>
  );
});
Tab.displayName = 'Tab';
TabsList.Tab = Tab;
Tabs.List = TabsList;

// Tabs.Panels Component
interface TabsPanelsProps {
  children: ReactNode;
}

const TabsPanels: FC<TabsPanelsProps> & { Panel: FC<TabPanelProps> } = ({ children }) => {
  return (
    <div className="Tabs-panels">
      {Children.map(children, (child, index) => {
        if (isValidElement(child) && (child.type as any).displayName === 'TabPanel') {
          return cloneElement(child, { index } as any);
        }
        return child;
      })}
    </div>
  );
};

// Tabs.Panel Component
interface TabPanelProps {
  children: ReactNode;
  index?: number; // Injected by Tabs.Panels
}

const TabPanel: FC<TabPanelProps> = ({ children, index }) => {
  const { selectedIndex, tabsId } = useTabs();
  const isSelected = selectedIndex === index;

  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${index}`}
      aria-labelledby={`${tabsId}-tab-${index}`}
      hidden={!isSelected}
      className="Tabs-panel"
    >
      {isSelected && children}
    </div>
  );
};
TabPanel.displayName = 'TabPanel';
TabsPanels.Panel = TabPanel;
Tabs.Panels = TabsPanels;

export default Tabs;
