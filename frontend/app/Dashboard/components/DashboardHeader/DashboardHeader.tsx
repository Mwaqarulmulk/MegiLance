// @AI-HINT: This component renders the header for the main dashboard. It's designed to be a reusable and focused component, following premium SaaS development practices by separating concerns. It includes the welcome title, subtitle, and primary actions like notifications.

'use client';

import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';

import commonStyles from './DashboardHeader.common.module.css';
import lightStyles from './DashboardHeader.light.module.css';
import darkStyles from './DashboardHeader.dark.module.css';

interface User {
  fullName: string;
  email: string;
  bio: string;
  avatar: string;
  notificationCount: number;
}

interface DashboardHeaderProps {
  userRole: 'admin' | 'client' | 'freelancer';
  user: User;
}

const getWelcomeMessage = (role: string) => {
  switch (role) {
    case 'admin':
      return 'Oversee and manage the platform.';
    case 'client':
      return 'Manage your projects and hiring.';
    case 'freelancer':
    default:
      return 'Here is your project and task overview.';
  }
};

// @AI-HINT: This component renders the header for the main dashboard. It's designed to be a reusable and focused component, following premium SaaS development practices by separating concerns. It includes the welcome title, subtitle, and primary actions like notifications. Now fully theme-switchable.


const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userRole, user }) => {
  return (
    <div className={commonStyles.DashboardHeader}>
      <div className={commonStyles.welcome}>
        <h1 className={commonStyles.title}>Welcome back, {user.fullName}!</h1>
        <p className={commonStyles.subtitle}>{getWelcomeMessage(userRole)}</p>
      </div>
      <div className={commonStyles.actions}>
        <button className={commonStyles.notificationBtn} aria-label={`View ${user.notificationCount} notifications`}>
          <FaBell className={commonStyles.notificationIcon} />
          {user && user.notificationCount > 0 && (
            <span className={commonStyles.notificationBadge}>{user.notificationCount}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
