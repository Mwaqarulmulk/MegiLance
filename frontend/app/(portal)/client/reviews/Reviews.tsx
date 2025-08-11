// @AI-HINT: Client Reviews management. Theme-aware, accessible editor and animated reviews list.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { useClientData } from '@/hooks/useClient';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import Input from '@/app/components/Forms/Input';
import Select from '@/app/components/Forms/Select';
import Button from '@/app/components/Forms/Button';
import StarRating from '@/app/components/StarRating/StarRating';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import Textarea from '@/app/components/Forms/Textarea';
import common from './Reviews.common.module.css';
import light from './Reviews.light.module.css';
import dark from './Reviews.dark.module.css';

interface Review {
  avatarUrl?: string;
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
      avatarUrl: r.avatarUrl ?? '', // Mocked for now
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
        </section>

        <section ref={listRef} className={cn(common.list, listVisible ? common.isVisible : common.isNotVisible)} aria-live="polite">
          <h2 className={common.srOnly}>Review List</h2>
          {loading && (
            <div className={common.grid}>
              {[...Array(6)].map((_, i) => (
                <article key={i} className={cn(common.card, themed.card, common.skeleton)}>
                  <div className={common.cardHeader}>
                    <Skeleton height={40} width={40} className={common.avatarSkeleton} />
                    <div className={common.headerText}>
                      <Skeleton height={16} width={'60%'} />
                      <Skeleton height={12} width={'40%'} />
                    </div>
                  </div>
                  <Skeleton height={20} width={'80%'} className={common.ratingSkeleton} />
                  <Skeleton height={12} width={'90%'} />
                  <Skeleton height={12} width={'70%'} />
                </article>
              ))}
            </div>
          )}
          {error && <div className={common.error}>Failed to load reviews.</div>}
          {!loading && sorted.length > 0 && (
            <div className={common.grid}>
              {paged.map(r => (
                <article key={r.id} className={cn(common.card, themed.card)}>
                  <header className={common.cardHeader}>
                    <UserAvatar src={r.avatarUrl} alt={r.freelancer} size={40} />
                    <div className={common.headerText}>
                      <h3 className={common.freelancerName}>{r.freelancer}</h3>
                      <p className={common.projectName}>{r.project}</p>
                    </div>
                  </header>
                  <div className={common.cardBody}>
                    <StarRating rating={r.rating} />
                    <p className={common.reviewText}>{r.text}</p>
                  </div>
                  <footer className={common.cardFooter}>
                    <time dateTime={r.created}>{r.created}</time>
                  </footer>
                </article>
              ))}
            </div>
          )}
          {sorted.length === 0 && !loading && (
            <div className={common.emptyState} role="status" aria-live="polite">
              <h3>No reviews found</h3>
              <p>Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </section>

        {sorted.length > 0 && !loading && (
          <div className={common.paginationBar} role="navigation" aria-label="Pagination">
            <Button
              variant='secondary'
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pageSafe === 1}
              aria-label="Previous page"
            >Prev</Button>
            <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages}</span>
            <Button
              variant='secondary'
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={pageSafe === totalPages}
              aria-label="Next page"
            >Next</Button>
          </div>
        )}

        <section ref={editorRef} className={cn(common.editor, themed.editor, editorVisible ? common.isVisible : common.isNotVisible)} aria-labelledby="new-title">
          <h2 id="new-title" className={cn(common.sectionTitle, themed.sectionTitle)}>Leave a Review</h2>
          <div className={common.editorForm}>
            <StarRating rating={newRating} onRatingChange={setStar} isEditable={true} />
            <Textarea 
              id="review-text"
              placeholder="Share your experience and the outcomes of the project..."
              value={newText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewText(e.target.value)}
              minChars={10}
              maxChars={1000}
              helpText="Describe the quality, communication, and overall satisfaction."
            />
            <div className={common.editorActions}>
              <Button variant="secondary" onClick={() => { setNewText(''); setNewRating(0); }} title="Clear review form">Clear</Button>
              <Button variant="primary" onClick={() => alert('Review submitted')} disabled={!canSubmit} aria-disabled={!canSubmit} title="Submit your review">Submit Review</Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Reviews;
