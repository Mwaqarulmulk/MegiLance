// @AI-HINT: This is the ProfileMenu component for user avatar, dropdown, and account actions. All styles are per-component only. See ProfileMenu.common.css, ProfileMenu.light.css, and ProfileMenu.dark.css for theming.
'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './ProfileMenu.common.css';
import './ProfileMenu.light.css';
import './ProfileMenu.dark.css';

export interface ProfileMenuProps {
  theme?: 'light' | 'dark';
  userName: string;
  userImageUrl?: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ theme = 'light', userName, userImageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="ProfileMenu" ref={menuRef}>
      <button
        className="ProfileMenu-trigger"
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Toggle user menu"
      >
        <UserAvatar theme={theme} name={userName} imageUrl={userImageUrl} />
      </button>

      {isOpen && (
        <div className={`ProfileMenu-dropdown ProfileMenu-dropdown--${theme}`}>
          <div className="ProfileMenu-header">
            Signed in as <strong>{userName}</strong>
          </div>
          <ul className="ProfileMenu-links">
            <li><Link href="/profile">Profile</Link></li>
            <li><Link href="/Settings">Settings</Link></li>
            <li><button className="ProfileMenu-logout-button">Logout</button></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
