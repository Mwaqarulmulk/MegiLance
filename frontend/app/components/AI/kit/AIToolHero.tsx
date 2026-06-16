// @AI-HINT: Premium hero header for AI tool pages — animated badge, gradient title, trust pills. Drop-in replacement for tool <header>.
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedGradientText, ShineBadge } from './AnimatedGradientText';

export interface TrustPill {
  icon: LucideIcon;
  label: string;
}

interface AIToolHeroProps {
  badge?: string;
  title: string;
  /** portion of the title that should receive the animated gradient */
  highlight?: string;
  subtitle?: string;
  icon?: LucideIcon;
  pills?: TrustPill[];
  isDark?: boolean;
  className?: string;
}

export default function AIToolHero({
  badge = 'AI-Powered',
  title,
  highlight,
  subtitle,
  icon: Icon = Sparkles,
  pills = [],
  isDark = true,
  className,
}: AIToolHeroProps) {
  const renderTitle = () => {
    if (!highlight || !title.includes(highlight)) {
      return <AnimatedGradientText>{title}</AnimatedGradientText>;
    }
    const [before, after] = title.split(highlight);
    return (
      <>
        {before}
        <AnimatedGradientText>{highlight}</AnimatedGradientText>
        {after}
      </>
    );
  };

  return (
    <header className={cn('relative z-10 mx-auto max-w-3xl text-center', className)}>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 flex justify-center"
      >
        <ShineBadge className={cn(isDark ? 'text-blue-100' : 'text-blue-700')}>
          <Icon className="h-4 w-4" />
          <span>{badge}</span>
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
        </ShineBadge>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.05 }}
        className={cn(
          'text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl',
          isDark ? 'text-white' : 'text-slate-900',
        )}
      >
        {renderTitle()}
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className={cn(
            'mx-auto mt-4 max-w-2xl text-pretty text-base md:text-lg',
            isDark ? 'text-slate-300' : 'text-slate-600',
          )}
        >
          {subtitle}
        </motion.p>
      )}

      {pills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2.5"
        >
          {pills.map((p) => {
            const PIcon = p.icon;
            return (
              <span
                key={p.label}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md',
                  isDark
                    ? 'border-white/10 bg-white/5 text-slate-200'
                    : 'border-slate-200 bg-white/70 text-slate-700 shadow-sm',
                )}
              >
                <PIcon className={cn('h-3.5 w-3.5', isDark ? 'text-blue-300' : 'text-blue-600')} />
                {p.label}
              </span>
            );
          })}
        </motion.div>
      )}
    </header>
  );
}
