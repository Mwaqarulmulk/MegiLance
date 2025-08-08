// @AI-HINT: Premium SaaS Dashboard page route for MegiLance platform. This is the Next.js route file that serves the main dashboard interface for three user roles (Admin, Client, Freelancer). Designed for investor-grade UI quality matching Linear, Vercel, GitHub standards.
'use client';

import React, { useEffect, useState } from 'react';
import Dashboard from './dashboard';
import userData from '../../../../db/user.json';
import { User } from './types';

const DashboardPage = () => {
  // TODO: Get user role from authentication context or API
  // For now, defaulting to admin role
  const userRole = 'admin'; // This should come from auth context
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call.
    // For now, we're loading a static JSON file.
    setUser(userData);
  }, []);

  if (!user) {
    // You can return a loader here
    return <div>Loading...</div>;
  }

  return <Dashboard userRole={userRole} user={user} />;
};

export default DashboardPage;
