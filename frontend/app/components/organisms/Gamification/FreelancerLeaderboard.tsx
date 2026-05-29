// @AI-HINT: Gamification and Leaderboards component for displaying top freelancers based on metrics like earnings, ratings, and completed projects.
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { gamificationApi } from '@/lib/api';
import commonStyles from './FreelancerLeaderboard.common.module.css';
import lightStyles from './FreelancerLeaderboard.light.module.css';
import darkStyles from './FreelancerLeaderboard.dark.module.css';
import { Trophy, Star, ChevronUp, ChevronDown, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  rank: number;
  score: number;
  projectsCompleted: number;
  rating: number;
  badges: string[];
  trend: 'up' | 'down' | 'same';
}

interface FreelancerLeaderboardProps {
  timeframe?: 'weekly' | 'monthly' | 'all-time';
}

export default function FreelancerLeaderboard({ timeframe = 'monthly' }: FreelancerLeaderboardProps) {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  const [activeTimeframe, setActiveTimeframe] = useState(timeframe);
  const [freelancers, setFreelancers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await gamificationApi.getLeaderboard(10);
        const raw = (data as Record<string, unknown>[]) || [];
        setFreelancers(raw.map((u: Record<string, unknown>, i: number) => ({
          id: String(u.id || i),
          name: (u.name as string) || 'Unknown',
          avatar: ((u.name as string) || 'U').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase(),
          rank: (u.rank as number) || i + 1,
          score: (u.score as number) || (u.points as number) || 0,
          projectsCompleted: (u.projects_completed as number) || 0,
          rating: (u.rating as number) || 0,
          badges: (u.badges as string[]) || [],
          trend: (u.trend as 'up' | 'down' | 'same') || 'same',
        })));
      } catch {
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeTimeframe]);

  if (loading) {
    return (
      <div className={cn(commonStyles.leaderboardContainer, themeStyles.leaderboardContainer)}>
        <div className={commonStyles.header}>
          <div className={commonStyles.headerTitle}>
            <Trophy size={24} className={commonStyles.trophyIcon} />
            <h2>Top Freelancers</h2>
          </div>
        </div>
        <div className={cn(commonStyles.listContainer, commonStyles.loadingState)}>
          <Loader2 size={24} className={commonStyles.loadingSpinner} />
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(commonStyles.leaderboardContainer, themeStyles.leaderboardContainer)}>
        <div className={commonStyles.header}>
          <div className={commonStyles.headerTitle}>
            <Trophy size={24} className={commonStyles.trophyIcon} />
            <h2>Top Freelancers</h2>
          </div>
        </div>
        <div className={cn(commonStyles.listContainer, commonStyles.loadingState)}>
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(commonStyles.leaderboardContainer, themeStyles.leaderboardContainer)}>
      <div className={commonStyles.header}>
        <div className={commonStyles.headerTitle}>
          <Trophy size={24} className={commonStyles.trophyIcon} />
          <h2>Top Freelancers</h2>
        </div>
        <div className={commonStyles.timeframeToggle}>
          <Button 
            variant={activeTimeframe === 'weekly' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button 
            variant={activeTimeframe === 'monthly' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button 
            variant={activeTimeframe === 'all-time' ? 'primary' : 'ghost'} 
            size="sm"
            onClick={() => setActiveTimeframe('all-time')}
          >
            All Time
          </Button>
        </div>
      </div>

      <div className={commonStyles.listContainer}>
        {freelancers.length === 0 ? (
          <div className={cn(commonStyles.loadingState)}>
            <p>No freelancers on the leaderboard yet.</p>
          </div>
        ) : (
          freelancers.map((user) => (
            <div key={user.id} className={cn(commonStyles.userCard, themeStyles.userCard)}>
              <div className={commonStyles.rankBadge}>
                <span className={commonStyles.rankNumber}>#{user.rank}</span>
                {user.trend === 'up' && <ChevronUp size={14} className={commonStyles.trendUp} />}
                {user.trend === 'down' && <ChevronDown size={14} className={commonStyles.trendDown} />}
              </div>
              
              <div className={commonStyles.userInfo}>
                <div className={commonStyles.avatar}>{user.avatar}</div>
                <div className={commonStyles.details}>
                  <h4>{user.name}</h4>
                  <div className={commonStyles.badges}>
                    {user.badges.map(badge => (
                      <span key={badge} className={cn(commonStyles.badge, themeStyles.badge)}>{badge}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={commonStyles.stats}>
                <div className={commonStyles.statItem}>
                  <span className={commonStyles.statLabel}>Score</span>
                  <span className={commonStyles.statValue}>{user.score.toLocaleString()}</span>
                </div>
                <div className={commonStyles.statItem}>
                  <span className={commonStyles.statLabel}>Projects</span>
                  <span className={commonStyles.statValue}>
                    <CheckCircle size={14} className={commonStyles.iconInline} /> {user.projectsCompleted}
                  </span>
                </div>
                <div className={commonStyles.statItem}>
                  <span className={commonStyles.statLabel}>Rating</span>
                  <span className={commonStyles.statValue}>
                    <Star size={14} className={commonStyles.iconInlineStar} /> {user.rating}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
