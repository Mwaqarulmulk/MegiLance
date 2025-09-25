// @AI-HINT: This is the main component for the Global Impact section, showcasing MegiLance's worldwide reach and empowering Pakistani talent.

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Flag, Users, Globe, LineChart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

import ImpactStatCard from './ImpactStatCard';
import SuccessStoryCard from './SuccessStoryCard';
import commonStyles from './GlobalImpact.common.module.css';
import lightStyles from './GlobalImpact.light.module.css';
import darkStyles from './GlobalImpact.dark.module.css';

// --- Dynamic Import for Globe (client-side only) ---
const ImpactGlobe = dynamic(() => import('./ImpactGlobe'), {
  ssr: false,
  loading: () => <div className={commonStyles.globePlaceholder} />
});

// --- Data Definitions ---
const impactStats = [
  { icon: Users, number: "50,000+", label: "Pakistani Freelancers", description: "Breaking barriers and accessing global opportunities." },
  { icon: Globe, number: "45+", label: "Countries Served", description: "Connecting Pakistan's top talent across continents." },
  { icon: LineChart, number: "$270M+", label: "Foreign Exchange Earned", description: "Contributing to Pakistan's growing digital economy." },
  { icon: Star, number: "4.9/5", label: "Average Project Rating", description: "A testament to the quality and dedication of our talent." }
];

const successStories = [
  {
    name: "Ayesha Khan",
    role: "Lead UI/UX Designer",
    city: "Karachi",
    achievement: "Earned $50K+ in First Year",
    quote: "MegiLance's AI matching connected me with high-value international clients I only dreamed of. The stablecoin payments are a game-changer.",
    avatar: "https://i.pravatar.cc/150?img=47"
  },
  {
    name: "Muhammad Ali",
    role: "Senior Full-Stack Engineer",
    city: "Lahore",
    achievement: "Scaled a startup's MVP to 1M users",
    quote: "This platform handles all the overhead. I just focus on what I do best: writing clean, scalable code. It's freelancing, perfected.",
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "Fatima Ahmed",
    role: "Expert Content Strategist",
    city: "Islamabad",
    achievement: "Top 1% Global Performer",
    quote: "The analytics are incredible. I've tripled my rates by understanding market demand and showcasing my value more effectively.",
    avatar: "https://i.pravatar.cc/150?img=65"
  }
];

// --- Main Component ---
const GlobalImpact: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <section className={cn(commonStyles.globalImpact, themeStyles.globalImpact)}>
      <div className={commonStyles.container}>
        
        {/* --- Header --- */}
        <div className={commonStyles.header}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <Flag size={14} />
            <span>Proudly Pakistani, Globally Connected</span>
          </div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Where <span className={cn(commonStyles.highlight, themeStyles.highlight)}>Pakistani Talent</span> Meets Global Opportunity
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            We are on a mission to dissolve economic borders, empowering the next generation of Pakistani freelancers with AI-driven tools and frictionless cross-border payments.
          </p>
        </div>

        {/* --- Main Content Grid --- */}
        <div className={commonStyles.mainGrid}>
          <div className={commonStyles.globeSection}>
            <ImpactGlobe />
          </div>
          <div className={commonStyles.statsGrid}>
            {impactStats.map((stat) => (
              <ImpactStatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </div>

        {/* --- Success Stories Section --- */}
        <div className={commonStyles.storiesSection}>
          <h3 className={cn(commonStyles.storiesTitle, themeStyles.storiesTitle)}>Success Stories from Our Community</h3>
          <div className={commonStyles.storiesGrid}>
            {successStories.map((story) => (
              <SuccessStoryCard key={story.name} story={story} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default GlobalImpact;