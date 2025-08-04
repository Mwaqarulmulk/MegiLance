// @AI-HINT: This component renders the MegiLance SVG logo.
import React from 'react';

export const MegiLanceLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="MegiLance Logo"
  >
    <rect width="32" height="32" rx="8" fill="#4573DF" />
    <path
      d="M9 23V9H12.5L16 16L19.5 9H23V23H20V12L16.5 19H15.5L12 12V23H9Z"
      fill="white"
    />
  </svg>
);
