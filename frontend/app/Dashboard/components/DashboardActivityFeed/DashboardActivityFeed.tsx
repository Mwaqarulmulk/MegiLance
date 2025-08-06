// @AI-HINT: This component displays a feed of recent user and system activities. It's designed to be clear, scannable, and informative, enhancing user engagement and providing transparency, which are hallmarks of a premium SaaS experience.

'use client';

import React, { useState, useEffect } from 'react';
import { ActivityFeedItem } from '../../types';
import { FaCreditCard, FaClipboardCheck, FaRocket, FaUserClock } from 'react-icons/fa';
import commonStyles from './DashboardActivityFeed.common.module.css';
import lightStyles from './DashboardActivityFeed.light.module.css';
import darkStyles from './DashboardActivityFeed.dark.module.css';

// Map string names from API to actual React icon components
const iconMap: { [key: string]: React.ElementType } = {
  FaCreditCard,
  FaClipboardCheck,
  FaRocket,
  FaUserClock,
};

// @AI-HINT: This component displays a feed of recent user and system activities. It's designed to be clear, scannable, and informative, enhancing user engagement and providing transparency, which are hallmarks of a premium SaaS experience. Now fully theme-switchable.


const DashboardActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setActivities(data.activityFeed || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="DashboardSection-loading">Loading activities...</div>;
  }

  if (error) {
    return <div className="DashboardSection-error">Error: {error}</div>;
  }

  return (
    <div className="DashboardSection">
      <div className="DashboardSection-header">
        <h2>Activity Feed</h2>
        <a href="/activity" className="DashboardSection-view-all">View All</a>
      </div>
      <div className="DashboardActivityFeed-list">
        {activities.map((activity) => {
          const IconComponent = iconMap[activity.icon];
          return (
            <div key={activity.id} className="ActivityItem">
              <div className="ActivityItem-icon">
                {IconComponent && <IconComponent className="ActivityItem-icon-svg" size={20} />}
              </div>
              <div className="ActivityItem-content">
                <p className="ActivityItem-message">{activity.message}</p>
                <span className="ActivityItem-time">{activity.time}</span>
              </div>
              {activity.amount && (
                <div className="ActivityItem-amount">
                  {activity.amount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardActivityFeed;
