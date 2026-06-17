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
  { title: 'Web Development', slug: 'web-development', icon: Code, count: 'Web apps, APIs, CMS', color: '#3b82f6', bg: '#eff6ff' },
  { title: 'Mobile Development', slug: 'mobile-apps', icon: Smartphone, count: 'iOS, Android, Cross-platform', color: '#8b5cf6', bg: '#f5f3ff' },
  { title: 'UI/UX Design', slug: 'ui-ux-design', icon: Palette, count: 'Figma, Prototyping, Research', color: '#ec4899', bg: '#fdf2f8' },
  { title: 'Data Science & AI', slug: 'data-science-ai', icon: Brain, count: 'ML, NLP, Computer Vision', color: '#f97316', bg: '#fff7ed' },
  { title: 'Writing & Content', slug: 'writing-content', icon: PenTool, count: 'Copywriting, SEO, Technical', color: '#10b981', bg: '#ecfdf5' },
  { title: 'Digital Marketing', slug: 'digital-marketing', icon: TrendingUp, count: 'SEO, Ads, Social Media', color: '#06b6d4', bg: '#ecfeff' },
  { title: 'DevOps & Cloud', slug: 'devops-cloud', icon: Cloud, count: 'AWS, Azure, CI/CD', color: '#6366f1', bg: '#eef2ff' },
  { title: 'Blockchain & Web3', slug: 'blockchain', icon: Globe, count: 'Smart Contracts, DApps', color: '#84cc16', bg: '#f7fee7' },
  { title: 'Cybersecurity', slug: 'cybersecurity', icon: Shield, count: 'Pen Testing, Audits', color: '#ef4444', bg: '#fef2f2' },
  { title: 'Database Engineering', slug: 'database', icon: Database, count: 'SQL, NoSQL, Optimization', color: '#14b8a6', bg: '#f0fdfa' },
  { title: 'Business & Consulting', slug: 'business', icon: BarChart3, count: 'Strategy, Operations, Finance', color: '#f59e0b', bg: '#fffbeb' },
  { title: 'Video & Animation', slug: 'video-animation', icon: Zap, count: 'Motion Graphics, 3D', color: '#a855f7', bg: '#faf5ff' },
];

export default async function CategoriesPage() {
  const apiCategories = await fetchCategories();
  const categories = apiCategories
    ? apiCategories.map((c: any) => ({
        title: c.name || c.title,
        slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-'),
        icon: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.icon || Briefcase,
        count: c.description || c.count || '',
        color: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.color || '#64748b',
        bg: defaultCategories.find(d => d.slug === (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')))?.bg || '#f8fafc',
      }))
    : defaultCategories;

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 3rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(69,115,223,0.2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#93c5fd' }}>
          <Briefcase size={14} />
          <span>{categories.length}+ Service Categories</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>Explore Categories</h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Find skilled professionals by industry and niche. Every category connects you with vetted experts.
        </p>
      </header>

      {/* Categories Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {categories.map((cat: any) => {
            const IconComponent = cat.icon || Briefcase;
            return (
              <Link
                key={cat.slug || cat.title}
                href={`/freelancers?q=${encodeURIComponent(cat.title)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem',
                  borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit',
                  transition: 'all 0.25s ease', background: 'white',
                }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComponent size={28} style={{ color: cat.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#0f172a' }}>{cat.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{cat.count}</p>
                </div>
                <ArrowRight size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '3rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4573df' }}>{categories.length}+</div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>Service Categories</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4573df' }}>500+</div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>Specialized Skills</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4573df' }}>10K+</div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>Vetted Freelancers</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#4573df' }}>24/7</div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>AI Matching Available</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#0f172a' }}>Not sure which category?</h2>
        <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 1.5rem', maxWidth: '500px', marginInline: 'auto' }}>
          Post your project and our AI will match you with the best freelancers for your needs.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/client/find-talent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Find Talent <ArrowRight size={16} />
          </Link>
          <Link href="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none', fontWeight: 600 }}>
            Explore All <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
