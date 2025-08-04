// @AI-HINT: This is the Sidebar component. It provides the main navigation for the application dashboard. It is designed to be responsive, themed, and accessible.
'use client';

import React, { useState, ReactNode, Children, cloneElement, isValidElement } from 'react';
import Link from 'next/link';
import { MegiLanceLogo } from '../Public/MegiLanceLogo';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

import './Sidebar.common.css';
import './Sidebar.light.css';
import './Sidebar.dark.css';

export interface SidebarProps {
  children: ReactNode; // To hold SidebarNav
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`Sidebar ${isCollapsed ? 'Sidebar-collapsed' : ''}`}>
      <div className="Sidebar-header">
        <Link href="/dashboard" className="Sidebar-logo-link">
          <MegiLanceLogo />
          <h1 className="Sidebar-title">MegiLance</h1>
        </Link>
      </div>

      <div className="Sidebar-content">
        {Children.map(children, (child) => {
          if (isValidElement(child)) {
            // @ts-ignore - Intentionally passing a prop the child component will use.
            return cloneElement(child, { isCollapsed });
          }
          return child;
        })}
      </div>

      <div className="Sidebar-footer">
        <button onClick={toggleCollapse} className="Sidebar-toggle" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
