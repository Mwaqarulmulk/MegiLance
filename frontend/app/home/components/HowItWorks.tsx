// @AI-HINT: A section explaining the platform's process for both freelancers and clients, designed for clarity and visual appeal.
'use client';

import React from 'react';
import Image from 'next/image';
import { Search, ClipboardList, Users, FileSignature } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

import StepCard from './StepCard';
import type { StepCardProps } from './StepCard';
import { LottieAnimation, workflowAnimation } from '@/app/components/Animations/LottieAnimation';
import SectionGlobe from '@/app/components/Animations/SectionGlobe/SectionGlobe';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './HowItWorks.common.module.css';
import lightStyles from './HowItWorks.light.module.css';
import darkStyles from './HowItWorks.dark.module.css';

const steps: Array<Omit<StepCardProps, 'stepNumber' | 'type'>> = [
  {
    icon: <ClipboardList />,
    title: '1. Post a Project',
    description: 'Describe your project, set your budget, and let our AI suggest the perfect scope and milestones. Get matched with vetted freelancers instantly.',
  },
  {
    icon: <Search />,
    title: '2. AI-Matched Talent',
    description: 'Our 7-factor algorithm matches you with freelancers based on skills, experience, ratings, and communication. Review proposals with objective ranking scores.',
  },
  {
    icon: <Users />,
    title: '3. Hire & Collaborate',
    description: 'Hire with confidence using milestone-based escrow. Collaborate in real-time workrooms with file sharing, messaging, and progress tracking.',
  },
  {
    icon: <FileSignature />,
    title: '4. Approve & Get Paid',
    description: 'Review deliverables, request revisions if needed, and approve milestones. Payment is released instantly to the freelancer upon approval.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
      transition: { type: 'spring' as const, stiffness: 200, damping: 20 }
  },
};

const HowItWorks: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.howItWorks, themeStyles.howItWorks)}>
      <SectionGlobe variant="blue" size="lg" position="left" />
      <motion.div 
        className={cn(commonStyles.container)}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div variants={itemVariants} className={cn(commonStyles.header)}>
          <span className={cn(commonStyles.tagline, themeStyles.tagline)}>The Process</span>
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }} 
            transition={{ type: "spring" as const, stiffness: 300, damping: 15 }}
          >
            <LottieAnimation
              animationData={workflowAnimation}
              width={120}
              height={120}
              ariaLabel="Workflow process illustration"
              className="mx-auto mb-2"
            />
          </motion.div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>How MegiLance Works</h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            A streamlined process powered by AI — from project posting to secure payment, every step is optimized for quality and trust.
          </p>
        </motion.div>
        
        {/* Process visual: vertical stack showing Project Brief → AI Match → Escrow → Payment */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/sections/how-it-works-home.png"
              alt="How MegiLance works: Project Brief → AI Matching → Smart Contract Escrow → Milestone Payment"
              width={260}
              height={520}
              sizes="(max-width: 768px) 200px, 260px"
              style={{ width: '100%', maxWidth: '260px', height: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <motion.div variants={itemVariants} className={cn(commonStyles.timeline)}>
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
                >
                  <StepCard
                    stepNumber={index + 1}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    type={index % 2 === 0 ? 'client' : 'freelancer'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorks;

