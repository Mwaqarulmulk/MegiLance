// @AI-HINT: This is the SidebarNav component for navigation links in the sidebar. All styles are per-component only. See SidebarNav.common.css, SidebarNav.light.css, and SidebarNav.dark.css for theming.
import React from "react";
import Link from 'next/link';
import "./SidebarNav.common.css";
import "./SidebarNav.light.css";
import "./SidebarNav.dark.css";

export interface SidebarNavProps {
  theme?: "light" | "dark";
  links: { label: string; href: string }[];
  activeHref?: string;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ theme = "light", links, activeHref }) => {
  return (
    <nav className={`SidebarNav SidebarNav--${theme}`} aria-label="Sidebar Navigation">
      <ul className="SidebarNav-list">
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} legacyBehavior>
              <a
                className={`SidebarNav-link${activeHref === link.href ? " SidebarNav-link--active" : ""}`}
                aria-current={activeHref === link.href ? "page" : undefined}
              >
                {link.label}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;
