// @AI-HINT: Premium SaaS Dashboard page route for MegiLance platform. This is the Next.js route file that serves the main dashboard interface for three user roles (Admin, Client, Freelancer). Designed for investor-grade UI quality matching Linear, Vercel, GitHub standards.
'use client';

import React, { useEffect, useState } from 'react';
import Dashboard from './dashboard';
import userData from '../../../db/user.json';
import { User } from './types';

const DashboardPage = () => {
  // TODO: Get user role from authentication context or API
  // Initialize with null; we'll deduce from selected user
  const [userRole, setUserRole] = useState<'admin' | 'client' | 'freelancer'>('admin');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call.
    // For now, load the static JSON (array) and map to the Dashboard User type
    type RawUser = {
      id: string;
      name: string;
      role: 'admin' | 'client' | 'freelancer';
      email: string;
      avatar: string;
      status: string;
      projects: number;
      balance: number;
    };

    const rawUsers = userData as unknown as RawUser[];
    const preferred = rawUsers.find(u => u.role === 'admin') ?? rawUsers[0];
    if (preferred) {
      const mapped: User = {
        fullName: preferred.name,
        email: preferred.email,
        bio: '',
        avatar: preferred.avatar,
        notificationCount: 3,
      };
      setUser(mapped);
      setUserRole(preferred.role);
    } else {
      setUser(null);
    }
  }, []);

  if (!user) {
    // You can return a loader here
    return <div>Loading...</div>;
  }

  return <Dashboard userRole={userRole} user={user} />;
};

export default DashboardPage;
