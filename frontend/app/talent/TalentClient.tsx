// @AI-HINT: Public talent directory page - fetches real freelancer data from API.
// Production-ready: No mock data, connects to /api/freelancers
'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Loader2, Search, X, MapPin, Star, CheckCircle, Clock } from 'lucide-react';
import { PageTransition, ScrollReveal, StaggerContainer, StaggerItem } from '@/app/components/Animations';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';

import { getAuthToken } from '@/lib/api';
import common from './TalentDirectory.common.module.css';
import light from './TalentDirectory.light.module.css';
import dark from './TalentDirectory.dark.module.css';

interface TalentProfile {
  id: string;
  name: string;
  role: string;
  rank: number;
  skills: string[];
  avatar: string;
  hourlyRate: number | null;
  location: string;
  availability: string;
  isVerified: boolean;
  sellerLevel: string;
  slug: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All', keywords: [] },
  { id: 'web', label: 'Web Dev', keywords: ['react', 'vue', 'angular', 'next', 'node', 'javascript', 'typescript', 'html', 'css', 'php', 'laravel', 'django', 'fullstack', 'frontend', 'backend'] },
  { id: 'mobile', label: 'Mobile', keywords: ['ios', 'android', 'flutter', 'react native', 'swift', 'kotlin', 'mobile'] },
  { id: 'design', label: 'Design', keywords: ['figma', 'sketch', 'ui', 'ux', 'design', 'photoshop', 'adobe', 'branding', 'graphic', 'logo'] },
  { id: 'ai', label: 'AI & ML', keywords: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ai', 'nlp', 'llm', 'data science'] },
  { id: 'data', label: 'Data', keywords: ['sql', 'tableau', 'power bi', 'analytics', 'pandas', 'spark', 'etl', 'bigquery', 'data'] },
  { id: 'devops', label: 'DevOps', keywords: ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud', 'ci/cd', 'linux', 'devops', 'terraform'] },
  { id: 'writing', label: 'Writing', keywords: ['writing', 'content', 'copywriting', 'seo', 'blog', 'documentation'] },
];

interface FreelancerApiRow {
  id?: string | number;
  name?: string;
  profile_image_url?: string;
  avatar?: string;
  headline?: string;
  title?: string;
  hourly_rate?: number | null;
  location?: string;
  skills?: string | string[];
  seller_level?: string;
  availability_status?: string;
  is_verified?: boolean | number;
  profile_slug?: string;
  ai_score?: number;
  rating?: number;
}

function parseSkills(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  const s = raw.trim();
  if (s.startsWith('[')) {
    try { return JSON.parse(s).filter(Boolean); } catch { /* fall through */ }
  }
  return s.split(',').map(x => x.trim()).filter(Boolean);
}

async function fetchFreelancers(): Promise<TalentProfile[]> {
  const token = typeof window !== 'undefined' ? getAuthToken() : null;
  try {
    const res = await fetch('/api/v1/users/freelancers?limit=48', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    const rows: FreelancerApiRow[] = data.freelancers || data.items || data || [];
    return rows.map((f, idx) => ({
      id: String(f.id ?? idx),
      name: f.name ?? `Freelancer ${idx + 1}`,
      role: f.headline ?? f.title ?? 'Freelancer',
      rank: f.ai_score ?? Math.floor((f.rating ?? 0) * 20),
      skills: parseSkills(f.skills),
      avatar: f.profile_image_url ?? f.avatar ?? '',
      hourlyRate: f.hourly_rate ?? null,
      location: f.location ?? '',
      availability: f.availability_status ?? '',
      isVerified: Boolean(f.is_verified),
      sellerLevel: f.seller_level ?? '',
      slug: f.profile_slug ?? String(f.id ?? idx),
    }));
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[TalentClient] Failed to fetch freelancers:', err);
    }
    return [];
  }
}

function availColor(status: string): string {
  if (!status) return '#94a3b8';
  const s = status.toLowerCase();
  if (s === 'available') return '#22c55e';
  if (s === 'busy') return '#f59e0b';
  return '#94a3b8';
}

const TalentDirectoryPage = () => {
  const { resolvedTheme } = useTheme();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const data = await fetchFreelancers();
    setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const catKeywords = useMemo(
    () => CATEGORIES.find(c => c.id === category)?.keywords ?? [],
    [category],
  );

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      const skillStr = p.skills.join(' ').toLowerCase();
      const nameStr = (p.name + ' ' + p.role).toLowerCase();

      if (q) {
        const qLow = q.toLowerCase();
        if (!nameStr.includes(qLow) && !skillStr.includes(qLow)) return false;
      }

      if (category !== 'all' && catKeywords.length > 0) {
        const matches = catKeywords.some(kw => skillStr.includes(kw) || nameStr.includes(kw));
        if (!matches) return false;
      }

      return true;
    });
  }, [profiles, q, category, catKeywords]);

  if (!resolvedTheme) return null;
  const themed = resolvedTheme === 'dark' ? dark : light;

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatedOrb variant="blue" size={450} blur={90} opacity={0.1} className="absolute top-[-10%] left-[-10%]" />
        <AnimatedOrb variant="purple" size={380} blur={70} opacity={0.08} className="absolute bottom-[-10%] right-[-10%]" />
        <ParticlesSystem count={12} className="absolute inset-0" />
        <div className="absolute top-24 right-16 opacity-10"><FloatingCube size={55} /></div>
        <div className="absolute bottom-40 left-12 opacity-10"><FloatingSphere size={45} /></div>
      </div>

      <main className={cn(common.main, themed.main)}>
        {/* Hero */}
        <ScrollReveal>
          <header className={common.header}>
            <span className={cn(common.badge, themed.badge)}>AI-Ranked Directory</span>
            <h1 className={cn(common.title, themed.title)}>Explore Top Talent</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>
              Browse AI-ranked freelancers scored on skill depth, delivery speed, and client satisfaction.
            </p>

            <div className={common.statsBar}>
              <div className={cn(common.statItem, themed.statItem)}><strong>500+</strong><span>Freelancers</span></div>
              <div className={cn(common.statItem, themed.statItem)}><strong>40+</strong><span>Countries</span></div>
              <div className={cn(common.statItem, themed.statItem)}><strong>AI</strong><span>Scoring</span></div>
              <div className={cn(common.statItem, themed.statItem)}><strong>98%</strong><span>Satisfaction</span></div>
            </div>

            <div className={common.searchWrapper}>
              <div className={cn(common.searchBar, themed.searchBar)}>
                <Search className={common.searchIcon} size={18} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search by name or skill..."
                  className={cn(common.searchInput, themed.searchInput)}
                  aria-label="Search talent"
                />
                {q && (
                  <button onClick={() => setQ('')} className={common.searchClear} aria-label="Clear search">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </header>
        </ScrollReveal>

        {/* Category pills */}
        <div className={common.categories}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(common.catPill, themed.catPill, category === c.id && common.catPillActive, category === c.id && themed.catPillActive)}
              aria-pressed={category === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className={common.loadingCenter}>
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <StaggerContainer className={common.grid} delay={0.06}>
            {filtered.map(p => (
              <StaggerItem key={p.id}>
                <div className={cn(common.card, themed.card)}>
                  <div className={common.cardHeader}>
                    <div className={common.avatarWrap}>
                      <Image
                        src={p.avatar || '/images/default-avatar.svg'}
                        alt={p.name}
                        className={common.avatar}
                        width={56}
                        height={56}
                        onError={() => {/* handled by fallback src */}}
                      />
                      {p.availability && (
                        <span
                          className={common.availDot}
                          style={{ background: availColor(p.availability) }}
                          title={p.availability}
                        />
                      )}
                    </div>
                    <div className={common.profileInfo}>
                      <div className={common.nameRow}>
                        <h3 className={cn(common.name, themed.name)}>{p.name}</h3>
                        {p.isVerified && (
                          <CheckCircle size={14} className={cn(common.verifiedIcon, themed.verifiedIcon)} />
                        )}
                      </div>
                      <p className={cn(common.role, themed.role)}>{p.role}</p>
                    </div>
                    {p.hourlyRate && p.hourlyRate > 0 ? (
                      <span className={cn(common.rateBadge, themed.rateBadge)}>${p.hourlyRate}/hr</span>
                    ) : p.rank > 0 ? (
                      <span className={cn(common.rankBadge, themed.rankBadge)}>Score {p.rank}</span>
                    ) : null}
                  </div>

                  {p.location && (
                    <div className={cn(common.locationRow, themed.locationRow)}>
                      <MapPin size={12} />
                      <span>{p.location}</span>
                    </div>
                  )}

                  <div className={common.skillsWrapper}>
                    {p.skills.slice(0, 5).map(s => (
                      <span key={s} className={cn(common.skillTag, themed.skillTag)}>{s}</span>
                    ))}
                  </div>

                  <Link href={`/freelancers/${p.slug || p.id}`} className={cn(common.viewProfileBtn, themed.viewProfileBtn)}>
                    View Profile &rarr;
                  </Link>
                </div>
              </StaggerItem>
            ))}
            {filtered.length === 0 && (
              <div className={cn(common.emptyState, themed.emptyState)}>
                {profiles.length === 0
                  ? 'No freelancers found. Check back soon!'
                  : 'No matches — try a different search or category.'}
              </div>
            )}
          </StaggerContainer>
        )}

        {/* Bottom CTA */}
        <ScrollReveal>
          <section className={cn(common.ctaBox, themed.ctaBox)}>
            <h2 className={cn(common.ctaTitle, themed.ctaTitle)}>Looking to hire?</h2>
            <p className={cn(common.ctaDesc, themed.ctaDesc)}>
              Post a project and let our AI match you with the perfect freelancer.
            </p>
            <div className={common.ctaButtons}>
              <Link href="/signup" className={cn(common.ctaBtn, themed.ctaBtn)}>Post a Project</Link>
              <Link href="/client/find-talent" className={cn(common.ctaBtnOutline, themed.ctaBtnOutline)}>Advanced Search</Link>
            </div>
          </section>
        </ScrollReveal>
      </main>
    </PageTransition>
  );
};

const WrappedTalentDirectoryPage = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;
  return <TalentDirectoryPage />;
};

export default WrappedTalentDirectoryPage;
