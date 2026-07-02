'use client';

import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Cpu, ShieldCheck, Lock, Calculator, Briefcase, Users } from 'lucide-react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

import FeatureCard from './FeatureCard';
import { LottieAnimation, aiSparkleAnimation } from '../../components/Animations/LottieAnimation';
import SectionGlobe from '../../components/Animations/SectionGlobe/SectionGlobe';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import commonStyles from './Features.common.module.css';
import lightStyles from './Features.light.module.css';
import darkStyles from './Features.dark.module.css';

const featuresData = [
  {
    icon: <Calculator />,
    title: 'AI Price Estimator',
    description: 'Suggests project budgets, complexity ratings, and automated milestone structures using market-aware ML analysis.',
  },
  {
    icon: <Cpu />,
    title: 'Talent Matching Score',
    description: 'Scores proposals based on verified developer experience, skill overlap, availability, and client ratings.',
  },
  {
    icon: <ShieldCheck />,
    title: 'Fraud Risk Check',
    description: 'Identifies suspicious keywords, budget anomalies, and payment verification red flags in real-time.',
  },
  {
    icon: <Lock />,
    title: 'Smart Contract Escrow',
    description: 'Milestone payments are locked securely in smart-contract escrow, releasing only upon client approval of deliverables.',
  },
  {
    icon: <Briefcase />,
    title: 'Client Dashboard',
    description: 'Post projects, browse AI-ranked proposals, manage active milestones, track budgets, and message freelancers.',
  },
  {
    icon: <Users />,
    title: 'Freelancer Dashboard',
    description: 'Manage profiles, submit proposals, track earnings, generate smart invoices, and deliver milestones.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

import { Variants } from 'framer-motion';
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  },
};

const Features: React.FC = () => {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 0.5], [50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section className={cn(commonStyles.featuresSection, themeStyles.featuresSection)} ref={sectionRef}>
      <SectionGlobe variant="blue" size="sm" position="right" />
      <div className={cn(commonStyles.container)}>
        <motion.div 
          className={cn(commonStyles.header)}
          style={{ y: headerY, opacity }}
        >
          <motion.span 
            className={cn(commonStyles.tagline, themeStyles.tagline)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Proof of Concept
          </motion.span>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring' as const, stiffness: 200, damping: 20, delay: 0.2 }}
          >
            <LottieAnimation
              animationData={aiSparkleAnimation}
              width={110}
              height={110}
              ariaLabel="AI-powered features illustration"
              className="mx-auto mb-2"
            />
          </motion.div>
          <motion.h2 
            className={cn(commonStyles.title, themeStyles.title)}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            What MegiLance Actually Includes
          </motion.h2>
          <motion.p 
            className={cn(commonStyles.subtitle, themeStyles.subtitle)}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Our full-stack implementation includes all the core features needed for a fully functional freelance marketplace.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className={cn(commonStyles.grid)}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {featuresData.map((feature, i) => (
            <motion.div 
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: 'spring' as const, stiffness: 300 }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;

