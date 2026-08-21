// @AI-HINT: Modern 4-step process timeline for clients and freelancers.
'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ClipboardList, Users, FileSignature, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './HowItWorks.common.module.css';
import lightStyles from './HowItWorks.light.module.css';
import darkStyles from './HowItWorks.dark.module.css';

const steps = [
  {
    stepNumber: '01',
    icon: ClipboardList,
    title: 'Scope or Post a Project',
    description: 'Use free AI tools to price your project and generate milestone scopes, or post your brief directly to the marketplace.',
    badge: 'Step 1',
    roleTag: 'Client & Specialist',
  },
  {
    stepNumber: '02',
    icon: Search,
    title: '7-Factor Skill Matching',
    description: 'Our objective matching algorithm ranks specialists based on verified skills, delivery velocity, ratings, and availability.',
    badge: 'Step 2',
    roleTag: 'Meritocratic AI',
  },
  {
    stepNumber: '03',
    icon: Users,
    title: 'Collaborate in Live Workrooms',
    description: 'Milestone funds are pre-funded safely in escrow. Collaborate via direct chat, shared file attachments, and sprint checkpoints.',
    badge: 'Step 3',
    roleTag: '100% Escrow Vault',
  },
  {
    stepNumber: '04',
    icon: FileSignature,
    title: 'Verify & Release Payment',
    description: 'Review completed deliverables, inspect source code or design files, and release milestone funds instantly upon satisfaction.',
    badge: 'Step 4',
    roleTag: 'Instant Multi-Currency',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
};

const HowItWorks: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.howItWorks, themeStyles.howItWorks)} aria-label="How MegiLance Works">
      <motion.div 
        className={commonStyles.container}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className={commonStyles.header}>
          <div className={cn(commonStyles.tagline, themeStyles.tagline)}>
            <Sparkles size={13} className="text-amber-500" />
            <span>Frictionless 4-Stage Operating Pipeline</span>
          </div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>How MegiLance Works</h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            From initial project scoping to milestone escrow approval — every step is engineered for trust, quality, and fair collaboration.
          </p>
        </motion.div>
        
        {/* Horizontal 4-Card Timeline Grid */}
        <motion.div variants={containerVariants} className={commonStyles.timelineGrid}>
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.stepNumber}
                variants={itemVariants}
                className={cn(commonStyles.stepCard, themeStyles.stepCard)}
              >
                <div className={commonStyles.stepTop}>
                  <span className={cn(commonStyles.stepNum, themeStyles.stepNum)}>{step.stepNumber}</span>
                  <span className={cn(commonStyles.rolePill, themeStyles.rolePill)}>{step.roleTag}</span>
                </div>

                <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                  <Icon size={22} />
                </div>

                <h3 className={cn(commonStyles.stepTitle, themeStyles.stepTitle)}>{step.title}</h3>
                <p className={cn(commonStyles.stepDesc, themeStyles.stepDesc)}>{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Strip */}
        <motion.div variants={itemVariants} className={commonStyles.bottomCta}>
          <Link href="/create-project" className={cn(commonStyles.ctaPrimary, themeStyles.ctaPrimary)}>
            <span>Post a Project Free</span>
            <ArrowRight size={15} />
          </Link>
          <Link href="/how-it-works" className={cn(commonStyles.ctaSecondary, themeStyles.ctaSecondary)}>
            <span>Explore Complete Process Guide</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;
