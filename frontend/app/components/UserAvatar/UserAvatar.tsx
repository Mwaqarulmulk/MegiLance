// @AI-HINT: This is the UserAvatar component for displaying user profile images or initials. All styles are per-component only. See UserAvatar.common.css, UserAvatar.light.css, and UserAvatar.dark.css for theming.
import React from "react";
import "./UserAvatar.common.css";
import "./UserAvatar.light.css";
import "./UserAvatar.dark.css";

export interface UserAvatarProps {
  theme?: "light" | "dark";
  src?: string;
  alt?: string;
  size?: number;
  initials?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ theme = "light", src, alt = "User avatar", size = 40, initials }) => {
  return (
    <span className={`UserAvatar UserAvatar--${theme}`} style={{ width: size, height: size, fontSize: size * 0.44 }}>
      {src ? (
        <img src={src} alt={alt} className="UserAvatar-img" style={{ width: size, height: size }} />
      ) : (
        <span className="UserAvatar-initials">{initials || "?"}</span>
      )}
    </span>
  );
};

export default UserAvatar;
