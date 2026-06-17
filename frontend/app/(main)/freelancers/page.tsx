import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Top Freelancers Online | Browse Expert Talent — MegiLance',
  description: 'Browse and hire top-rated freelancers online on MegiLance. Vetted web developers, designers, data scientists, writers & 500+ skills. AI-matched talent, secure escrow, trusted by 10,000+ clients.',
  path: '/freelancers',
  keywords: getKeywordsForPage(['transactional', 'technology', 'longTail'], [
    'hire freelancers online', 'browse top freelancers', 'find verified freelancers',
    'vetted remote developers', 'top rated freelancers', 'expert freelancers for hire',
    'hire remote talent', 'freelancer profiles marketplace',
  ]),
});

// @AI-HINT: Freelancers Page - fetches real data from backend API
import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Briefcase } from 'lucide-react';
import commonStyles from './Freelancers.common.module.css';
import lightStyles from './Freelancers.light.module.css';
import darkStyles from './Freelancers.dark.module.css';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchFreelancers(query = '', page = 1, pageSize = 20) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (query) params.set('search', query);

    const res = await fetch(`${API_URL}/api/v1/users/freelancers?${params}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { items: [], total: 0 };
    return await res.json();
  } catch {
    return { items: [], total: 0 };
  }
}

function Loader() {
  return (
    <div className={commonStyles.grid}>
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div key={n} className={commonStyles.card}>
          <div className={commonStyles.cardHeader}>
            <div className={commonStyles.avatar} />
            <div className={commonStyles.cardMeta}>
              <div className={commonStyles.skeletonLine} style={{ width: '60%' }} />
              <div className={commonStyles.skeletonLine} style={{ width: '40%' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function FreelancersPage(props: { searchParams?: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  
  return (
    <main className={commonStyles.freelancers}>
      <header className={commonStyles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/images/hero/talent-hero.png"
            alt="MegiLance Talent Directory — browse AI-ranked verified freelancers with real-time availability and transparent rates"
            width={900}
            height={540}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
            style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '20px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15)' }}
          />
        </div>
        <h1 className={commonStyles.pageTitle}>Find Top Freelance Talent</h1>
        <p className={commonStyles.pageSubtitle}>Discover the perfect match for your next project with our AI-powered matchmaking algorithm.</p>

        <form action="/freelancers" method="GET" className={commonStyles.searchForm}>
          <input type="search" name="q" defaultValue={q} placeholder="Search skills, names, or expertise..." className={commonStyles.searchInput} />
          <button type="submit" className={commonStyles.searchSubmit}>Search</button>
        </form>
      </header>

      <section className={commonStyles.results}>
        <Suspense fallback={<Loader />} key={q}>
          <FreelancerList query={q} />
        </Suspense>
      </section>
    </main>
  );
}

async function FreelancerList({ query }: { query: string }) {
  const data = await fetchFreelancers(query);
  const freelancers = data.items || [];

  if (freelancers.length === 0) {
    return (
      <div className={commonStyles.emptyState}>
        <h3>No freelancers found</h3>
        <p>Try adjusting your search or <Link href="/client/find-talent">find talent</Link> to get matched.</p>
      </div>
    );
  }

  return (
    <>
      <div className={commonStyles.resultsHeader}>
        <p>{data.total || freelancers.length} freelancer{data.total !== 1 ? 's' : ''} found</p>
      </div>
      <div className={commonStyles.grid}>
        {freelancers.map((f: any) => {
          const skills = Array.isArray(f.skills) ? f.skills : [];
          const rating = Number(f.avg_rating || f.rating || 0);
          const reviews = Number(f.review_count || f.total_reviews || 0);
          return (
            <Link key={f.id} href={`/freelancers/${f.id}`} className={commonStyles.card}>
              <div className={commonStyles.cardHeader}>
                <div className={commonStyles.avatar}>
                  {f.profile_image_url ? (
                    <img src={f.profile_image_url} alt={f.name} className={commonStyles.avatarImage} />
                  ) : (
                    f.name?.charAt(0).toUpperCase() || 'F'
                  )}
                </div>
                <div className={commonStyles.cardMeta}>
                  <h2>{f.name || 'Freelancer'}</h2>
                  <p>{f.headline || f.bio?.substring(0, 80) || 'Freelancer'}</p>
                </div>
              </div>
              <div className={commonStyles.cardBody}>
                <div className={commonStyles.stats}>
                  <span className={commonStyles.rate}>${f.hourly_rate || 0}/hr</span>
                  {rating > 0 && (
                    <span className={commonStyles.rating}>
                      <Star size={14} className={commonStyles.starIcon} />
                      {rating.toFixed(1)} ({reviews})
                    </span>
                  )}
                </div>
                {f.location && (
                  <div className={commonStyles.location}>
                    <MapPin size={12} /> {f.location}
                  </div>
                )}
                {skills.length > 0 && (
                  <div className={commonStyles.skills}>
                    {skills.slice(0, 5).map((s: string) => (
                      <span key={s} className={commonStyles.skillBadge}>{s}</span>
                    ))}
                    {skills.length > 5 && <span className={commonStyles.skillBadge}>+{skills.length - 5}</span>}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
