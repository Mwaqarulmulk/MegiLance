// @AI-HINT: This is the UserAvatar component. It displays an image if a `src` is provided, otherwise it displays the user's initials derived from the `name` prop.
'use client';

import React from 'react';
import Image from 'next/image';
import './UserAvatar.common.css';
import './UserAvatar.light.css';
import './UserAvatar.dark.css';

export interface UserAvatarProps {
  theme?: 'light' | 'dark';
  name: string; // Always required for initials fallback and alt text
  src?: string; // Optional image source
  size?: 'small' | 'medium' | 'large';
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  theme = 'light',
  name,
  src,
  size = 'medium',
}) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };
  const imageSize = sizeMap[size];

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const className = `UserAvatar UserAvatar--${theme} UserAvatar--${size}`;

  if (src) {
    return (
      <div className={className}>
        <Image
          src={src}
          alt={name}
          className="UserAvatar-image"
          width={imageSize}
          height={imageSize}
        />
      </div>
    );
  }

  return (
    <div className={`${className} UserAvatar--initials`}>
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default UserAvatar;
