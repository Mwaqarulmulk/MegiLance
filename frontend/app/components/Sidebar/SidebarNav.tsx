// @AI-HINT: This component renders the navigation items within the Sidebar. It supports icons, labels, and active states.
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';

import './SidebarNav.common.css';
import './SidebarNav.light.css';
import './SidebarNav.dark.css';

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
}

export interface SidebarNavProps {
  navItems: NavItem[];
}

const SidebarNavItem: React.FC<{ item: NavItem; isCollapsed?: boolean }> = ({ item, isCollapsed }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  return (
    <li className="SidebarNavItem">
      <Link href={item.href} className={`SidebarNavItem-link ${isActive ? 'SidebarNavItem-link-active' : ''}`}>
        <item.icon className="SidebarNavItem-icon" />
        <span className={`SidebarNavItem-label ${isCollapsed ? 'SidebarNavItem-label-collapsed' : ''}`}>{item.label}</span>
      </Link>
    </li>
  );
};

const SidebarNav: React.FC<SidebarNavProps & { isCollapsed?: boolean }> = ({ navItems, isCollapsed }) => {
  return (
    <nav className="SidebarNav">
      <ul className="SidebarNav-list">
        {navItems.map((item) => (
          <SidebarNavItem key={item.href} item={item} isCollapsed={isCollapsed} />
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;
