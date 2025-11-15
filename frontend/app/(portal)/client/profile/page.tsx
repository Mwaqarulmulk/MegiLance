// @AI-HINT: Client Profile page scoped under the (portal) layout so it renders with the dashboard shell.
import React from 'react';
import Profile from '../../../profile/Profile';

export const metadata = {
  title: 'Client Profile — MegiLance',
};

export default function ClientProfilePage() {
  return <Profile />;
}
