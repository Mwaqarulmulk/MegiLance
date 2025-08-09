// @AI-HINT: Client Reviews management. Theme-aware, accessible editor and animated reviews list.
'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
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

const MOCK_REVIEWS: Review[] = [
  { id: 'r-301', project: 'Marketing site build', freelancer: 'Alex Johnson', created: '2025-08-07', rating: 5, text: 'Exceptional work quality and speed. Great communication.' },
  { id: 'r-302', project: 'Design system v2', freelancer: 'Priya Sharma', created: '2025-07-30', rating: 4, text: 'Strong design direction and pixel-perfect delivery.' },
];

const Reviews: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;

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
    return MOCK_REVIEWS.filter(r =>
      (rating === 'All' || r.rating === rating) &&
      (!q || r.project.toLowerCase().includes(q) || r.freelancer.toLowerCase().includes(q) || r.text.toLowerCase().includes(q))
    );
  }, [query, rating]);

  const setStar = (value: number) => setNewRating(value);

  const canSubmit = newText.trim().length > 10 && newRating > 0;

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <div ref={headerRef} className={cn(common.header, headerVisible ? common.isVisible : common.isNotVisible)}>
          <div>
            <h1 className={common.title}>Reviews</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>Manage your reviews for completed work. Filter and add new feedback.</p>
          </div>
          <div className={common.controls} aria-label="Review filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search by project, freelancer, or text…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className={common.srOnly} htmlFor="rating">Rating</label>
            <select id="rating" className={cn(common.select, themed.select)} value={rating as any} onChange={(e) => setRating((e.target.value === 'All' ? 'All' : Number(e.target.value)) as any)}>
              <option>All</option>
              <option>5</option>
              <option>4</option>
              <option>3</option>
              <option>2</option>
              <option>1</option>
            </select>
          </div>
        </div>

        <section ref={listRef} className={cn(common.list, listVisible ? common.isVisible : common.isNotVisible)} aria-label="Reviews list">
          {filtered.map(r => (
            <article key={r.id} className={cn(common.card)}>
              <div className={cn(common.cardTitle, themed.cardTitle)}>{r.project}</div>
              <div className={cn(common.meta, themed.meta)}>
                <span>By {r.freelancer}</span>
                <span>•</span>
                <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span>•</span>
                <span>{r.created}</span>
              </div>
              <p>{r.text}</p>
            </article>
          ))}
          {filtered.length === 0 && (
            <div role="status" aria-live="polite">No reviews found.</div>
          )}
        </section>

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
                aria-label={`${n} star${n>1?'s':''}`}
              >
                {n <= newRating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <label htmlFor="text" className={common.srOnly}>Review text</label>
          <textarea id="text" className={cn(common.textarea, themed.textarea)} placeholder="Share your experience and outcomes…" value={newText} onChange={(e) => setNewText(e.target.value)} aria-invalid={!(newText.trim().length > 10)} />
          <div className={common.controls}>
            <button type="button" className={cn(common.button, 'secondary', themed.button)} onClick={() => { setNewText(''); setNewRating(0); }}>Clear</button>
            <button type="button" className={cn(common.button, 'primary', themed.button)} onClick={() => alert('Review submitted')} disabled={!canSubmit} aria-disabled={!canSubmit}>Submit Review</button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Reviews;
