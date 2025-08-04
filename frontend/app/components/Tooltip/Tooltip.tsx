// @AI-HINT: This is a Tooltip component, an atomic element for showing information on hover.
'use client';

import React, { useState } from 'react';
import './Tooltip.common.css';
import './Tooltip.light.css';
import './Tooltip.dark.css';

interface TooltipProps {
  children: React.ReactElement;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  theme?: 'light' | 'dark';
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, position = 'top', theme = 'light' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="Tooltip-wrapper"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`Tooltip Tooltip--${position} Tooltip--${theme}`}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
