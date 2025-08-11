// @AI-HINT: This is a reusable ActionMenu component for displaying a list of actions in a popover. It's designed for card-based UIs and supports theme-aware styling.
'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { useTheme } from 'next-themes';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';

import commonStyles from './ActionMenu.common.module.css';
import lightStyles from './ActionMenu.light.module.css';
import darkStyles from './ActionMenu.dark.module.css';

export interface ActionMenuItem {
  label?: string;
  onClick?: () => void;
  icon?: React.ElementType;
  isSeparator?: boolean;
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ items, trigger }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!theme) return null;
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={cn(commonStyles.menuContainer)} ref={menuRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)} ref={triggerRef as any}>
          {trigger}
        </div>
      ) : (
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={menuId}
        >
          <MoreHorizontal size={20} />
        </Button>
      )}

      {isOpen && (
        <div
          id={menuId}
          className={cn(commonStyles.menu, themeStyles.menu)}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item, index) =>
            item.isSeparator ? (
              <div key={`separator-${index}`} className={cn(commonStyles.separator, themeStyles.separator)} />
            ) : (
              <button
                key={item.label}
                className={cn(commonStyles.menuItem, themeStyles.menuItem)}
                onClick={() => handleItemClick(item)}
                role="menuitem"
                disabled={item.disabled}
              >
                {item.icon && <item.icon className={cn(commonStyles.itemIcon, themeStyles.itemIcon)} size={16} />}
                <span className={cn(commonStyles.itemLabel, themeStyles.itemLabel)}>{item.label}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
