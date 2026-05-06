'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import commonStyles from './Loading.common.module.css';
import lightStyles from './Loading.light.module.css';
import darkStyles from './Loading.dark.module.css';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullscreen?: boolean;
  className?: string;
  'aria-label'?: string;
}

// ── Small/medium inline spinner ───────────────────────────────────────────────
function SimpleSpinner({ size = 'md', themeStyles }: { size: 'sm' | 'md'; themeStyles: Record<string, string> }) {
  const s = size === 'sm' ? 16 : 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(commonStyles.simpleSpinner, themeStyles.simpleSpinner)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2.5" className={cn(commonStyles.spinnerTrack, themeStyles.spinnerTrack)} />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={cn(commonStyles.spinnerArc, themeStyles.spinnerArc)}
      />
    </svg>
  );
}

// ── Full orbital loader (lg / fullscreen) ─────────────────────────────────────
function OrbitalLoader({ text, themeStyles }: { text?: string; themeStyles: Record<string, string> }) {
  return (
    <motion.div
      className={commonStyles.orbitalWrapper}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glow backdrop */}
      <div className={cn(commonStyles.glowBackdrop, themeStyles.glowBackdrop)} />

      {/* Rings */}
      <div className={commonStyles.ringsContainer}>
        {/* Outer ring */}
        <div className={cn(commonStyles.ring, commonStyles.ringOuter, themeStyles.ringOuter)} />
        {/* Middle ring */}
        <div className={cn(commonStyles.ring, commonStyles.ringMid, themeStyles.ringMid)} />
        {/* Inner ring */}
        <div className={cn(commonStyles.ring, commonStyles.ringInner, themeStyles.ringInner)} />

        {/* Orbiting dot on outer ring */}
        <div className={cn(commonStyles.orbitDot, commonStyles.orbitDot1, themeStyles.orbitDot)} />
        <div className={cn(commonStyles.orbitDot, commonStyles.orbitDot2, themeStyles.orbitDot)} />

        {/* Center logo */}
        <div className={cn(commonStyles.centerLogo, themeStyles.centerLogo)}>
          <span className={cn(commonStyles.centerLetter, themeStyles.centerLetter)}>M</span>
        </div>
      </div>

      {/* Text */}
      {text && (
        <motion.p
          className={cn(commonStyles.loadingLabel, themeStyles.loadingLabel)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {text}
        </motion.p>
      )}

      {/* Bouncing dots */}
      <div className={commonStyles.bounceDots} aria-hidden="true">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(commonStyles.bounceDot, themeStyles.bounceDot)}
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullscreen = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const { resolvedTheme } = useTheme();
  const themeStyles = (resolvedTheme === 'dark' ? darkStyles : lightStyles) as Record<string, string>;

  const isOrbital = fullscreen || size === 'lg';

  if (fullscreen) {
    return (
      <AnimatePresence>
        <motion.div
          className={cn(commonStyles.overlay, themeStyles.overlay, className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="status"
          aria-live="polite"
          aria-label={ariaLabel || text || 'Loading'}
        >
          <OrbitalLoader text={text} themeStyles={themeStyles} />
          <span className={commonStyles.srOnly}>{ariaLabel || text || 'Loading...'}</span>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div
      className={cn(
        commonStyles.container,
        themeStyles.container,
        isOrbital ? commonStyles.containerOrbital : commonStyles.containerSimple,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || text || 'Loading'}
    >
      {isOrbital ? (
        <OrbitalLoader text={text} themeStyles={themeStyles} />
      ) : (
        <>
          <SimpleSpinner size={size as 'sm' | 'md'} themeStyles={themeStyles} />
          {text && <p className={cn(commonStyles.inlineText, themeStyles.inlineText)}>{text}</p>}
        </>
      )}
      <span className={commonStyles.srOnly}>{ariaLabel || text || 'Loading...'}</span>
    </div>
  );
};

export default Loading;
