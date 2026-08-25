// @AI-HINT: Completely redesigned premium sticky Header with accessible Mega Menu & mobile flyout
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useThemeMode, useThemeStyles } from '@/app/hooks/useThemeMode';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Sparkles, ChevronDown, Briefcase, Users, Shield, PlayCircle, 
  Search, Zap, Globe, MessageSquare, CreditCard, 
  BarChart3, Star, Building2, Rocket, HelpCircle, Mail, Activity, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MegiLanceLogo } from '@/app/components/atoms/MegiLanceLogo/MegiLanceLogo';
import Button from '@/app/components/atoms/Button/Button';
import FeatureStatusPill, { type FeatureStatus } from '@/app/components/molecules/FeatureStatusPill/FeatureStatusPill';

import commonStyles from './Header.common.module.css';
import lightStyles from './Header.light.module.css';
import darkStyles from './Header.dark.module.css';

const megaMenuData = {
  aiSuite: {
    title: 'Work Tools',
    sections: [
      {
        title: 'Price & Rates',
        items: [
          { name: 'AI Price Estimator', href: '/ai/price-estimator', icon: BarChart3, description: 'Estimate project budgets and delivery timelines' },
          { name: 'Freelance Rate Advisor', href: '/ai/rate-advisor', icon: Zap, description: 'Calculate competitive hourly & fixed project rates' },
        ]
      },
      {
        title: 'Proposals & Planning',
        items: [
          { name: 'AI Proposal Writer', href: '/ai/proposal-writer', icon: MessageSquare, description: 'Draft tailored proposals with deliverable milestones' },
          { name: 'Project Scope Planner', href: '/ai/scope-planner', icon: Briefcase, description: 'Structure milestones, WBS scopes, and timelines' },
        ]
      },
      {
        title: 'Contracts & Invoices',
        items: [
          { name: 'Contract Builder', href: '/tools/contract-builder', icon: Lock, description: 'Create standard freelance agreement templates' },
          { name: 'Invoice Generator', href: '/ai/invoice-generator', icon: CreditCard, description: 'Create professional multi-currency invoices' },
        ]
      },
      {
        title: 'Safety & Growth',
        items: [
          { name: 'Risk & Scam Checker', href: '/ai/fraud-check', icon: Shield, description: 'Scan job briefs and messages for fraud red flags' },
          { name: 'Skill Analyzer', href: '/ai/skill-analyzer', icon: Star, description: 'Evaluate your skillset against real market demand' },
          { name: 'All 11 AI Tools Hub', href: '/ai', icon: Sparkles, description: 'Browse the full free AI productivity tool suite' },
        ]
      }
    ]
  },
  hireTalent: {
    title: 'Build a Team',
    sections: [
      {
        title: 'Find & Hire',
        items: [
          { name: 'Browse Freelancers', href: '/talent', icon: Star, description: 'Find verified developers, designers & writers' },
          { name: 'Post a Project', href: '/create-project', icon: Briefcase, description: 'Post work with milestone escrow protection' },
          { name: 'Client Overview', href: '/clients', icon: Shield, description: 'Learn how milestone escrow protects your budget' },
        ]
      },
      {
        title: 'Teams & Enterprise',
        items: [
          { name: 'Enterprise Sourcing', href: '/teams', icon: Building2, description: 'Dedicated talent matching and team workflows' },
          { name: 'Methodology', href: '/methodology', icon: Activity, description: 'How our multi-factor matching algorithms work' },
        ]
      }
    ]
  },
  findWork: {
    title: 'Find Your Next Brief',
    sections: [
      {
        title: 'Opportunities',
        items: [
          { name: 'Browse Projects', href: '/explore', icon: Rocket, description: 'Explore active freelance opportunities worldwide' },
          { name: 'Freelancer Overview', href: '/freelancers', icon: Users, description: 'Platform benefits, milestone security, and tools' },
        ]
      },
      {
        title: 'Freelancer Tools',
        items: [
          { name: 'AI Proposal Writer', href: '/ai/proposal-writer', icon: MessageSquare, description: 'Write compelling proposals for open projects' },
          { name: 'Rate Advisor', href: '/ai/rate-advisor', icon: BarChart3, description: 'Check regional market rates for your specialty' },
        ]
      }
    ]
  },
  resources: {
    title: 'Learn & Decide',
    sections: [
      {
        title: 'Learn & Explore',
        items: [
          { name: 'How It Works', href: '/how-it-works', icon: Rocket, description: 'Step-by-step guide from AI scoping to payment' },
          { name: 'AI Methodology', href: '/methodology', icon: Activity, description: 'Transparent documentation of our AI algorithms' },
          { name: 'Trust & Safety', href: '/trust', icon: Shield, description: 'Escrow workflows, dispute handling & privacy' },
        ]
      },
      {
        title: 'Company & Help',
        items: [
          { name: 'About MegiLance', href: '/about', icon: Users, description: 'Platform origin, mission, architecture & team' },
          { name: 'Help & Support', href: '/support', icon: HelpCircle, description: 'FAQs, contact channels, and community guides' },
        ]
      }
    ]
  }
};

type MenuKey = keyof typeof megaMenuData | null;

export default function Header() {
  const mode = useThemeMode();
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<MenuKey>('hireTalent');
  const pathname = usePathname();

  const isDarkMode = mode === 'dark';
  const themeStyles = useThemeStyles(lightStyles, darkStyles);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Hydration handling
  useEffect(() => setIsMounted(true), []);

  // Scroll effect for dynamic shrinking navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync mobile menu body locking correctly
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Accessible escape key handler for mobile
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileMenuOpen]);

  // Route change closes menus
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside mega menu detection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuEnter = useCallback((key: MenuKey) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(key);
  }, []);

  const handleMenuLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 250);
  }, []);

  return (
    <>
      <motion.header 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }} 
        className={cn(commonStyles.header, themeStyles.header)} 
        data-scrolled={isScrolled}
        suppressHydrationWarning
      >
        <div className={commonStyles.innerContainer}>
          <Link href="/" className={commonStyles.brandWrap} aria-label="MegiLance Home">
            <MegiLanceLogo />
            <span className={cn(commonStyles.brandText, themeStyles.brandText)}>MegiLance</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={commonStyles.desktopNav} ref={navRef}>
            {(Object.keys(megaMenuData) as Array<keyof typeof megaMenuData>).map((key) => (
              <div 
                key={key} 
                className={commonStyles.dropdownWrapper}
                onMouseEnter={() => handleMenuEnter(key)}
                onMouseLeave={handleMenuLeave}
              >
                <button 
                  className={cn(commonStyles.navBtn, themeStyles.navBtn, activeMenu === key && themeStyles.navBtnActive)}
                  aria-expanded={activeMenu === key}
                  onFocus={() => handleMenuEnter(key)}
                  onClick={() => activeMenu === key ? setActiveMenu(null) : handleMenuEnter(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setActiveMenu(null);
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (activeMenu === key) {
                        setActiveMenu(null);
                      } else {
                        handleMenuEnter(key);
                      }
                    }
                  }}
                  aria-haspopup="true"
                  aria-controls={`mega-menu-${key}`}
                >
                  {megaMenuData[key].title}
                  <ChevronDown size={14} className={cn(commonStyles.chevron, activeMenu === key && commonStyles.chevronRotated)} />
                </button>

                {/* Animated MegaMenu Dropdown */}
                <div 
                  id={`mega-menu-${key}`}
                  className={cn(
                    commonStyles.megaMenu, 
                    activeMenu === key && commonStyles.megaMenuActive,
                    key === 'aiSuite' && commonStyles.megaMenuAlignRight
                  )}
                  role="region"
                  aria-label={`${megaMenuData[key].title} Submenu`}
                >
                  <div className={cn(commonStyles.megaMenuContent, themeStyles.megaMenuContent)}>
                    {megaMenuData[key].sections.map((section, idx) => (
                      <div key={idx} className={commonStyles.megaMenuSection}>
                        <h4 className={cn(commonStyles.megaMenuLabel, themeStyles.megaMenuLabel)}>{section.title}</h4>
                        <div className={commonStyles.megaMenuGrid}>
                          {section.items.map((item) => (
                            <Link key={item.href} href={item.href} className={cn(commonStyles.megaMenuItem, themeStyles.megaMenuItem)}>
                              <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                                <item.icon size={20} />
                              </div>
                              <div className={commonStyles.itemTextContent}>
                                <div className={commonStyles.itemHeader}>
                                  <span className={commonStyles.itemName}>{item.name}</span>
                                </div>
                                <span className={cn(commonStyles.itemDesc, themeStyles.itemDesc)}>{item.description}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <Link href="/how-it-works" className={cn(commonStyles.navBtn, themeStyles.navBtn)}>
              How It Works
            </Link>

            <Link href="/pricing" className={cn(commonStyles.navBtn, themeStyles.navBtn)}>
              Pricing
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className={commonStyles.actionGroup}>
            <div className={commonStyles.desktopActions}>
              <Link href="/login?demo=client" className="hidden items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 lg:inline-flex dark:text-blue-400 dark:hover:text-blue-300">
                <PlayCircle size={15} aria-hidden="true" />
                <span>View Demo</span>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="md">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="md">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Hamburger Hook */}
            <button 
              className={cn(commonStyles.hamburger, themeStyles.hamburger)}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Flyout Menu */}
      <div className={cn(commonStyles.mobileFlyout, themeStyles.mobileFlyout, mobileMenuOpen && commonStyles.mobileFlyoutOpen)}>
        <div className={cn(commonStyles.mobileHeader, themeStyles.mobileHeader)}>
          <Link href="/" className={commonStyles.brandWrap} onClick={() => setMobileMenuOpen(false)}>
            <MegiLanceLogo />
            <span className={cn(commonStyles.brandText, themeStyles.brandText)}>MegiLance</span>
          </Link>
          <button className={cn(commonStyles.closeBtn, themeStyles.hamburger)} onClick={() => setMobileMenuOpen(false)} aria-label="Close Mobile Menu">
            <X size={24} />
          </button>
        </div>

        <div className={commonStyles.mobileContentWrapper}>
          <div className={commonStyles.mobileTabs}>
            {(Object.keys(megaMenuData) as Array<keyof typeof megaMenuData>).map(key => (
              <button 
                key={key} 
                onClick={() => setActiveMobileSection(key)}
                className={cn(
                  commonStyles.mobileTab, 
                  themeStyles.mobileTab, 
                  activeMobileSection === key && themeStyles.mobileTabActive
                )}
              >
                {megaMenuData[key].title}
              </button>
            ))}
          </div>

          <div className={commonStyles.mobilePanel}>
            {activeMobileSection && megaMenuData[activeMobileSection].sections.map((sec, idx) => (
              <div key={idx} className={commonStyles.mobileSecWrap}>
                <h3 className={cn(commonStyles.mobileSecLabel, themeStyles.megaMenuLabel)}>{sec.title}</h3>
                <div className={commonStyles.mobileSecItems}>
                  {sec.items.map(item => (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      className={cn(commonStyles.megaMenuItem, commonStyles.mobileItemSpecific, themeStyles.megaMenuItem)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
                        <item.icon size={20} />
                      </div>
                      <div className={commonStyles.itemTextContent}>
                        <div className={commonStyles.itemHeader}>
                          <span className={commonStyles.itemName}>{item.name}</span>
                        </div>
                        <span className={cn(commonStyles.itemDesc, themeStyles.itemDesc)}>{item.description}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link href="/how-it-works" className={cn(commonStyles.navBtn, themeStyles.navBtn)} onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </Link>
              <Link href="/pricing" className={cn(commonStyles.navBtn, themeStyles.navBtn)} onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
            </div>
          </div>
        </div>

        <div className={cn(commonStyles.mobileFooter, themeStyles.mobileFooter)}>
          <Link href="/login" className={commonStyles.mobileFooterLink} onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" size="lg" fullWidth>Sign In</Button>
          </Link>
          <Link href="/signup" className={commonStyles.mobileFooterLink} onClick={() => setMobileMenuOpen(false)}>
            <Button variant="primary" size="lg" fullWidth>Get Started</Button>
          </Link>
        </div>
      </div>
    </>
  );
}

