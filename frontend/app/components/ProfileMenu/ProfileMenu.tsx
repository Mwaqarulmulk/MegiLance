// @AI-HINT: This is the ProfileMenu component for user avatar, dropdown, and account actions. It features a professional, themed design with icons and accessible states. All styles are per-component only.

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './ProfileMenu.common.css';
import './ProfileMenu.light.css';
import './ProfileMenu.dark.css';

// Define the structure for a menu item
export interface ProfileMenuItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

// Define the props for the ProfileMenu component
export interface ProfileMenuProps {
  theme?: 'light' | 'dark';
  userName: string;
  userEmail?: string;
  userImageUrl?: string;
  menuItems: ProfileMenuItem[];
  className?: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({
  theme = 'light',
  userName,
  userEmail,
  userImageUrl,
  menuItems,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuClasses = [
    'ProfileMenu',
    `ProfileMenu--${theme}`,
    className,
  ].filter(Boolean).join(' ');

  const dropdownClasses = [
    'ProfileMenu-dropdown',
    isOpen ? 'ProfileMenu-dropdown--open' : '',
  ].filter(Boolean).join(' ');

  const handleItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={menuClasses} ref={menuRef}>
      <button
        type="button"
        className="ProfileMenu-trigger"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Open user menu for ${userName}`}
      >
        <UserAvatar theme={theme} name={userName} src={userImageUrl} size="medium" />
      </button>

      <div className={dropdownClasses}>
        <div className="ProfileMenu-header">
          <div className="ProfileMenu-userDetails">
            <p className="ProfileMenu-userName">{userName}</p>
            {userEmail && <p className="ProfileMenu-userEmail">{userEmail}</p>}
          </div>
        </div>
        <ul className="ProfileMenu-items" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
          {menuItems.map((item) => (
            <li key={item.label} role="presentation">
              {((): React.ReactNode => {
                const commonProps = {
                  className: 'ProfileMenu-item',
                  role: 'menuitem',
                  onClick: () => handleItemClick(item.onClick),
                };

                const content = (
                  <>
                    <span className="ProfileMenu-itemIcon">{item.icon}</span>
                    <span className="ProfileMenu-itemLabel">{item.label}</span>
                  </>
                );

                if (item.href) {
                  return (
                    <Link href={item.href} {...commonProps}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <button type="button" {...commonProps}>
                    {content}
                  </button>
                );
              })()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileMenu;
