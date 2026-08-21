// @AI-HINT: High-converting 1-Click Hiring Bridge component connecting all 11 AI Productivity Tools to Instant Matching & Project Creation
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import {
  buildPendingProjectPayload,
  launchInstantMatch,
  launchProjectCreation,
  PendingProjectPayload,
} from '@/app/lib/bridges/pendingProjectBridge';
import InstantMatchingWizard from '@/app/components/AI/InstantMatchingWizard/InstantMatchingWizard';
import styles from './LeadMagnetHireBridge.module.css';

import {
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  FileText,
  CheckCircle2,
  X,
  Lock,
  ChevronRight,
} from 'lucide-react';

export interface LeadMagnetHireBridgeProps {
  toolName: string;
  result: any;
  formState?: Record<string, any>;
  customTitle?: string;
  customDescription?: string;
  customBudgetMin?: number;
  customBudgetMax?: number;
  customBudgetType?: 'fixed' | 'hourly';
  customSkills?: string[];
  customCategory?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  showSecondaryAction?: boolean;
  className?: string;
  variant?: 'banner' | 'card' | 'inline' | 'compact';
  onOpenInstantMatchModal?: () => void;
  onProjectCreated?: (payload: PendingProjectPayload) => void;
}

export default function LeadMagnetHireBridge({
  toolName,
  result,
  formState,
  customTitle,
  customDescription,
  customBudgetMin,
  customBudgetMax,
  customBudgetType,
  customSkills,
  customCategory,
  buttonText = 'Hire Top Specialist for This Scope (1-Click)',
  secondaryButtonText = 'Create Detailed Project Brief',
  showSecondaryAction = true,
  className,
  variant = 'banner',
  onOpenInstantMatchModal,
  onProjectCreated,
}: LeadMagnetHireBridgeProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize the normalized pending project payload from the tool's result
  const payload = useMemo<PendingProjectPayload>(() => {
    return buildPendingProjectPayload(toolName, result, {
      customTitle,
      customDescription,
      customCategory,
      customSkills,
      customBudgetMin,
      customBudgetMax,
      customBudgetType,
      formState,
    });
  }, [
    toolName,
    result,
    formState,
    customTitle,
    customDescription,
    customCategory,
    customSkills,
    customBudgetMin,
    customBudgetMax,
    customBudgetType,
  ]);

  const handleInstantMatch = () => {
    if (onOpenInstantMatchModal) {
      onOpenInstantMatchModal();
      return;
    }
    // Launch on-page interactive modal with pre-filled brief
    setIsModalOpen(true);
    launchInstantMatch(payload);
    if (onProjectCreated) {
      onProjectCreated(payload);
    }
  };

  const handleCreateProject = () => {
    launchProjectCreation(payload, router);
    if (onProjectCreated) {
      onProjectCreated(payload);
    }
  };

  const budgetDisplay = useMemo(() => {
    if (payload.budgetType === 'hourly') {
      return `$${payload.budgetMin}-$${payload.budgetMax}/hr`;
    }
    return `$${Number(payload.budgetMin).toLocaleString()} – $${Number(payload.budgetMax).toLocaleString()}`;
  }, [payload.budgetMin, payload.budgetMax, payload.budgetType]);

  return (
    <>
      <div
        className={cn(
          styles.container,
          isDark ? styles.bannerDark : styles.bannerLight,
          className
        )}
      >
        {/* Top Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.iconWrapper}>
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className={styles.heading}>
                Ready to execute this scope with verified talent?
              </h3>
              <p className={styles.subheading}>
                Match with top 1% pre-vetted specialists in 60 seconds with 100% escrow protection.
              </p>
            </div>
          </div>

          <div
            className={cn(
              styles.summaryPill,
              isDark && styles.summaryPillDark
            )}
          >
            <span>Target Budget:</span>
            <strong>{budgetDisplay}</strong>
          </div>
        </div>

        {/* 1-Click Action Buttons */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleInstantMatch}
          >
            <Zap size={18} />
            <span>{buttonText}</span>
            <ArrowRight size={16} />
          </button>

          {showSecondaryAction && (
            <button
              type="button"
              className={cn(
                styles.secondaryBtn,
                isDark && styles.secondaryBtnDark
              )}
              onClick={handleCreateProject}
            >
              <FileText size={16} />
              <span>{secondaryButtonText}</span>
            </button>
          )}
        </div>

        {/* Trust Reversal Badges */}
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <div className={cn(styles.trustIcon, isDark && styles.trustIconDark)}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className={styles.trustLabel}>100% Escrow Protection</span>
              <span className={styles.trustSubtext}>Funds released only on milestone sign-off</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={cn(styles.trustIcon, isDark && styles.trustIconDark)}>
              <Zap size={16} />
            </div>
            <div>
              <span className={styles.trustLabel}>0% Client Platform Fee</span>
              <span className={styles.trustSubtext}>Zero commission or hidden client fees</span>
            </div>
          </div>

          <div className={styles.trustItem}>
            <div className={cn(styles.trustIcon, isDark && styles.trustIconDark)}>
              <Award size={16} />
            </div>
            <div>
              <span className={styles.trustLabel}>Top 1% Verified Specialists</span>
              <span className={styles.trustSubtext}>Pre-assessed skills, ratings & ID verification</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-Page Instant Matching Wizard Modal */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            className={cn(
              styles.modalContent,
              isDark && styles.modalContentDark
            )}
          >
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Close instant matching wizard"
            >
              <X size={18} />
            </button>

            <InstantMatchingWizard
              initialPrompt={payload.description || payload.title}
              initialCategory={payload.category}
              initialBudgetHint={Number(payload.budgetMax) || undefined}
              compact
              onCancel={() => setIsModalOpen(false)}
              onComplete={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
