// @AI-HINT: Profile completion page - visual hub with progress indicator
'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import ProfileCompletion from '@/app/components/Profile/ProfileCompletion/ProfileCompletion';
import commonStyles from './CompleteProfile.common.module.css';
import lightStyles from './CompleteProfile.light.module.css';
import darkStyles from './CompleteProfile.dark.module.css';

export default function CompleteProfilePage() {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.wrapper, themeStyles.wrapper)}>
      <ProfileCompletion />
    </div>
  );
}
