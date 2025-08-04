// @AI-HINT: This is a Tooltip component, an atomic element for showing information on hover.
'use client';

import React, { useState, useRef, cloneElement, useId } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import './Tooltip.common.css';
import './Tooltip.light.css';
import './Tooltip.dark.css';

export interface TooltipProps {
  children: React.ReactElement;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top', delay = 200, className = '' }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setVisible(false);
  };

  const triggerProps = {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
    'aria-describedby': visible ? tooltipId : undefined,
  };

  return (
    <div className={`Tooltip-wrapper ${className}`}>
      {cloneElement(children, triggerProps)}
      {visible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={`Tooltip Tooltip--${position} Tooltip--${theme}`}
        >
          {text}
          <div className="Tooltip-arrow" data-popper-arrow />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
