// @AI-HINT: Admin Profile page scoped under the (portal) layout so it renders with the dashboard shell.
import React from 'react';
import Profile from '../../../profile/Profile.tsx';

export const metadata = {
  title: 'Admin Profile — MegiLance',
};

export default function AdminProfilePage() {
  return <Profile />;
}
