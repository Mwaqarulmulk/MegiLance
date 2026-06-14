'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UserPlus, Zap, Lock } from 'lucide-react';
import { useGuestUsage } from '@/app/hooks/useGuestUsage';
import commonStyles from './GuestBanner.common.module.css';
import lightStyles from './GuestBanner.light.module.css';
import darkStyles from './GuestBanner.dark.module.css';

interface GuestBannerProps {
  toolName?: string;
  variant?: 'inline' | 'banner' | 'toast';
  className?: string;
}

export default function GuestBanner({ toolName, variant = 'banner', className }: GuestBannerProps) {
  const { resolvedTheme } = useTheme();
  const ts = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const { isAuthenticated, remaining, isLimitReached, dailyLimit } = useGuestUsage();

  if (isAuthenticated) return null;

  if (variant === 'toast' && !isLimitReached) {
    return (
      <motion.div
        className={cn(commonStyles.toast, ts.toast, className)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <Zap size={14} />
        <span>
          Free tier: <strong>{remaining}</strong> of {dailyLimit} uses remaining today
        </span>
        <Link href="/signup" className={cn(commonStyles.toastLink, ts.toastLink)}>
          Get Unlimited <ArrowRight size={12} />
        </Link>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn(commonStyles.inline, ts.inline, className)}>
        <div className={commonStyles.inlineContent}>
          <Sparkles size={16} />
          <span>
            {isLimitReached
              ? `Daily limit reached. Sign up for unlimited ${toolName || 'AI tool'} access.`
              : `Free tier: ${remaining} uses left today. Sign up for unlimited access.`
            }
          </span>
        </div>
        <Link
          href="/signup"
          className={cn(commonStyles.inlineBtn, ts.inlineBtn)}
        >
          <UserPlus size={14} />
          <span>Sign Up Free</span>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(commonStyles.banner, ts.banner, isLimitReached && commonStyles.bannerWarning, isLimitReached && ts.bannerWarning, className)}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={commonStyles.bannerGlow} />
      <div className={commonStyles.bannerContent}>
        <div className={commonStyles.bannerIcon}>
          {isLimitReached ? <Lock size={24} /> : <Sparkles size={24} />}
        </div>
        <div className={commonStyles.bannerText}>
          <h3 className={cn(commonStyles.bannerTitle, ts.bannerTitle)}>
            {isLimitReached
              ? 'Daily Limit Reached'
              : `Try ${toolName || 'This AI Tool'} — It's Free`
            }
          </h3>
          <p className={cn(commonStyles.bannerDesc, ts.bannerDesc)}>
            {isLimitReached
              ? 'Sign up for a free account to get unlimited access to all AI tools.'
              : `You have ${remaining} of ${dailyLimit} free uses today. Sign up for unlimited access, saved history, and more.`
            }
          </p>
        </div>
        <div className={commonStyles.bannerActions}>
          <Link
            href="/signup"
            className={cn(commonStyles.bannerBtn, ts.bannerBtn)}
          >
            <UserPlus size={16} />
            <span>Sign Up Free</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/login"
            className={cn(commonStyles.bannerBtnSecondary, ts.bannerBtnSecondary)}
          >
            Log In
          </Link>
        </div>
      </div>
      {!isLimitReached && (
        <div className={cn(commonStyles.bannerProgress, ts.bannerProgress)}>
          <div
            className={cn(commonStyles.bannerProgressBar, ts.bannerProgressBar)}
            style={{ width: `${((dailyLimit - remaining) / dailyLimit) * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}
