import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Service Categories | Browse All Skills & Expertise — MegiLance',
  description: 'Browse all freelance service categories on MegiLance: web development, UI/UX design, content writing, digital marketing, AI/ML, data science, and 50+ more skill areas. Find your expert today.',
  path: '/categories',
  keywords: getKeywordsForPage(['transactional', 'industry', 'technology'], [
    'freelance categories', 'hire by skill category', 'browse freelance services',
    'freelance skill directory', 'find freelancers by category', 'all freelance skills',
  ]),
});

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, Code, Palette, PenTool, BarChart3, Shield, Smartphone, Database, Cloud, Brain, Globe, Zap, TrendingUp } from 'lucide-react';
import commonStyles from './Categories.common.module.css';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/v1/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.items || data.categories || data || null;
  } catch {
    return null;
  }
}

const defaultCategories = [
  { title: 'Web Development', slug: 'web-development', icon: Code, count: 'Web apps, APIs, CMS', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  { title: 'Mobile Development', slug: 'mobile-apps', icon: Smartphone, count: 'iOS, Android, Cross-platform', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  { title: 'UI/UX Design', slug: 'ui-ux-design', icon: Palette, count: 'Figma, Prototyping, Research', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
  { title: 'Data Science & AI', slug: 'data-science-ai', icon: Brain, count: 'ML, NLP, Computer Vision', color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
  { title: 'Writing & Content', slug: 'writing-content', icon: PenTool, count: 'Copywriting, SEO, Technical', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  { title: 'Digital Marketing', slug: 'digital-marketing', icon: TrendingUp, count: 'SEO, Ads, Social Media', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
  { title: 'DevOps & Cloud', slug: 'devops-cloud', icon: Cloud, count: 'AWS, Azure, CI/CD', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
  { title: 'Blockchain & Web3', slug: 'blockchain', icon: Globe, count: 'Smart Contracts, DApps', color: '#84cc16', bg: 'rgba(132, 204, 22, 0.12)' },
  { title: 'Cybersecurity', slug: 'cybersecurity', icon: Shield, count: 'Pen Testing, Audits', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  { title: 'Database Engineering', slug: 'database', icon: Database, count: 'SQL, NoSQL, Optimization', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.12)' },
  { title: 'Business & Consulting', slug: 'business', icon: BarChart3, count: 'Strategy, Operations, Finance', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { title: 'Video & Animation', slug: 'video-animation', icon: Zap, count: 'Motion Graphics, 3D', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
];

export default async function CategoriesPage() {
  const apiCategories = await fetchCategories();
  const categories = apiCategories
    ? apiCategories.map((c: any) => ({
        title: c.name || c.title,
        slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-'),
        icon: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.icon || Briefcase,
        count: c.description || c.count || '',
        color: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.color || '#4573df',
        bg: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.bg || 'rgba(69, 115, 223, 0.12)',
      }))
    : defaultCategories;

  return (
    <main className={commonStyles.main}>
      {/* Hero Header */}
      <header className={commonStyles.hero}>
        <div className={commonStyles.heroBadge}>
          <Briefcase size={14} />
          <span>{categories.length}+ Service Categories</span>
        </div>
        <h1 className={commonStyles.title}>Explore Categories</h1>
        <p className={commonStyles.subtitle}>
          Find skilled professionals by industry and niche. Every category connects you with vetted experts.
        </p>
      </header>

      {/* Categories Grid */}
      <section className={commonStyles.gridSection}>
        <div className={commonStyles.grid}>
          {categories.map((cat: any) => {
            const IconComponent = cat.icon || Briefcase;
            return (
              <Link
                key={cat.slug || cat.title}
                href={`/freelancers?q=${encodeURIComponent(cat.title)}`}
                className={commonStyles.card}
              >
                <div className={commonStyles.iconBox} style={{ background: cat.bg }}>
                  <IconComponent size={28} style={{ color: cat.color }} />
                </div>
                <div className={commonStyles.cardContent}>
                  <h3 className={commonStyles.cardTitle}>{cat.title}</h3>
                  <p className={commonStyles.cardDesc}>{cat.count}</p>
                </div>
                <ArrowRight size={18} className={commonStyles.arrowIcon} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className={commonStyles.statsSection}>
        <div className={commonStyles.statsGrid}>
          <div>
            <div className={commonStyles.statValue}>{categories.length}+</div>
            <div className={commonStyles.statLabel}>Service Categories</div>
          </div>
          <div>
            <div className={commonStyles.statValue}>500+</div>
            <div className={commonStyles.statLabel}>Specialized Skills</div>
          </div>
          <div>
            <div className={commonStyles.statValue}>10K+</div>
            <div className={commonStyles.statLabel}>Vetted Freelancers</div>
          </div>
          <div>
            <div className={commonStyles.statValue}>24/7</div>
            <div className={commonStyles.statLabel}>AI Matching Available</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={commonStyles.ctaSection}>
        <h2 className={commonStyles.ctaTitle}>Not sure which category?</h2>
        <p className={commonStyles.ctaDesc}>
          Post your project and our AI will match you with the best freelancers for your needs.
        </p>
        <div className={commonStyles.ctaActions}>
          <Link href="/client/find-talent" className={commonStyles.btnPrimary}>
            Find Talent <ArrowRight size={16} />
          </Link>
          <Link href="/explore" className={commonStyles.btnSecondary}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
