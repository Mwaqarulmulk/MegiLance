// @AI-HINT: This is the ProfileMenu component for user avatar, dropdown, and account actions. All styles are per-component only. See ProfileMenu.common.css, ProfileMenu.light.css, and ProfileMenu.dark.css for theming.
import React, { useState, useRef, useEffect } from "react";
import "./ProfileMenu.common.css";
import "./ProfileMenu.light.css";
import "./ProfileMenu.dark.css";

export interface ProfileMenuProps {
  theme?: "light" | "dark";
  userName: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ theme = "light", userName, avatarUrl, onLogout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`ProfileMenu ProfileMenu--${theme}`} ref={menuRef}>
      <button className="ProfileMenu-avatar" onClick={() => setOpen((o) => !o)} aria-haspopup="true" aria-expanded={open}>
        <img src={avatarUrl || "/avatar.svg"} alt="User avatar" />
        <span className="ProfileMenu-name">{userName}</span>
      </button>
      {open && (
        <div className="ProfileMenu-dropdown" role="menu">
          <button className="ProfileMenu-item" role="menuitem">Profile</button>
          <button className="ProfileMenu-item" role="menuitem">Settings</button>
          <button className="ProfileMenu-item" role="menuitem" onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
