// @AI-HINT: This is a Tabs component, a molecular element for switching between content panes.
'use client';

import React, {
  useState, createContext, useContext, useId, Children, isValidElement, cloneElement, useRef, useEffect, KeyboardEvent, FC, ReactNode, ForwardRefExoticComponent, RefAttributes
} from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './Tabs.common.module.css';
import lightStyles from './Tabs.light.module.css';
import darkStyles from './Tabs.dark.module.css';

// 1. CONTEXT
interface TabsContextProps {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  tabsId: string;
  themeStyles: Record<string, string>;
}
const TabsContext = createContext<TabsContextProps | null>(null);
const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within a <Tabs> component.');
  return context;
};

// 2. PROP TYPES
interface TabProps { children: ReactNode; index?: number; }
interface TabPanelProps { children: ReactNode; index?: number; }
interface TabsListProps { children: ReactNode; }
interface TabsPanelsProps { children: ReactNode; }

// 3. SUB-COMPONENTS
const Tab = React.forwardRef<HTMLButtonElement, TabProps>(({ children, index }, ref) => {
  const { selectedIndex, setSelectedIndex, tabsId, themeStyles } = useTabs();
  const isSelected = selectedIndex === index;
  return (
        <button
      ref={ref}
      role="tab"
      id={`${tabsId}-tab-${index}`}
      aria-controls={`${tabsId}-panel-${index}`}
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={cn(commonStyles.tabsTab, themeStyles.tabsTab, isSelected && [commonStyles.tabsTabSelected, themeStyles.tabsTabSelected])}
      onClick={() => setSelectedIndex(index!)}
    >
      {children}
    </button>
  );
});
Tab.displayName = 'Tab';

const TabsList: FC<TabsListProps> = ({ children }) => {
  const { selectedIndex, setSelectedIndex, themeStyles } = useTabs();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { tabRefs.current[selectedIndex]?.focus(); }, [selectedIndex]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tabs = Children.toArray(children).filter(isValidElement);
    const count = tabs.length;
    if (count === 0) return;
    let newIndex = selectedIndex;
    if (e.key === 'ArrowRight') newIndex = (selectedIndex + 1) % count;
    else if (e.key === 'ArrowLeft') newIndex = (selectedIndex - 1 + count) % count;
    else if (e.key === 'Home') newIndex = 0;
    else if (e.key === 'End') newIndex = count - 1;
    if (newIndex !== selectedIndex) { e.preventDefault(); setSelectedIndex(newIndex); }
  };

  return (
    <div role="tablist" aria-orientation="horizontal" className={cn(commonStyles.tabsList, themeStyles.tabsList)} onKeyDown={handleKeyDown}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child) && (child.type === Tab || (child.type as any).displayName === 'Tab')) {
          // This is a safe cast because we are checking the type of the child.
          // The type error is a known issue with forwardRef and cloneElement in TypeScript.
          return cloneElement(child as React.ReactElement<TabProps & { ref: React.Ref<HTMLButtonElement> }>, {
            index,
            ref: (el: HTMLButtonElement | null) => { tabRefs.current[index] = el; },
          });
        }
        return child;
      })}
    </div>
  );
};
TabsList.displayName = 'TabsList';

const TabPanel: FC<TabPanelProps> = ({ children, index }) => {
  const { selectedIndex, tabsId, themeStyles } = useTabs();
  const isSelected = selectedIndex === index;
  return (
    <div
      role="tabpanel"
      id={`${tabsId}-panel-${index}`}
      aria-labelledby={`${tabsId}-tab-${index}`}
      hidden={!isSelected}
      className={cn(commonStyles.tabsPanel, themeStyles.tabsPanel)}
    >
      {isSelected && children}
    </div>
  );
};
TabPanel.displayName = 'TabPanel';

const TabsPanels: FC<TabsPanelsProps> = ({ children }) => {
  const { themeStyles } = useTabs();
  return (
    <div className={cn(commonStyles.tabsPanels, themeStyles.tabsPanels)}>
      {Children.map(children, (child, index) => {
        if (isValidElement(child) && child.type === TabPanel) {
          return cloneElement(child as React.ReactElement<TabPanelProps>, { index });
        }
        return child;
      })}
    </div>
  );
};
TabsPanels.displayName = 'TabsPanels';

// 4. MAIN COMPONENT
interface TabsComposition {
  List: FC<TabsListProps>;
  Tab: ForwardRefExoticComponent<TabProps & RefAttributes<HTMLButtonElement>>;
  Panels: FC<TabsPanelsProps>;
  Panel: FC<TabPanelProps>;
}

const Tabs: FC<{ children: ReactNode; defaultIndex?: number; className?: string }> & TabsComposition = ({ children, defaultIndex = 0, className = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const tabsId = useId();
  const { theme } = useTheme();

  if (!theme) return null;

  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex, tabsId, themeStyles }}>
      <div className={cn(
        commonStyles.tabs,
        themeStyles.tabs,
        className
      )}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panels = TabsPanels;
Tabs.Panel = TabPanel;

export default Tabs;
