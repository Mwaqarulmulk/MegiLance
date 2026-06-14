// @AI-HINT: Premium Immersive Hero Component - Editorial Brutalism & Organic Fluidity blend
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ArrowRight, Search, ShieldCheck, Zap,
  Code, Palette, Smartphone, BarChart3,
  Briefcase, UserCheck, ShieldAlert, Rocket
} from 'lucide-react';
import Button from '@/app/components/atoms/Button/Button';
import { useThemeMode } from '@/app/hooks/useThemeMode';

import commonStyles from './Hero.common.module.css';
import lightStyles from './Hero.light.module.css';
import darkStyles from './Hero.dark.module.css';

// Using Optional HeroScene3D wrapper if available
import { HeroScene3D } from '@/app/components/3D';

const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === 'true';

const DEMO_USERS = [
  { role: 'client', label: 'Client Demo', icon: Briefcase, email: process.env.NEXT_PUBLIC_DEV_CLIENT_EMAIL || 'client1@example.com', password: process.env.NEXT_PUBLIC_DEV_CLIENT_PASSWORD || 'Client@123', redirect: '/portal/client/dashboard' },
  { role: 'freelancer', label: 'Freelancer Demo', icon: UserCheck, email: process.env.NEXT_PUBLIC_DEV_FREELANCER_EMAIL || 'freelancer1@example.com', password: process.env.NEXT_PUBLIC_DEV_FREELANCER_PASSWORD || 'Freelancer@123', redirect: '/portal/freelancer/dashboard' },
  { role: 'admin', label: 'Admin Demo', icon: ShieldAlert, email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL || 'admin@megilance.com', password: process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD || 'Admin@123', redirect: '/admin' },
] as const;

const POPULAR_CATEGORIES = [
  { label: 'Web Development', icon: Code, href: '/explore?category=web-development' },
  { label: 'UI/UX Design', icon: Palette, href: '/explore?category=ui-ux-design' },
  { label: 'Mobile Apps', icon: Smartphone, href: '/explore?category=mobile-apps' },
  { label: 'Data Science', icon: BarChart3, href: '/explore?category=data-science' },
];

export default function Hero() {
  const mode = useThemeMode();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [demoLoggingIn, setDemoLoggingIn] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Pointer spotlight effect
  const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });

  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const handleDemoLogin = useCallback(async (user: typeof DEMO_USERS[number]) => {
    setDemoLoggingIn(user.role);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user_role', user.role);
          router.push(user.redirect);
          return;
        }
      }
      // Fallback: go to login page with credentials pre-filled via query
      router.push(`/login?demo=${user.role}`);
    } catch {
      router.push(`/login?demo=${user.role}`);
    } finally {
      setDemoLoggingIn(null);
    }
  }, [router]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const HeadlineText = "Find Top Talent.\nFast & Secure.";

  const Wrapper = HeroScene3D || 'div';

  return (
    <Wrapper className={cn(commonStyles.heroContainer, themeStyles.heroContainer)}>
      <motion.div 
        ref={containerRef}
        className={commonStyles.heroInteractiveSurface}
        onMouseMove={handleMouseMove}
        style={{ y: yParallax, opacity: opacityFade }}
      >
        {/* Mouse Glow Spotlight */}
        <motion.div 
          className={cn(commonStyles.mouseGlow, themeStyles.mouseGlow)}
          animate={{ x: mousePos.x - 400, y: mousePos.y - 400 }}
          transition={{ type: "spring" as const, bounce: 0.25, mass: 0.5 }}
        />

        {/* Ambient background depth elements */}
        <div className={cn(commonStyles.ambientOrb1, themeStyles.ambientOrb1)} />
        <div className={cn(commonStyles.ambientOrb2, themeStyles.ambientOrb2)} />

        <div className={commonStyles.contentLayout}>
          
          {/* Typographic Engine Headline - Staggered Words */}
          <div className={commonStyles.titleWrapper}>
            <motion.h1 
              className={cn(commonStyles.mainHeadline, themeStyles.mainHeadline)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1 }}
            >
              {HeadlineText.split('\n').map((line, i) => (
                <span key={i} className={commonStyles.headlineLine}>
                  {line.split(' ').map((word, j) => (
                    <motion.span
                      key={j}
                      className={commonStyles.headlineWord}
                      initial={{ y: 80, opacity: 0, rotateZ: 5 }}
                      animate={{ y: 0, opacity: 1, rotateZ: 0 }}
                      transition={{ 
                        type: "spring" as const, 
                        stiffness: 100, 
                        damping: 15, 
                        delay: (i * 0.2) + (j * 0.1) 
                      }}
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </span>
              ))}
            </motion.h1>
            
            <motion.p 
              className={cn(commonStyles.heroSubtitle, themeStyles.heroSubtitle)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              The premium marketplace for independent professionals. Connect with curated experts instantly and pay securely with escrow protection.
            </motion.p>
          </div>

          {/* Premium Search Experience */}
          <motion.div 
            className={commonStyles.searchSection}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
          >
            <form onSubmit={handleSearch} className={cn(commonStyles.searchForm, themeStyles.searchForm)}>
              <Search size={22} className={cn(commonStyles.searchIcon, themeStyles.searchIcon)} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What project are you hiring for today?"
                className={cn(commonStyles.searchInput, themeStyles.searchInput)}
              />
              <Button type="submit" variant="primary" size="lg" className={commonStyles.searchBtn}>
                Explore Talent
              </Button>
            </form>

            {/* Quick Categories */}
            <div className={commonStyles.popularTagsWrap}>
              <span className={cn(commonStyles.popularPrefix, themeStyles.popularPrefix)}>Trending:</span>
              <div className={commonStyles.tagsList}>
                {POPULAR_CATEGORIES.map(({ label, href }) => (
                  <Link href={href} key={label} className={cn(commonStyles.tagPill, themeStyles.tagPill)}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Social Proof & Metrics */}
          <motion.div
            className={commonStyles.metricsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            <div className={commonStyles.metricItem}>
              <ShieldCheck size={20} className={themeStyles.metricIcon} />
              <span className={cn(commonStyles.metricText, themeStyles.metricText)}>100% Escrow Protected</span>
            </div>
            <div className={commonStyles.metricDivider} />
            <div className={commonStyles.metricItem}>
              <Zap size={20} className={themeStyles.metricIcon} />
              <span className={cn(commonStyles.metricText, themeStyles.metricText)}>AI Matched under 24h</span>
            </div>
          </motion.div>

          {/* Quick Demo Login — visible when NEXT_PUBLIC_SHOW_DEMO_LOGIN=true */}
          {SHOW_DEMO && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              style={{
                marginTop: '2rem',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                flexWrap: 'wrap' as const,
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                <Rocket size={16} style={{ opacity: 0.7 }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.7, whiteSpace: 'nowrap' as const }}>Quick Demo:</span>
              </div>
              {DEMO_USERS.map((u) => {
                const Icon = u.icon;
                const isLoading = demoLoggingIn === u.role;
                return (
                  <button
                    key={u.role}
                    onClick={() => handleDemoLogin(u)}
                    disabled={!!demoLoggingIn}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: demoLoggingIn ? 'not-allowed' : 'pointer',
                      opacity: demoLoggingIn && !isLoading ? 0.5 : 1,
                      border: resolvedTheme === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                      background: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      color: 'inherit',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Icon size={14} />
                    {isLoading ? 'Logging in…' : u.label}
                  </button>
                );
              })}
              <Link
                href="/login"
                style={{ fontSize: '0.75rem', opacity: 0.5, marginLeft: 'auto', textDecoration: 'underline' }}
              >
                Manual login →
              </Link>
            </motion.div>
          )}

        </div>
      </motion.div>
    </Wrapper>
  );
}

