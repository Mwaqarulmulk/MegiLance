// @AI-HINT: This is a Dropdown component, a molecular element for selecting an option from a list.
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Dropdown.common.css';
import './Dropdown.light.css';
import './Dropdown.dark.css';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selected: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect, placeholder = 'Select...' }) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`Dropdown Dropdown--${theme}`} ref={dropdownRef}>
      <div className="Dropdown-selected" onClick={() => setIsOpen(!isOpen)}>
        {selected ? selected.label : placeholder}
        <span className={`Dropdown-caret ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      {isOpen && (
        <ul className="Dropdown-options">
          {options.map((option) => (
            <li
              key={option.value}
              className="Dropdown-option"
              onClick={() => handleSelect(option)}
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
