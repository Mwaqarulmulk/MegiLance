// @AI-HINT: Global impact section highlighting Pakistani talent and worldwide reach

'use client';

import React from 'react';
import { FaGlobe, FaFlag, FaUsers, FaChartLine, FaHeart, FaStar } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './GlobalImpact.common.module.css';
import lightStyles from './GlobalImpact.light.module.css';
import darkStyles from './GlobalImpact.dark.module.css';

const GlobalImpact: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const impactStats = [
    {
      icon: FaUsers,
      number: "50,000+",
      label: "Pakistani Freelancers Empowered",
      description: "Breaking barriers and accessing global opportunities"
    },
    {
      icon: FaGlobe,
      number: "45+",
      label: "Countries Served",
      description: "Connecting talent across continents"
    },
    {
      icon: FaChartLine,
      number: "$269.8M",
      label: "Foreign Exchange Earned",
      description: "Contributing to Pakistan's digital economy"
    },
    {
      icon: FaStar,
      number: "4.9/5",
      label: "Average Project Rating",
      description: "Quality work that exceeds expectations"
    }
  ];

  const successStories = [
    {
      name: "Ayesha Khan",
      role: "UI/UX Designer",
      city: "Karachi",
      achievement: "Earned $50K+ in first year",
      quote: "MegiLance opened doors to international clients I never thought possible."
    },
    {
      name: "Muhammad Ali",
      role: "Full-Stack Developer",
      city: "Lahore",
      achievement: "Built 200+ projects",
      quote: "The AI matching system finds me perfect projects every time."
    },
    {
      name: "Fatima Ahmed",
      role: "Content Writer",
      city: "Islamabad",
      achievement: "Top 1% performer",
      quote: "Instant USDC payments changed my life. No more banking delays."
    }
  ];

  return (
    <section className={cn(commonStyles.globalImpact, themeStyles.globalImpact)}>
      <div className={commonStyles.globalImpactContainer}>
        <div className={commonStyles.globalImpactHeader}>
          <div className={cn(commonStyles.badge, themeStyles.badge)}>
            <FaFlag className={cn(commonStyles.badgeIcon, themeStyles.badgeIcon)} />
            <span>Proudly Pakistani • Globally Connected</span>
          </div>
          <h2 className={cn(commonStyles.title, themeStyles.title)}>
            Empowering <span className={cn(commonStyles.titleHighlight, themeStyles.titleHighlight)}>Pakistani Talent</span> Worldwide
          </h2>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            MegiLance is more than a platform—it's a movement. We're breaking down barriers, 
            eliminating payment friction, and connecting Pakistan's incredible talent with 
            global opportunities. Join thousands who are already transforming their careers.
          </p>
        </div>

        <div className={cn(commonStyles.stats, themeStyles.stats)}>
          {impactStats.map((stat, index) => (
            <div key={index} className={cn(commonStyles.stat, themeStyles.stat)}>
              <div className={cn(commonStyles.statIcon, themeStyles.statIcon)}>
                <stat.icon />
              </div>
              <div className={commonStyles.statContent}>
                <div className={cn(commonStyles.statNumber, themeStyles.statNumber)}>{stat.number}</div>
                <div className={cn(commonStyles.statLabel, themeStyles.statLabel)}>{stat.label}</div>
                <div className={cn(commonStyles.statDescription, themeStyles.statDescription)}>{stat.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={cn(commonStyles.mission, themeStyles.mission)}>
          <div className={commonStyles.missionContent}>
            <h3 className={cn(commonStyles.missionTitle, themeStyles.missionTitle)}>Our Mission</h3>
            <p className={cn(commonStyles.missionText, themeStyles.missionText)}>
              To revolutionize freelance work in Pakistan and beyond using AI for automation 
              and stable crypto for secure, accessible payments. We believe every talented 
              individual deserves access to global opportunities, regardless of their location 
              or banking infrastructure.
            </p>
            <div className={commonStyles.missionFeatures}>
              <div className={cn(commonStyles.missionFeature, themeStyles.missionFeature)}>
                <FaHeart className={cn(commonStyles.missionFeatureIcon, themeStyles.missionFeatureIcon)} />
                <span>Built with Pakistani freelancers in mind</span>
              </div>
              <div className={cn(commonStyles.missionFeature, themeStyles.missionFeature)}>
                <FaGlobe className={cn(commonStyles.missionFeatureIcon, themeStyles.missionFeatureIcon)} />
                <span>Designed for global success</span>
              </div>
            </div>
          </div>
          
          <div className={cn(commonStyles.worldMap, themeStyles.worldMap)}>
            <div className={commonStyles.mapContainer}>
              <div className={cn(commonStyles.mapDot, commonStyles.mapDotPakistan)}>
                <div className={commonStyles.mapPulse}></div>
                <span className={commonStyles.mapLabel}>Pakistan</span>
              </div>
              <div className={cn(commonStyles.mapDot, commonStyles.mapDotUsa)}>
                <div className={commonStyles.mapPulse}></div>
                <span className={commonStyles.mapLabel}>USA</span>
              </div>
              <div className={cn(commonStyles.mapDot, commonStyles.mapDotUk)}>
                <div className={commonStyles.mapPulse}></div>
                <span className={commonStyles.mapLabel}>UK</span>
              </div>
              <div className={cn(commonStyles.mapDot, commonStyles.mapDotAustralia)}>
                <div className={commonStyles.mapPulse}></div>
                <span className={commonStyles.mapLabel}>Australia</span>
              </div>
            </div>
          </div>
        </div>

        <div className={commonStyles.successStories}>
          <h3 className={cn(commonStyles.storiesTitle, themeStyles.storiesTitle)}>Success Stories from Pakistan</h3>
          <div className={cn(commonStyles.storiesGrid, themeStyles.storiesGrid)}>
            {successStories.map((story, index) => (
              <div key={index} className={cn(commonStyles.story, themeStyles.story)}>
                <div className={commonStyles.storyHeader}>
                  <div className={cn(commonStyles.storyAvatar, themeStyles.storyAvatar)}>
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={commonStyles.storyInfo}>
                    <div className={cn(commonStyles.storyName, themeStyles.storyName)}>{story.name}</div>
                    <div className={cn(commonStyles.storyRole, themeStyles.storyRole)}>{story.role}</div>
                    <div className={cn(commonStyles.storyLocation, themeStyles.storyLocation)}>{story.city}, Pakistan</div>
                  </div>
                </div>
                <div className={cn(commonStyles.storyAchievement, themeStyles.storyAchievement)}>{story.achievement}</div>
                <blockquote className={cn(commonStyles.storyQuote, themeStyles.storyQuote)}>"{story.quote}"</blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalImpact;
