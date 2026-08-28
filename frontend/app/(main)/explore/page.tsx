import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Explore MegiLance | Discover Freelance Jobs, Gigs & Platforms',
  description: 'Search MegiLance, the leading freelance job search engine and platform. Browse open freelance jobs near me, find job freelancer matches, explore active service gigs, and connect with top talent.',
  path: '/explore',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'freelance jobs', 'jobs at freelance', 'freelance platforms', 'freelance jobs near me',
    'find job freelancer', 'freelance job search engine', 'freelancer job', 'become a freelance',
    'explore freelancers', 'browse open projects', 'discover freelance talent',
  ]),
});

import React, { Suspense } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Briefcase, Users, Bot, TrendingUp, Star, Zap, ChevronRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchFreelancers() {
  try {
    const res = await fetch(`${API_URL}/api/v1/users/freelancers?page=1&page_size=12`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || data || [];
    return items
      .filter((f: any) => {
        const name = (f.name || '').toLowerCase();
        return !name.includes('test') && !name.includes('e2e') && !name.includes('dummy');
      })
      .slice(0, 6);
  } catch { return []; }
}

async function fetchProjects() {
  try {
    const res = await fetch(`${API_URL}/api/v1/projects?status=open&page=1&page_size=12`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.items || data.projects || data || [];
    return items
      .filter((p: any) => {
        const title = (p.title || '').toLowerCase();
        return !title.includes('test') && !title.includes('e2e') && !title.includes('demo');
      })
      .slice(0, 6);
  } catch { return []; }
}

function ExploreClient() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero Header with Search */}
      <header className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 text-xs font-semibold mb-6 text-blue-300 border border-blue-400/30">
          <Zap size={14} />
          <span>AI-Powered Search</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">Explore MegiLance</h1>
        <p className="text-lg text-slate-350 max-w-xl mx-auto">
          Discover top freelancers, ready-made services, and open jobs tailored to your skills.
        </p>

        {/* Search Bar */}
        <form action="/freelancers" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mt-8">
          <div className="flex-1 flex items-center gap-3 px-4 rounded-xl h-14 bg-white/10 border border-white/20 backdrop-blur-md">
            <Search size={20} className="text-slate-400" />
            <input
              type="search"
              name="q"
              placeholder="Search for skills, services, freelancers..."
              className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-slate-400"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-bold h-14 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Links */}
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap text-xs">
          <span className="text-slate-400">Popular:</span>
          {['React Developer', 'UI/UX Designer', 'Python Developer', 'Content Writer', 'SEO Expert'].map(tag => (
            <Link
              key={tag}
              href={`/freelancers?q=${encodeURIComponent(tag)}`}
              className="text-blue-300 px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/20 transition"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>

      {/* Section Links Grid */}
      <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/client/find-talent"
            className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Top Talent</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Find the perfect specialist for your next big project.</p>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              Browse Freelancers <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            href="/search?tab=jobs"
            className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Briefcase size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Projects</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Browse available projects tailored to your skills.</p>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              Find Work <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            href="/ai"
            className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm hover:shadow-md transition text-center flex flex-col items-center justify-between space-y-4 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Bot size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Tools</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estimate prices, draft proposals, and advise your rates.</p>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
              Use AI Hub <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* Live Data Sections */}
      <Suspense fallback={<div className="py-16 text-center text-slate-400">Loading marketplace data...</div>}>
        <LiveDataSections />
      </Suspense>
    </main>
  );
}

async function LiveDataSections() {
  const [freelancers, projects] = await Promise.all([
    fetchFreelancers(),
    fetchProjects(),
  ]);

  return (
    <>
      {/* Featured Freelancers */}
      {freelancers.length > 0 && (
        <section className="py-12 px-4 sm:px-6 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-850">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Featured Freelancers</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Top-rated talent ready for your project</p>
              </div>
              <Link href="/client/find-talent" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {freelancers.map((f: any) => (
                <Link
                  key={f.id}
                  href={`/freelancers/${f.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 overflow-hidden flex-shrink-0">
                      {f.profile_image_url ? (
                        <img src={f.profile_image_url} alt={f.name || 'Freelancer'} className="w-full h-full object-cover" />
                      ) : (
                        (f.name?.charAt(0) || 'F')
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{f.name || 'Freelancer'}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{f.headline || f.bio?.substring(0, 50) || 'Specialist'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-900 dark:text-white font-mono">${f.hourly_rate || 45}/hr</span>
                    {f.avg_rating > 0 && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" /> {Number(f.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Open Projects */}
      {projects.length > 0 && (
        <section className="py-12 px-4 sm:px-6 bg-slate-100/70 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-850">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Open Projects</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Apply now and start earning</p>
              </div>
              <Link href="/search?tab=jobs" className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {projects.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/jobs/${p.id}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{p.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{p.category || 'Engineering'}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {p.budget_type === 'hourly' ? `$${p.budget_min || 30}-${p.budget_max || 80}/hr` : `$${p.budget_max || 1200}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Platform Stats */}
      <section className="py-16 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">11</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Free AI Tools</div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">70+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Countries Supported</div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">0%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Launch Platform Fee</div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Milestone Escrow</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ExplorePage() {
  return <ExploreClient />;
}
