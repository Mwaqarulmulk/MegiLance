'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Button from '@/app/components/atoms/Button/Button';
import { cn } from '@/lib/utils';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Compass, PlayCircle, Sparkles, UserRound } from 'lucide-react';

import commonStyles from './OnboardingTour.common.module.css';
import lightStyles from './OnboardingTour.light.module.css';
import darkStyles from './OnboardingTour.dark.module.css';

type TourRole = 'client' | 'freelancer';

const TOUR_STEPS = [
  {
    eyebrow: '01 · Choose your lane',
    title: 'A calmer way to start work',
    description: 'MegiLance keeps the first step small: choose whether you are shaping a brief or looking for a clear next opportunity.',
    icon: <Compass size={54} strokeWidth={1.6} />,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
  },
  {
    eyebrow: '02 · See the workflow',
    title: 'From signal to a real workroom',
    description: 'Explore scoping, relevant proposals, conversations, milestones, and review points before you commit to an account.',
    icon: <PlayCircle size={54} strokeWidth={1.6} />,
    colorClass: 'text-amber-500',
    bgClass: 'bg-amber-500/10',
  },
  {
    eyebrow: '03 · Keep the context',
    title: 'Less back-and-forth, better decisions',
    description: 'The product keeps the brief, proposal, deliverables, and milestone history together so both sides know what happens next.',
    icon: <CheckCircle2 size={54} strokeWidth={1.6} />,
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-500/10',
  },
];

export default function OnboardingTour() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<TourRole>('client');
  const [seen, setSeen] = useState(true);

  useEffect(() => {
    setMounted(true);
    setSeen(window.localStorage.getItem('megilance_onboarding_done') === 'true');
    const handleOpenTour = () => {
      setStep(0);
      setIsOpen(true);
    };
    window.addEventListener('open-onboarding-tour', handleOpenTour);
    return () => window.removeEventListener('open-onboarding-tour', handleOpenTour);
  }, []);

  useEffect(() => {
    if (mounted && pathname === '/' && !seen) {
      const timer = window.setTimeout(() => setIsOpen(false), 0);
      return () => window.clearTimeout(timer);
    }
  }, [mounted, pathname, seen]);

  if (!mounted) return null;
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  const isPortal = pathname?.startsWith('/client') || pathname?.startsWith('/freelancer') || pathname?.startsWith('/dashboard');

  const handleClose = () => {
    window.localStorage.setItem('megilance_onboarding_done', 'true');
    setSeen(true);
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < TOUR_STEPS.length - 1) setStep((current) => current + 1);
    else handleClose();
  };

  const demoHref = `/login?demo=${role}`;

  return (
    <>
      <div className={cn(commonStyles.launcher, themeStyles.launcher)}>
        <span className={commonStyles.launcherPulse} aria-hidden="true" />
        <button type="button" onClick={() => { setStep(0); setIsOpen(true); }} className={commonStyles.launcherButton}>
          <Sparkles size={15} aria-hidden="true" />
          <span>{isPortal ? 'Replay product tour' : 'See the product in 90 seconds'}</span>
        </button>
        {!isPortal && (
          <Link href={demoHref} className={commonStyles.demoLink}>
            <PlayCircle size={14} aria-hidden="true" />
            <span>Quick demo</span>
          </Link>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div className={commonStyles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className={cn(commonStyles.modal, themeStyles.modal)}
              initial={{ scale: 0.97, y: 18, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="onboarding-title"
            >
              <div className={cn(commonStyles.imageContainer, themeStyles.imageContainer)}>
                <div className={commonStyles.imageBgPattern} />
                <button onClick={handleClose} className={cn(commonStyles.closeButton, themeStyles.closeButton)} aria-label="Close tour">×</button>
                <AnimatePresence mode="wait">
                  <motion.div key={step} className={cn(commonStyles.iconWrapper, TOUR_STEPS[step].colorClass, TOUR_STEPS[step].bgClass)} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.18 }}>
                    {TOUR_STEPS[step].icon}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className={commonStyles.content}>
                <span className={cn(commonStyles.eyebrow, themeStyles.description)}>{TOUR_STEPS[step].eyebrow}</span>
                <AnimatePresence mode="wait">
                  <motion.div key={`text-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.16 }}>
                    <h2 id="onboarding-title" className={cn(commonStyles.title, themeStyles.title)}>{TOUR_STEPS[step].title}</h2>
                    <p className={cn(commonStyles.description, themeStyles.description)}>{TOUR_STEPS[step].description}</p>
                  </motion.div>
                </AnimatePresence>
                {step === 1 && (
                  <div className={commonStyles.rolePicker} aria-label="Choose a demo role">
                    <button type="button" onClick={() => setRole('client')} className={cn(commonStyles.roleOption, role === 'client' && commonStyles.roleOptionActive)}><BriefcaseBusiness size={15} /> Client view</button>
                    <button type="button" onClick={() => setRole('freelancer')} className={cn(commonStyles.roleOption, role === 'freelancer' && commonStyles.roleOptionActive)}><UserRound size={15} /> Freelancer view</button>
                  </div>
                )}
              </div>

              <div className={cn(commonStyles.footer, themeStyles.footer)}>
                <Button variant="ghost" onClick={handleClose} className={commonStyles.skipBtn}>Not now</Button>
                <div className={commonStyles.dots} aria-label={`Tour step ${step + 1} of ${TOUR_STEPS.length}`}>
                  {TOUR_STEPS.map((item, index) => <button key={item.eyebrow} type="button" onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} className={cn(commonStyles.dot, themeStyles.dot, index === step && [commonStyles.dotActive, themeStyles.dotActive])} />)}
                </div>
                {step === 1 ? <Link href={demoHref} onClick={handleClose} className={cn(commonStyles.demoCta, themeStyles.demoCta)}>Open demo <ArrowRight size={15} /></Link> : <Button variant="primary" onClick={handleNext} className={commonStyles.nextBtn}>{step === TOUR_STEPS.length - 1 ? 'Done' : 'Continue'}</Button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
