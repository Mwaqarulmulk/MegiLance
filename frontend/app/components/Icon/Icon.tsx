// @AI-HINT: Unified Icon component for MegiLance design system
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  'aria-label'?: string;
}

export type IconName = 
  // Navigation
  | 'menu' | 'close' | 'home' | 'search' | 'arrow-right' | 'sun' | 'moon'
  // Actions  
  | 'add' | 'edit' | 'delete' | 'save'
  // Communication
  | 'message' | 'notification' | 'mail'
  // Business
  | 'wallet' | 'analytics' | 'projects'
  // Technology
  | 'ai-brain' | 'cpu'
  // Brand
  | 'logo-icon' | 'avatar-placeholder'
  // Utility
  | 'globe' | 'file' | 'window';

const sizeMap = {
  xs: 16,
  sm: 20, 
  md: 24,
  lg: 32,
  xl: 48,
};

const iconPaths: Record<IconName, string> = {
  // Navigation
  'menu': 'M3 6h18M3 12h18M3 18h18',
  'close': 'M18 6L6 18M6 6l12 12',
  'home': 'M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z',
  'search': '', // handled by special component
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'sun': '', // handled by special component
  'moon': 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  
  // Actions
  'add': '', // handled by special component
  'edit': 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  'delete': 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6',
  'save': 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  
  // Communication
  'message': 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  'notification': 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  'mail': 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
  
  // Business
  'wallet': 'M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5H16a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h5zM16 12h.01',
  'analytics': 'M3 3v18h18M7 16l4-4 4 4 6-6',
  'projects': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  
  // Technology
  'ai-brain': 'M9.5 3a5.5 5.5 0 0 1 5.4 4.5h.6a4.5 4.5 0 0 1 0 9H9a6 6 0 0 1-5.9-5.2A5.5 5.5 0 0 1 9.5 3z',
  'cpu': '', // handled by special component
  
  // Brand
  'logo-icon': '',
  'avatar-placeholder': '',
  
  // Utility
  'globe': 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM2 12h20M8 12a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4 10z',
  'file': 'M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM13 2v7h7',
  'window': 'M3 3h18v18H3zM3 9h18'
};

const specialIcons: Partial<Record<IconName, React.ComponentType<any>>> = {
  'search': () => (
    <>
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  'sun': () => (
    <>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  'add': () => (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  'cpu': () => (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
  'home': () => (
    <>
      <path d="M3 9.5L12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  'analytics': () => (
    <>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
    </>
  )
};

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 'md', 
  className, 
  'aria-label': ariaLabel,
  ...props 
}) => {
  const iconSize = typeof size === 'number' ? size : sizeMap[size];
  const SpecialComponent = specialIcons[name];

  if (name === 'logo-icon' || name === 'avatar-placeholder') {
    // For brand icons, use the SVG files directly
    const src = name === 'logo-icon' ? '/logo-icon.svg' : '/mock-avatar.svg';
    return (
      <Image 
        src={src} 
        alt={ariaLabel || name}
        width={iconSize}
        height={iconSize}
        className={cn('inline-block', className)}
        {...(props as any)}
      />
    );
  }

  return (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('inline-block', className)}
      role="img"
      aria-label={ariaLabel || name}
      {...props}
    >
      <title>{name}</title>
      {SpecialComponent ? (
        <SpecialComponent />
      ) : (
        <path d={iconPaths[name]} />
      )}
    </svg>
  );
};

export default Icon;