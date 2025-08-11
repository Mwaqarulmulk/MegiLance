// @AI-HINT: Client Reviews management. Theme-aware, accessible editor and animated reviews list.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import common from './Reviews.common.module.css';
import light from './Reviews.light.module.css';
import dark from './Reviews.dark.module.css';

interface Review {
  id: string;
  project: string;
  freelancer: string;
  created: string;
  rating: number; // 1..5
  text: string;
}

const Reviews: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { reviews, loading, error } = useClientData();

  const rows: Review[] = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    return (reviews as any[]).map((r, idx) => ({
      id: String(r.id ?? idx),
      project: r.projectTitle ?? r.project ?? 'Unknown Project',
      freelancer: r.freelancerName ?? r.freelancer ?? 'Unknown',
      created: r.date ?? r.createdAt ?? r.created ?? '',
      rating: Number(r.rating) || 0,
      text: r.comment ?? r.text ?? '',
    }));
  }, [reviews]);

  const [query, setQuery] = useState('');
  const [rating, setRating] = useState<number | 'All'>('All');

  const [newText, setNewText] = useState('');
  const [newRating, setNewRating] = useState(0);

  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const headerVisible = useIntersectionObserver(headerRef, { threshold: 0.1 });
  const listVisible = useIntersectionObserver(listRef, { threshold: 0.1 });
  const editorVisible = useIntersectionObserver(editorRef, { threshold: 0.1 });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(r =>
      (rating === 'All' || r.rating === rating) &&
      (!q || r.project.toLowerCase().includes(q) || r.freelancer.toLowerCase().includes(q) || r.text.toLowerCase().includes(q))
    );
  }, [rows, query, rating]);

  // Sorting
  type SortKey = 'project' | 'freelancer' | 'created' | 'rating';
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'project': av = a.project; bv = b.project; break;
        case 'freelancer': av = a.freelancer; bv = b.freelancer; break;
        case 'created': av = a.created; bv = b.created; break;
        case 'rating': av = a.rating; bv = b.rating; break;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  React.useEffect(() => { setPage(1); }, [sortKey, sortDir, query, rating, pageSize]);

  const setStar = (value: number) => setNewRating(value);

  const canSubmit = newText.trim().length > 10 && newRating > 0;

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <section ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="review-controls-title">
          <h2 id="review-controls-title" className={common.srOnly}>Review Controls</h2>
          <div>
            <h1 className={common.title}>Reviews</h1>
            <p className={common.subtitle}>Manage and respond to client feedback.</p>
          </div>
          <div className={common.controls}>
            <input type="search" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} className={cn(common.input, themed.input)} title="Search by project, freelancer, or text" />
            <select value={rating} onChange={e => setRating(e.target.value === 'All' ? 'All' : Number(e.target.value))} className={cn(common.select, themed.select)} title="Filter by rating">
              <option value="All">All Ratings</option>
              {[5,4,3,2,1].map(s => <option key={s} value={s}>{`${s} star${s > 1 ? 's' : ''}`}</option>)}
            </select>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} className={cn(common.select, themed.select)} title="Sort by">
              <option value="created">Date</option>
              <option value="rating">Rating</option>
              <option value="project">Project</option>
              <option value="freelancer">Freelancer</option>
            </select>
            <button type="button" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className={cn(common.button, themed.button)} title={`Sort ${sortDir === 'asc' ? 'descending' : 'ascending'}`}>
              {sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </section>



        <section
          ref={listRef}
          className={cn(common.list, listVisible ? common.isVisible : common.isNotVisible)}
          aria-labelledby="reviews-list-title"
          aria-busy={loading}
        >
          <h2 id="reviews-list-title" className={common.srOnly}>Reviews List</h2>
          <div className={common.srOnly} role="status" aria-live="polite">
            {paged.length > 0 ? `Showing ${paged.length} of ${sorted.length} reviews.` : 'No reviews match your criteria.'}
          </div>
          {loading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <article key={i} className={cn(common.card)}>
                  <div className={cn(common.cardTitle, themed.cardTitle)}>
                    <Skeleton height={16} width={'50%'} />
                  </div>
                  <div className={cn(common.meta, themed.meta)}>
                    <Skeleton height={12} width={120} />
                    <Skeleton height={12} width={60} />
                    <Skeleton height={12} width={90} />
                  </div>
                  <Skeleton height={12} width={'80%'} />
                  <Skeleton height={12} width={'60%'} />
                </article>
              ))}
            </>
          )}
          {error && <div className={common.error}>Failed to load reviews.</div>}
          {!loading && paged.map(r => (
            <article key={r.id} className={cn(common.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>{r.project}</div>
              <div className={cn(common.meta, themed.meta)}>
                <span>By {r.freelancer}</span>
                <span>•</span>
                <span role="img" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span>•</span>
                <span>{r.created}</span>
              </div>
              <p>{r.text}</p>
            </article>
          ))}
          {sorted.length === 0 && !loading && (
            <div role="status" aria-live="polite">No reviews found.</div>
          )}
        </section>
        {sorted.length > 0 && (
          <div className={common.paginationBar} role="navigation" aria-label="Pagination">
            <button
              type="button"
              className={cn(common.button, themed.button, 'secondary')}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              aria-label="Previous page"
            >Prev</button>
            <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} · {sorted.length} result(s)</span>
            <button
              type="button"
              className={cn(common.button, themed.button)}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              aria-label="Next page"
            >Next</button>
          </div>
        )}

        <section ref={editorRef} className={cn(common.editor, themed.editor, editorVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="new-title">
          <h2 id="new-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Add a Review</h2>
          <div className={common.stars} role="radiogroup" aria-label="Rating">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                className={common.starBtn}
                aria-pressed={newRating === n}
                onClick={() => setStar(n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                title={`${n} star${n > 1 ? 's' : ''}`}
              >
                {n <= newRating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <label htmlFor="text" className={common.srOnly}>Review text</label>
          <textarea id="text" className={cn(common.textarea, themed.textarea)} placeholder="Share your experience and outcomes…" value={newText} onChange={(e) => setNewText(e.target.value)} aria-invalid={newText.trim().length > 0 && newText.trim().length <= 10} title="Review text (minimum 10 characters)" />
          <div className={common.controls}>
            <button type="button" className={cn(common.button, 'secondary', themed.button)} onClick={() => { setNewText(''); setNewRating(0); }} title="Clear review form">Clear</button>
            <button type="button" className={cn(common.button, 'primary', themed.button)} onClick={() => alert('Review submitted')} disabled={!canSubmit} aria-disabled={!canSubmit} title="Submit your review">Submit Review</button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Reviews;
