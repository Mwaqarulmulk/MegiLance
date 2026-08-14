'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { Sparkles, Users, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import commonStyles from './GoalSelector.common.module.css';
import lightStyles from './GoalSelector.light.module.css';
import darkStyles from './GoalSelector.dark.module.css';

const goals = [
  {
    id: 'ai-tools',
    title: 'Use Free AI Tools',
    badge: '100% Free · No Sign-Up',
    description: 'Price freelance projects, write proposals, calculate hourly rates, and plan project scopes in seconds.',
    icon: Sparkles,
    bullets: ['AI Price Estimator', 'AI Proposal Writer', 'Freelance Rate Advisor', 'Milestone Scope Planner'],
    ctaText: 'Explore Free AI Tools',
    ctaHref: '#ai-tools',
    highlightColor: 'from-blue-600 to-cyan-500',
  },
  {
    id: 'hire-talent',
    title: 'Hire Freelancers',
    badge: 'Milestone Escrow Protection',
    description: 'Post your project or browse vetted independent talent across engineering, UI/UX design, AI, and marketing.',
    icon: Briefcase,
    bullets: ['7-Factor Skill Matching', 'Milestone Escrow Payments', '0% Client Platform Fee', 'Direct Workroom Chat'],
    ctaText: 'Hire Top Talent',
    ctaHref: '/talent',
    highlightColor: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'find-work',
    title: 'Find Freelance Work',
    badge: 'Keep 100% of Earnings',
    description: 'Discover remote freelance opportunities, generate winning proposals with AI, and get paid on milestone approval.',
    icon: Users,
    bullets: ['Browse Active Projects', 'AI-Generated Proposals', 'Secure Escrow Guarantees', 'Transparent Fast Payouts'],
    ctaText: 'Find Freelance Jobs',
    ctaHref: '/explore',
    highlightColor: 'from-purple-600 to-indigo-500',
  },
];

export default function GoalSelector() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>Choose Your Path</span>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>What do you want to accomplish today?</h2>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Whether you need instant AI planning tools, talent for your next build, or freelance opportunities, MegiLance has you covered.
        </p>
      </div>

      <div className={commonStyles.grid}>
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <div key={goal.id} className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.cardHeader}>
                <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                  <Icon size={24} />
                </div>
                <span className={cn(commonStyles.pill, themeStyles.pill)}>{goal.badge}</span>
              </div>

              <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>{goal.title}</h3>
              <p className={cn(commonStyles.cardDesc, themeStyles.cardDesc)}>{goal.description}</p>

              <ul className={commonStyles.bulletList}>
                {goal.bullets.map((bullet, idx) => (
                  <li key={idx} className={cn(commonStyles.bulletItem, themeStyles.bulletItem)}>
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className={commonStyles.cardFooter}>
                <Link href={goal.ctaHref} className={cn(commonStyles.ctaButton, themeStyles.ctaButton)}>
                  <span>{goal.ctaText}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
