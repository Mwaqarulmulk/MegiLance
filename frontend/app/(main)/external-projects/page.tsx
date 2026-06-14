import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'External Projects | Browse Freelance Work from Top Platforms — MegiLance',
  description: 'Discover external freelance projects aggregated from Upwork, Freelancer, Fiverr, and more. Apply directly or use MegiLance to find matching local opportunities.',
  path: '/external-projects',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'external freelance projects', 'upwork projects', 'freelancer.com projects',
    'aggregated freelance jobs', 'cross-platform freelance work', 'external project listings',
  ]),
});

import React, { Suspense } from 'react';
import Link from 'next/link';
import { ExternalLink, Globe, Clock, DollarSign, Briefcase, Search, ArrowRight, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchExternalProjects(params: { query?: string; category?: string; source?: string; page?: number } = {}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(params.page || 1));
    searchParams.set('page_size', '20');
    if (params.query) searchParams.set('query', params.query);
    if (params.category) searchParams.set('category', params.category);
    if (params.source) searchParams.set('source', params.source);

    const res = await fetch(`${API_URL}/api/v1/external-projects?${searchParams}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/v1/external-projects/categories`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.categories || data || [];
  } catch {
    return [];
  }
}

function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ height: '18px', width: '60%', borderRadius: '6px', background: '#e2e8f0', marginBottom: '0.75rem' }} />
          <div style={{ height: '14px', width: '40%', borderRadius: '6px', background: '#e2e8f0', marginBottom: '0.75rem' }} />
          <div style={{ height: '14px', width: '90%', borderRadius: '6px', background: '#e2e8f0' }} />
        </div>
      ))}
    </div>
  );
}

export default async function ExternalProjectsPage(props: { searchParams?: Promise<{ q?: string; category?: string; source?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const category = searchParams?.category || '';
  const source = searchParams?.source || '';

  const [projectsData, categories] = await Promise.all([
    fetchExternalProjects({ query: q, category, source }),
    fetchCategories(),
  ]);

  const projects = projectsData?.projects || [];
  const total = projectsData?.total || projects.length;
  const sources = projectsData?.sources || [];
  const lastScraped = projectsData?.last_scraped;

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '3rem 2rem 2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(69,115,223,0.2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#93c5fd' }}>
          <Globe size={14} />
          <span>Aggregated from 5+ Platforms</span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>External Projects</h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Browse freelance projects aggregated from Upwork, Freelancer, Fiverr, and more.
        </p>

        {/* Search Bar */}
        <form action="/external-projects" method="GET" style={{ display: 'flex', gap: '0.75rem', maxWidth: '680px', margin: '1.5rem auto 0' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', borderRadius: '12px', height: '52px', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <Search size={18} style={{ opacity: 0.5 }} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search external projects..."
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'white' }}
            />
          </div>
          <button type="submit" style={{ background: '#4573df', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', height: '52px' }}>
            Search
          </button>
        </form>
      </header>

      {/* Filters */}
      {sources.length > 0 && (
        <div style={{ padding: '1rem 2rem', overflowX: 'auto', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '0.5rem' }}>Source:</span>
            <Link
              href="/external-projects"
              style={{
                padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
                ...(!source ? { background: '#4573df', color: 'white', borderColor: '#4573df' } : { background: 'transparent', color: '#475569', borderColor: '#e2e8f0' }),
              }}
            >
              All Sources
            </Link>
            {sources.map((s: string) => (
              <Link
                key={s}
                href={`/external-projects?source=${encodeURIComponent(s)}${q ? `&q=${q}` : ''}`}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1.5px solid', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
                  ...(source === s ? { background: '#4573df', color: 'white', borderColor: '#4573df' } : { background: 'transparent', color: '#475569', borderColor: '#e2e8f0' }),
                }}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Info Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderRadius: '12px', background: '#eff6ff', border: '1px solid #dbeafe', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#1e40af' }}>
          <AlertCircle size={18} />
          <span>
            Projects sourced from external platforms. Apply directly on the source platform or find similar projects on{' '}
            <Link href="/jobs" style={{ fontWeight: 600, color: '#4573df' }}>MegiLance</Link>.
          </span>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            {total > 0 ? `${total} project${total !== 1 ? 's' : ''} found` : 'No external projects found'}
            {lastScraped && <span> · Last updated: {new Date(lastScraped).toLocaleDateString()}</span>}
          </p>
        </div>

        <Suspense fallback={<SkeletonLoader />} key={`${q}-${category}-${source}`}>
          <ExternalProjectsList projects={projects} />
        </Suspense>

        {/* CTA */}
        <div style={{ marginTop: '4rem', padding: '3rem', borderRadius: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', textAlign: 'center', border: '1px solid #dbeafe' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#0f172a' }}>Want better matches?</h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 1.5rem', maxWidth: '500px', marginInline: 'auto' }}>
            MegiLance offers AI-matched projects tailored to your skills with secure escrow payments.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
              Browse MegiLance Jobs <ArrowRight size={16} />
            </Link>
            <Link href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #dbeafe', background: 'white', color: '#4573df', textDecoration: 'none', fontWeight: 600 }}>
              Post a Project
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

async function ExternalProjectsList({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Globe size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No external projects available</h3>
        <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>Check back later or browse projects directly on MegiLance.</p>
        <Link href="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
          Browse MegiLance Jobs <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {projects.map((project: any, idx: number) => {
        const source = project.source || 'Unknown';
        const budget = project.budget || project.budget_max || 'TBD';
        const skills = Array.isArray(project.skills) ? project.skills : project.tags || [];

        return (
          <div
            key={project.id || idx}
            style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem',
              borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{ padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', color: '#475569' }}>
                    {source}
                  </span>
                  {project.category && (
                    <span style={{ padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, background: '#eff6ff', color: '#3b82f6' }}>
                      {project.category}
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 650, lineHeight: 1.35 }}>
                  {project.title || 'Untitled Project'}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>
                  {budget && budget !== 'TBD' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <DollarSign size={14} /> {budget}
                    </span>
                  )}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4573df', textDecoration: 'none' }}>
                      <ExternalLink size={14} /> View Original
                    </a>
                  )}
                </div>
              </div>
            </div>

            {project.description && (
              <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                {project.description}
              </p>
            )}

            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.slice(0, 5).map((s: any, i: number) => {
                  const label = typeof s === 'string' ? s : (s?.name || String(s));
                  return (
                    <span key={label || i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 500, background: '#f1f5f9', color: '#475569' }}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
              {project.apply_url || project.url ? (
                <a
                  href={project.apply_url || project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Apply on {source} <ExternalLink size={14} />
                </a>
              ) : (
                <Link
                  href="/jobs"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '8px', background: '#f1f5f9', color: '#475569', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Find Similar on MegiLance
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
