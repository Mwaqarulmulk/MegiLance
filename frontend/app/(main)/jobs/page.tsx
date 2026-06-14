import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Freelance Jobs Online | Find Remote Work & Projects — MegiLance',
  description: 'Find the best freelance jobs online on MegiLance. Hundreds of remote projects in web development, design, writing, data science, and more. Get AI-matched to jobs that fit your exact skills.',
  path: '/jobs',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'freelance jobs online', 'remote freelance projects', 'find freelance work',
    'get freelance jobs', 'remote work for developers', 'online project work',
    'best freelance job boards', 'AI matched freelance jobs', 'freelance jobs for beginners',
  ]),
});

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Search, Clock, DollarSign, MapPin, Briefcase, ArrowRight, Filter, ChevronRight, Star, Users, Zap, TrendingUp, ExternalLink } from 'lucide-react';
import commonStyles from './Jobs.common.module.css';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchProjects(params: { search?: string; category?: string; status?: string; page?: number; page_size?: number } = {}) {
  try {
    const searchParams = new URLSearchParams();
    searchParams.set('status', params.status || 'open');
    searchParams.set('page', String(params.page || 1));
    searchParams.set('page_size', String(params.page_size || 30));
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);

    const res = await fetch(`${API_URL}/api/v1/projects?${searchParams}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { items: [], total: 0 };
    const data = await res.json();
    return { items: data.items || data.projects || data || [], total: data.total || 0 };
  } catch {
    return { items: [], total: 0 };
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/api/v1/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data.categories || data || [];
  } catch {
    return [];
  }
}

function SkeletonLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <div key={n} style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e2e8f0' }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: '18px', width: '60%', borderRadius: '6px', background: '#e2e8f0', marginBottom: '0.5rem' }} />
              <div style={{ height: '14px', width: '40%', borderRadius: '6px', background: '#e2e8f0' }} />
            </div>
          </div>
          <div style={{ height: '14px', width: '90%', borderRadius: '6px', background: '#e2e8f0', marginBottom: '0.5rem' }} />
          <div style={{ height: '14px', width: '70%', borderRadius: '6px', background: '#e2e8f0' }} />
        </div>
      ))}
    </div>
  );
}

export default async function JobsPage(props: { searchParams?: Promise<{ q?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const category = searchParams?.category || '';

  const [projectsData, categories] = await Promise.all([
    fetchProjects({ search: q, category }),
    fetchCategories(),
  ]);

  const projects = projectsData.items;
  const total = projectsData.total || projects.length;

  const defaultCategories = [
    { name: 'Web Development', slug: 'web-development', icon: '💻' },
    { name: 'Mobile Apps', slug: 'mobile-apps', icon: '📱' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', icon: '✨' },
    { name: 'Data Science & AI', slug: 'data-science-ai', icon: '🧠' },
    { name: 'Writing & Content', slug: 'writing-content', icon: '✍️' },
    { name: 'Digital Marketing', slug: 'digital-marketing', icon: '📈' },
    { name: 'DevOps & Cloud', slug: 'devops-cloud', icon: '☁️' },
    { name: 'Blockchain', slug: 'blockchain', icon: '🔗' },
  ];

  const displayCategories = categories.length > 0
    ? categories.map((c: any) => ({ name: c.name, slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-'), icon: c.icon || '📌' }))
    : defaultCategories;

  return (
    <main style={{ minHeight: '100vh' }}>
      {/* Hero Header */}
      <header style={{ textAlign: 'center', padding: '3rem 2rem 2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(69,115,223,0.2)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', color: '#93c5fd' }}>
          <Zap size={14} />
          <span>AI-Matched to Your Skills</span>
        </div>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>Find Freelance Jobs</h1>
        <p style={{ fontSize: '1.15rem', color: '#94a3b8', margin: 0, maxWidth: '600px', marginInline: 'auto' }}>
          Apply to open projects and build your freelance business. {total > 0 ? `${total} projects available.` : ''}
        </p>

        {/* Search Bar */}
        <form action="/jobs" method="GET" style={{ display: 'flex', gap: '0.75rem', maxWidth: '680px', margin: '1.5rem auto 0' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', borderRadius: '12px', height: '52px', background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.15)' }}>
            <Search size={18} style={{ opacity: 0.5 }} />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search jobs by skill, title, or keyword..."
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', color: 'white' }}
            />
          </div>
          <button type="submit" style={{ background: '#4573df', color: 'white', border: 'none', padding: '0 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', height: '52px' }}>
            Search
          </button>
        </form>
      </header>

      {/* Category Pills */}
      {displayCategories.length > 0 && (
        <div style={{ padding: '1rem 2rem', overflowX: 'auto', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
            <Link
              href="/jobs"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '999px',
                border: '1.5px solid', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none',
                ...(category === '' ? { background: '#4573df', color: 'white', borderColor: '#4573df' } : { background: 'transparent', color: '#475569', borderColor: '#e2e8f0' }),
              }}
            >
              All Jobs
            </Link>
            {displayCategories.map((c: any) => (
              <Link
                key={c.slug}
                href={`/jobs?category=${encodeURIComponent(c.slug)}${q ? `&q=${q}` : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '999px',
                  border: '1.5px solid', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap',
                  ...(category === c.slug ? { background: '#4573df', color: 'white', borderColor: '#4573df' } : { background: 'transparent', color: '#475569', borderColor: '#e2e8f0' }),
                }}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0 }}>
            {total > 0 ? `${total} project${total !== 1 ? 's' : ''} available` : 'No projects found'}
            {q && <span> for &ldquo;{q}&rdquo;</span>}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
              Post a Project
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <Suspense fallback={<SkeletonLoader />} key={`${q}-${category}`}>
          <JobsList projects={projects} />
        </Suspense>

        {/* CTA Section */}
        <div style={{ marginTop: '4rem', padding: '3rem', borderRadius: '20px', background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', textAlign: 'center', border: '1px solid #dbeafe' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.75rem', color: '#0f172a' }}>Can&apos;t find what you&apos;re looking for?</h2>
          <p style={{ fontSize: '1.05rem', color: '#64748b', margin: '0 0 1.5rem', maxWidth: '500px', marginInline: 'auto' }}>
            Post your project and let our AI match you with the best freelancers for your needs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
              Post a Project <ArrowRight size={16} />
            </Link>
            <Link href="/freelancers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '10px', background: 'white', color: '#4573df', textDecoration: 'none', fontWeight: 600, border: '1px solid #dbeafe' }}>
              Browse Freelancers <Users size={16} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

async function JobsList({ projects }: { projects: any[] }) {
  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Briefcase size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No open projects found</h3>
        <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>Try adjusting your search or post a project to get started.</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/post-project" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', background: '#4573df', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Post a Project
          </Link>
          <Link href="/freelancers" style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#475569', textDecoration: 'none', fontWeight: 600 }}>
            Browse Freelancers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {projects.map((project: any) => {
        const skills = Array.isArray(project.skills) ? project.skills : [];
        const budgetMin = project.budget_min || 0;
        const budgetMax = project.budget_max || 0;
        const budgetType = project.budget_type || 'fixed';
        const proposalCount = project.proposal_count || project.proposals_count || 0;
        const postedDate = project.created_at ? new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            style={{
              display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem',
              borderRadius: '14px', border: '1.5px solid #e2e8f0', background: 'white',
              textDecoration: 'none', color: 'inherit', transition: 'all 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  {project.status === 'urgent' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                      🔥 Urgent
                    </span>
                  )}
                  {project.is_featured && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a' }}>
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 650, lineHeight: 1.35 }}>{project.title || 'Untitled Project'}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <DollarSign size={14} />
                    {budgetType === 'hourly'
                      ? `$${budgetMin}-${budgetMax}/hr`
                      : budgetMin && budgetMax
                        ? `$${budgetMin.toLocaleString()}-${budgetMax.toLocaleString()}`
                        : budgetMin
                          ? `From $${budgetMin.toLocaleString()}`
                          : 'Budget TBD'}
                  </span>
                  {project.category && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Briefcase size={14} />
                      {project.category}
                    </span>
                  )}
                  {postedDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} />
                      {postedDate}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {budgetType === 'hourly'
                  ? `$${budgetMin}-${budgetMax}/hr`
                  : budgetMax
                    ? `$${budgetMax.toLocaleString()}`
                    : 'TBD'}
              </div>
            </div>

            {project.description && (
              <p style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, fontSize: '0.92rem', color: '#64748b', margin: 0 }}>
                {project.description}
              </p>
            )}

            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.slice(0, 6).map((s: string) => (
                  <span key={s} style={{ fontSize: '0.78rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontWeight: 500, background: '#f1f5f9', color: '#475569' }}>
                    {s}
                  </span>
                ))}
                {skills.length > 6 && (
                  <span style={{ fontSize: '0.78rem', padding: '0.2rem 0.7rem', borderRadius: '999px', fontWeight: 500, background: '#f1f5f9', color: '#94a3b8', fontStyle: 'italic' }}>
                    +{skills.length - 6} more
                  </span>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748b' }}>
                {project.client_name && (
                  <>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                      {project.client_name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{project.client_name}</span>
                    {project.client_verified && (
                      <span style={{ color: '#22c55e' }}>✔</span>
                    )}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {proposalCount > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#64748b' }}>
                    <Users size={14} />
                    {proposalCount} proposal{proposalCount !== 1 ? 's' : ''}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 600, color: '#4573df' }}>
                  View Details
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
