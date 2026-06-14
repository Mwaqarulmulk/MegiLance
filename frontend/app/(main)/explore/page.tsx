import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Explore MegiLance | Discover Top Freelancers, Open Gigs & Projects',
  description: 'Explore the MegiLance platform. Browse top-rated freelancers, active service gigs, open projects, and trending skills. Find your perfect project match using AI-powered search.',
  path: '/explore',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'explore freelancers', 'browse open projects', 'discover freelance talent',
    'find freelance gigs', 'search freelance marketplace', 'explore gig services',
    'trending freelance skills', 'open remote projects',
  ]),
});

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Briefcase, Users, Package, Bot, TrendingUp, Star, Clock, DollarSign, Zap, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchFreelancers() {
  try {
    const res = await fetch(`${API_URL}/api/v1/users/freelancers?page=1&page_size=6`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || data || []).slice(0, 6);
  } catch { return []; }
}

async function fetchGigs() {
  try {
    const res = await fetch(`${API_URL}/api/v1/gigs?status=published&page=1&page_size=6`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || data.gigs || data || []).slice(0, 6);
  } catch { return []; }
}

async function fetchProjects() {
  try {
    const res = await fetch(`${API_URL}/api/v1/projects?status=open&page=1&page_size=6`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || data.projects || data || []).slice(0, 6);
  } catch { return []; }
}

function ExploreClient() {
  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Header with Search */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 3rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(69,115,223,0.2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#93c5fd' }}>
          <Zap size={14} />
          <span>AI-Powered Search</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>Explore MegiLance</h1>
        <p style={{ fontSize: '1.25rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Discover top freelancers, ready-made services, and open jobs tailored to your skills.
        </p>

        {/* Search Bar */}
        <form action="/freelancers" method="GET" style={{ display: 'flex', gap: '0.75rem', maxWidth: '700px', margin: '2rem auto 0' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1.25rem', borderRadius: '14px', height: '56px', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <Search size={20} style={{ opacity: 0.5 }} />
            <input
              type="search"
              name="q"
              placeholder="Search for skills, services, freelancers..."
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1.05rem', color: 'white' }}
            />
          </div>
          <button type="submit" style={{ background: '#4573df', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 600, cursor: 'pointer', height: '56px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Search
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Popular:</span>
          {['React Developer', 'UI/UX Designer', 'Python Developer', 'Content Writer', 'SEO Expert'].map(tag => (
            <Link key={tag} href={`/freelancers?q=${encodeURIComponent(tag)}`} style={{ fontSize: '0.85rem', color: '#93c5fd', textDecoration: 'none', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(147,197,253,0.1)' }}>
              {tag}
            </Link>
          ))}
        </div>
      </header>

      {/* Section Links Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <Link href="/freelancers" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'all 0.25s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>Top Talent</h2>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.9rem' }}>Find the perfect specialist for your next big project.</p>
            <span style={{ color: '#4573df', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Browse Freelancers <ArrowRight size={14} />
            </span>
          </Link>

          <Link href="/gigs" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'all 0.25s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Package size={24} style={{ color: '#22c55e' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>Services (Gigs)</h2>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.9rem' }}>Fixed-price, ready-to-buy services from vetted pros.</p>
            <span style={{ color: '#4573df', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Browse Gigs <ArrowRight size={14} />
            </span>
          </Link>

          <Link href="/jobs" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'all 0.25s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Briefcase size={24} style={{ color: '#ca8a04' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>Jobs</h2>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.9rem' }}>Start pitching customized project requests tailored to you.</p>
            <span style={{ color: '#4573df', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Find Work <ArrowRight size={14} />
            </span>
          </Link>

          <Link href="/ai" style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', textDecoration: 'none', color: 'inherit', textAlign: 'center', transition: 'all 0.25s ease' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Bot size={24} style={{ color: '#a855f7' }} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>AI Tools</h2>
            <p style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.9rem' }}>Estimate prices, draft proposals, and advise your rates.</p>
            <span style={{ color: '#4573df', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              Use AI Hub <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Live Data Sections */}
      <Suspense fallback={<div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>Loading marketplace data...</div>}>
        <LiveDataSections />
      </Suspense>
    </main>
  );
}

async function LiveDataSections() {
  const [freelancers, gigs, projects] = await Promise.all([
    fetchFreelancers(),
    fetchGigs(),
    fetchProjects(),
  ]);

  return (
    <>
      {/* Featured Freelancers */}
      {freelancers.length > 0 && (
        <section style={{ padding: '3rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Featured Freelancers</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Top-rated talent ready for your project</p>
              </div>
              <Link href="/freelancers" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4573df', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {freelancers.map((f: any) => (
                <Link key={f.id} href={`/freelancers/${f.id}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#475569', flexShrink: 0 }}>
                      {f.profile_image_url ? <img src={f.profile_image_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} /> : (f.name?.charAt(0) || 'F')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 650, margin: '0 0 0.15rem', color: '#0f172a' }}>{f.name || 'Freelancer'}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.headline || f.bio?.substring(0, 50) || 'Freelancer'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>${f.hourly_rate || 0}/hr</span>
                    {f.avg_rating > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.8rem', color: '#ca8a04' }}>
                        <Star size={12} fill="#ca8a04" /> {Number(f.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Gigs */}
      {gigs.length > 0 && (
        <section style={{ padding: '3rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Popular Gigs</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Ready-to-buy services with fixed pricing</p>
              </div>
              <Link href="/gigs" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4573df', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {gigs.map((g: any) => (
                <Link key={g.id} href={`/gigs/${g.slug || g.id}`} style={{ borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white', textDecoration: 'none', color: 'inherit', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <div style={{ height: '140px', background: g.thumbnail_url ? `url(${g.thumbnail_url}) center/cover` : 'linear-gradient(135deg, #eff6ff, #f0f9ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!g.thumbnail_url && <Package size={32} style={{ color: '#93c5fd' }} />}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 650, margin: '0 0 0.5rem', color: '#0f172a', lineHeight: 1.3 }}>{g.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>${g.basic_price || g.price || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>
                        <Clock size={12} /> {g.basic_delivery_days || g.delivery_days || '?'} days
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Open Projects */}
      {projects.length > 0 && (
        <section style={{ padding: '3rem 2rem', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>Open Projects</h2>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Apply now and start earning</p>
              </div>
              <Link href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4573df', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.map((p: any) => (
                <Link key={p.id} href={`/projects/${p.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 650, margin: '0 0 0.25rem', color: '#0f172a' }}>{p.title}</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                      <span>{p.category || 'General'}</span>
                      <span>•</span>
                      <span>{p.budget_type === 'hourly' ? `$${p.budget_min || 0}-${p.budget_max || 0}/hr` : `$${p.budget_max || 'TBD'}`}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#94a3b8' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Stats */}
      <section style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4573df' }}>10K+</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Freelancers</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4573df' }}>5K+</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Projects Completed</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4573df' }}>11</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Free AI Tools</div>
          </div>
          <div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4573df' }}>24/7</div>
            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Support</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ExplorePage() {
  return <ExploreClient />;
}
