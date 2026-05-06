// @AI-HINT: This is a versatile, enterprise-grade Button component for all user actions. It supports multiple variants (primary, secondary), sizes, loading/disabled states, and icons. All styles are per-component only.

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';

// ── Provider logos ────────────────────────────────────────────────────────────
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GitHubLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="currentColor" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

import commonStyles from './Button.common.module.css';
import lightStyles from './Button.light.module.css';
import darkStyles from './Button.dark.module.css';

// Base props for the button, independent of the element type
export interface ButtonOwnProps<E extends React.ElementType = React.ElementType> {
  as?: E;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'success' | 'warning' | 'social' | 'outline';
  // supports legacy size names for backwards-compat
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
  provider?: 'google' | 'github';
  iconBefore?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  magnetic?: boolean;
}

// Combined props including standard HTML attributes
export type ButtonProps<C extends React.ElementType = 'button'> = ButtonOwnProps<C> & Omit<React.ComponentProps<C>, keyof ButtonOwnProps<C>>;

const Button = <C extends React.ElementType = 'button',>({
  children,
  as,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  iconBefore,
  iconAfter,
  provider,
  className = '',
  onClick,
  magnetic = true,
  type = 'button',
  ...props
}: ButtonProps<C> & { type?: 'button' | 'submit' | 'reset' }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const BaseComponent = (as || 'button') as React.ElementType;
  const MotionComponent = motion.create(BaseComponent);
  const isButton = !as || as === 'button';

  useEffect(() => setMounted(true), []);

  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Magnetic effect variables
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Springy magnetic bounds
  const x = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.1 });

  // Shine & glow tracking
  const overflowX = useMotionValue(0);
  const overflowY = useMotionValue(0);
  const shineBackground = useMotionTemplate`radial-gradient(circle at ${overflowX}px ${overflowY}px, rgba(255, 255, 255, 0.4) 0%, transparent 60%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isLoading || props.disabled || !buttonRef.current) return;
    
    // Magnetic pull
    if (magnetic) {
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      const hw = width / 2;
      const hh = height / 2;
      const rx = e.clientX - left - hw;
      const ry = e.clientY - top - hh;
      mouseX.set(rx * 0.2); // 20% pull ratio
      mouseY.set(ry * 0.2);
    }
    
    // Shine effect
    const { left, top } = buttonRef.current.getBoundingClientRect();
    overflowX.set(e.clientX - left);
    overflowY.set(e.clientY - top);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    overflowX.set(-200); // Send shine away
    overflowY.set(-200);
  };

  // Default to light theme during SSR, will hydrate correctly on client
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  // normalize legacy size values
  const normalizedSize: 'sm' | 'md' | 'lg' | 'icon' =
    size === 'small' ? 'sm' : size === 'medium' ? 'md' : size === 'large' ? 'lg' : (size as 'sm' | 'md' | 'lg' | 'icon');

  // Handle click with loading state
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || props.disabled) return;
    onClick?.(e);
  };

  // Generate accessible label for icon-only buttons (prefer explicit aria-label, fallback to title)
  const ariaFromProps = (props as unknown as { ['aria-label']?: string })['aria-label'];
  const titleFromProps = (props as unknown as { title?: string }).title;
  const accessibleLabel = (!children && (iconBefore || iconAfter)) ? (ariaFromProps ?? titleFromProps) : undefined;

  return (
    <MotionComponent
      ref={buttonRef}
      style={{ x: magnetic ? x : 0, y: magnetic ? y : 0 } as any}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={!isLoading && !props.disabled ? { scale: 1.02 } : {}}
      whileTap={!isLoading && !props.disabled ? { scale: 0.96 } : {}}
      className={cn(
        commonStyles.button,
        // Support both prefixed and non-prefixed variant and size class names
        commonStyles[`variant-${variant}`],
        (commonStyles as any)[variant],
        commonStyles[`size-${normalizedSize}`],
        // legacy, in case any stylesheet references .small/.medium/.large directly
        (commonStyles as any)[size as string],
        mounted ? themeStyles.button : '',
        mounted ? themeStyles[`variant-${variant}`] : '',
        mounted ? (themeStyles as any)[variant] : '',
        mounted ? themeStyles[`size-${normalizedSize}`] : '',
        mounted && provider ? themeStyles[`provider-${provider}`] : '',
        isLoading && commonStyles.loading,
        isLoading && mounted ? themeStyles.loading : '',
        fullWidth && commonStyles.fullWidth,
        className
      )}
      {...(isButton ? { type } : {})}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      aria-label={accessibleLabel}
      aria-busy={isLoading ? 'true' : undefined}
      aria-disabled={props.disabled ? 'true' : undefined}
      {...props}
    >
      <motion.div
        className={commonStyles.interactiveShine}
        style={{ background: shineBackground as any }}
      />
      {isLoading && <Loader2 className={cn(commonStyles.spinner, themeStyles.spinner, commonStyles.loadingIcon)} />}
      {/* Social provider logos — shown when variant=social and not loading */}
      {variant === 'social' && provider && !isLoading && (
        <span className={commonStyles.iconBefore} aria-hidden="true">
          {provider === 'google' && <GoogleLogo />}
          {provider === 'github' && <GitHubLogo />}
        </span>
      )}
      {iconBefore && !isLoading && <span className={commonStyles.iconBefore} aria-hidden="true">{iconBefore}</span>}
      <span className={cn(commonStyles.buttonText, mounted ? themeStyles.buttonText : '', isLoading && commonStyles.loadingText)}>
        {children}
      </span>
      {iconAfter && !isLoading && <span className={commonStyles.iconAfter} aria-hidden="true">{iconAfter}</span>}
    </MotionComponent>
  );
};

export default Button;
