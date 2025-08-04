// @AI-HINT: This is the UserAvatar component. All styles are per-component only. See UserAvatar.common.css, UserAvatar.light.css, and UserAvatar.dark.css for theming.
import React from 'react';
import Image from 'next/image';
import './UserAvatar.common.css';
import './UserAvatar.light.css';
import './UserAvatar.dark.css';

export interface UserAvatarProps {
  theme?: 'light' | 'dark';
  name: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ theme = 'light', name, imageUrl, size = 'medium' }) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };
  const imageSize = sizeMap[size];
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const className = `UserAvatar UserAvatar--${theme} UserAvatar--${size}`;

  if (imageUrl) {
    return <Image src={imageUrl} alt={name} className={`${className} UserAvatar--image`} width={imageSize} height={imageSize} />;
  }

  return (
    <div className={`${className} UserAvatar--initials`}>
      <span>{getInitials(name)}</span>
    </div>
  );
};

export default UserAvatar;
