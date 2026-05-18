// @AI-HINT: Gigs directory - fetches real gigs from backend API
import React, { Suspense } from 'react';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import commonStyles from './Gigs.common.module.css';
import lightStyles from './Gigs.light.module.css';
import darkStyles from './Gigs.dark.module.css';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function fetchGigs() {
  try {
    const res = await fetch(`${API_URL}/api/v1/gigs?status=published&page=1&page_size=20`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || data.gigs || data || [];
  } catch {
    return [];
  }
}

export default async function GigsPage() {
  return (
    <main className={commonStyles.container}>
      <header className={commonStyles.header}>
        <h1 className={commonStyles.title}>Explore Services (Gigs)</h1>
        <p className={commonStyles.subtitle}>Pre-packaged services from top freelancers with clear pricing and delivery times.</p>
      </header>

      <section className={commonStyles.results}>
        <Suspense fallback={<div className={commonStyles.loader}>Loading gigs...</div>}>
          <GigList />
        </Suspense>
      </section>
    </main>
  );
}

async function GigList() {
  const gigs = await fetchGigs();
  if (gigs.length === 0) {
    return (
      <div className={commonStyles.empty}>
        <p>No gigs available yet. Check back soon or <Link href="/freelancers">browse freelancers</Link>.</p>
      </div>
    );
  }

  return (
    <div className={commonStyles.grid}>
      {gigs.map((g: any) => (
        <Link key={g.id} href={`/gigs/${g.slug || g.id}`} className={commonStyles.card}>
          <div className={commonStyles.cardImage}>
            {g.thumbnail_url ? (
              <img src={g.thumbnail_url} alt={g.title} className={commonStyles.cardImage} />
            ) : (
              <div className={commonStyles.cardImagePlaceholder}>{g.title.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <div className={commonStyles.cardBody}>
            <div className={commonStyles.cardMeta}>
              <span className={commonStyles.cardAuthor}>{g.seller_name || g.seller?.name || 'Freelancer'}</span>
              <span className={commonStyles.cardRating}>
                <Star size={14} className={commonStyles.starIcon} />
                {g.rating || 0} ({g.review_count || 0})
              </span>
            </div>
            <h3 className={commonStyles.cardTitle}>{g.title}</h3>
            <div className={commonStyles.cardFooter}>
              <span className={commonStyles.cardPrice}>
                ${g.basic_price || g.price || g.packages?.basic?.price || 0}
              </span>
              <span className={commonStyles.cardDelivery}>
                <Clock size={14} />
                {g.basic_delivery_days || g.delivery_days || g.packages?.basic?.delivery_days || '?'} days
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
