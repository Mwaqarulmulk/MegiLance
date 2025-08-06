// @AI-HINT: This is the UserAvatar component. It displays an image if a `src` is provided, otherwise it displays the user's initials derived from the `name` prop.
'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './UserAvatar.common.module.css';
import lightStyles from './UserAvatar.light.module.css';
import darkStyles from './UserAvatar.dark.module.css';

export interface UserAvatarProps {
  name: string; // Always required for initials fallback and alt text
  src?: string; // Optional image source
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  src,
  size = 'medium',
  className,
}) => {
  const { theme } = useTheme();

  if (!theme) {
    return null; // Avoid hydration mismatch
  }
  const themeStyles = theme === 'light' ? lightStyles : darkStyles;

  const sizeMap = {
    small: { class: commonStyles.userAvatarSmall, size: 32 },
    medium: { class: commonStyles.userAvatarMedium, size: 40 },
    large: { class: commonStyles.userAvatarLarge, size: 56 },
  };
  const { class: sizeClass, size: imageSize } = sizeMap[size];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarClasses = cn(
    commonStyles.userAvatar,
    themeStyles.userAvatar,
    sizeClass,
    className
  );

  if (src) {
    return (
      <div className={avatarClasses}>
        <Image
          src={src}
          alt={name}
          className={commonStyles.userAvatarImage}
          width={imageSize}
          height={imageSize}
        />
      </div>
    );
  }

  return (
    <div className={avatarClasses}>
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default UserAvatar;
