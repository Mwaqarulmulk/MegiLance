// @AI-HINT: This is a Dropdown component, a molecular element for selecting an option from a list.
'use client';

import React, { useState, useRef, useEffect, useId, useCallback } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './Dropdown.common.module.css';
import lightStyles from './Dropdown.light.module.css';
import darkStyles from './Dropdown.dark.module.css';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  selected: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect, placeholder = 'Select...', className = '' }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const labelId = useId();

  const handleSelect = useCallback((option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          triggerRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prevIndex) => (prevIndex + 1) % options.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleSelect(options[focusedIndex]);
          }
          break;
        case 'Home':
            event.preventDefault();
            setFocusedIndex(0);
            break;
        case 'End':
            event.preventDefault();
            setFocusedIndex(options.length - 1);
            break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, options, handleSelect]);

  useEffect(() => {
    if (isOpen && focusedIndex !== -1) {
      const optionElement = document.getElementById(`${listId}-option-${focusedIndex}`);
      optionElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, focusedIndex, listId]);

  if (!theme) return null;
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.dropdown, themeStyles.dropdown, className)} ref={dropdownRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(commonStyles.trigger, themeStyles.trigger)}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${triggerRef.current?.id}`}
      >
        <span id={labelId} className={cn(commonStyles.label, themeStyles.label)}>{selected ? selected.label : placeholder}</span>
        <IoChevronDown className={cn(commonStyles.caret, themeStyles.caret, isOpen && commonStyles.caretOpen, isOpen && themeStyles.caretOpen)} />
      </button>
      {isOpen && (
        <ul
          id={listId}
          className={cn(commonStyles.options, themeStyles.options)}
          role="listbox"
          aria-labelledby={labelId}
          aria-activedescendant={focusedIndex >= 0 ? `${listId}-option-${focusedIndex}` : undefined}
        >
          {options.map((option, index) => (
            <li
              id={`${listId}-option-${index}`}
              key={option.value}
              className={cn(
                commonStyles.option,
                themeStyles.option,
                focusedIndex === index && commonStyles.optionFocused,
                focusedIndex === index && themeStyles.optionFocused
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setFocusedIndex(index)}
              role="option"
              aria-selected={selected?.value === option.value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
