// @AI-HINT: Enterprise settings hub with categorized navigation cards, role-aware routing, and corporate layout
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings as SettingsIcon, User, Shield, Bell, Palette,
  CreditCard, Key, Globe, FileText, Database,
  ChevronRight, Search
} from 'lucide-react';

import commonStyles from './Settings.common.module.css';
import lightStyles from './Settings.light.module.css';
import darkStyles from './Settings.dark.module.css';

interface SettingsItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  path: string;
  badge?: string;
}

interface SettingsCategory {
  label: string;
  items: SettingsItem[];
}

const Settings: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMounted(true); }, []);

  const portalArea = typeof window !== 'undefined' ? (localStorage.getItem('portal_area') || 'client') : 'client';
  const basePath = portalArea === 'admin' ? '/admin' : portalArea === 'freelancer' ? '/freelancer' : '/client';

  const categories: SettingsCategory[] = useMemo(() => [
    {
      label: 'Account',
      items: [
        { icon: <User size={20} />, title: 'Profile', desc: 'Personal information, bio, and avatar', path: `${basePath}/profile` },
        { icon: <Shield size={20} />, title: 'Security', desc: 'Password, two-factor authentication', path: `${basePath}/security` },
        { icon: <Bell size={20} />, title: 'Notifications', desc: 'Email and push notification preferences', path: `${basePath}/notifications` },
      ],
    },
    {
      label: 'Preferences',
      items: [
        { icon: <Palette size={20} />, title: 'Appearance', desc: 'Theme, language, and display options', path: `${basePath}/settings` },
        { icon: <Globe size={20} />, title: 'Language & Region', desc: 'Locale, timezone, and date format', path: `${basePath}/settings?tab=locale` },
      ],
    },
    {
      label: 'Billing & Payments',
      items: [
        { icon: <CreditCard size={20} />, title: 'Wallet & Payments', desc: 'Payment methods and transaction history', path: `${basePath}/wallet` },
        { icon: <FileText size={20} />, title: 'Invoices', desc: 'View and download invoices', path: `${basePath}/invoices` },
      ],
    },
    ...(portalArea === 'admin' ? [{
      label: 'Administration',
      items: [
        { icon: <Key size={20} />, title: 'API Keys', desc: 'Manage API keys and access tokens', path: '/admin/api-keys' },
        { icon: <Database size={20} />, title: 'Data & Export', desc: 'Export data and manage backups', path: '/admin/export' },
      ],
    }] : []),
  ], [basePath, portalArea]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.map(cat => ({
      ...cat,
      items: cat.items.filter(item =>
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
      ),
    })).filter(cat => cat.items.length > 0);
  }, [categories, searchQuery]);

  if (!mounted) return null;

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <header className={commonStyles.header}>
        <div className={commonStyles.headerLeft}>
          <div className={cn(commonStyles.headerIcon, themeStyles.headerIcon)}>
            <SettingsIcon size={22} />
          </div>
          <div>
            <h1 className={cn(commonStyles.title, themeStyles.title)}>Settings</h1>
            <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>Manage your account preferences and configuration</p>
          </div>
        </div>
        <div className={cn(commonStyles.searchBox, themeStyles.searchBox)}>
          <Search size={16} className={commonStyles.searchIcon} />
          <input
            type="text"
            placeholder="Search settings..."
            className={cn(commonStyles.searchInput, themeStyles.searchInput)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search settings"
          />
        </div>
      </header>

      <div className={commonStyles.categories}>
        {filteredCategories.map((category) => (
          <section key={category.label} className={commonStyles.category}>
            <h2 className={cn(commonStyles.categoryLabel, themeStyles.categoryLabel)}>{category.label}</h2>
            <div className={commonStyles.categoryGrid}>
              {category.items.map((item) => (
                <button
                  key={item.title}
                  onClick={() => router.push(item.path)}
                  className={cn(commonStyles.card, themeStyles.card)}
                >
                  <div className={cn(commonStyles.cardIcon, themeStyles.cardIcon)}>
                    {item.icon}
                  </div>
                  <div className={commonStyles.cardContent}>
                    <div className={commonStyles.cardTitleRow}>
                      <h3 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>{item.title}</h3>
                      {item.badge && (
                        <span className={cn(commonStyles.cardBadge, themeStyles.cardBadge)}>{item.badge}</span>
                      )}
                    </div>
                    <p className={cn(commonStyles.cardDesc, themeStyles.cardDesc)}>{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className={cn(commonStyles.cardArrow, themeStyles.cardArrow)} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
          <Search size={40} />
          <p>No settings found for &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}
    </div>
  );
};

export default Settings;
