// @AI-HINT: Freelancers browse page — public filterable grid with search, rate range, pagination, shimmer loading
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { usersApi } from '@/lib/api';
import Button from '@/app/components/atoms/Button/Button';
import {
  Star,
  Search,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import commonStyles from './FreelancersBrowse.common.module.css';
import lightStyles from './FreelancersBrowse.light.module.css';
import darkStyles from './FreelancersBrowse.dark.module.css';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FreelancerItem {
  id: number;
  name?: string;
  profile_image_url?: string;
  bio?: string;
  hourly_rate?: number | null;
  headline?: string;
  location?: string;
  skills?: string[] | string;
  rating?: number | null;
  experience_level?: string;
}

interface FreelancersPage {
  items: FreelancerItem[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseSkills(raw?: string[] | string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    /* non-JSON string — fall through */
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StarRating({ value, size = 13 }: { value: number; size?: number }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <span
      style={{ display: 'inline-flex', gap: 2 }}
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= filled ? '#f59e0b' : 'none'}
          color={n <= filled ? '#f59e0b' : '#d1d5db'}
        />
      ))}
    </span>
  );
}

type ThemeStyles = Record<string, string>;

function SkeletonCard({ ts }: { ts: ThemeStyles }) {
  return (
    <div className={cn(commonStyles.card, ts.card)}>
      <div className={commonStyles.cardTop}>
        <div className={cn(commonStyles.skeletonAvatar, commonStyles.shimmer)} />
        <div className={commonStyles.skeletonMeta}>
          <div className={cn(commonStyles.skeletonName, commonStyles.shimmer)} />
          <div className={cn(commonStyles.skeletonLine, commonStyles.shimmer)} />
        </div>
      </div>
      <div className={cn(commonStyles.skeletonSkills, commonStyles.shimmer)} />
      <div className={cn(commonStyles.skeletonBtn, commonStyles.shimmer)} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FreelancersBrowsePage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Data state
  const [items, setItems] = useState<FreelancerItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — searchInput is the raw typed value, appliedSearch is debounced
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');

  // Debounce search — reset page when it commits
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(searchInput);
      setPage(1);
    }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch freelancers whenever page / filters change
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { page, page_size: 12 };
      if (appliedSearch) params.search = appliedSearch;
      const minNum = minRate ? parseFloat(minRate) : NaN;
      const maxNum = maxRate ? parseFloat(maxRate) : NaN;
      if (!isNaN(minNum)) params.min_rate = minNum;
      if (!isNaN(maxNum)) params.max_rate = maxNum;

      const res = (await usersApi.getFreelancers(params)) as FreelancersPage;
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch {
      setError('Unable to load freelancers. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, minRate, maxRate]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Theme guard — must come after all hooks ──────────────────────────────
  if (!resolvedTheme) return null;
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleMinRate = (v: string) => {
    setMinRate(v);
    setPage(1);
  };
  const handleMaxRate = (v: string) => {
    setMaxRate(v);
    setPage(1);
  };
  const goPage = (n: number) => setPage(Math.max(1, Math.min(pages, n)));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <div className={commonStyles.inner}>

        {/* Header */}
        <header className={commonStyles.header}>
          <h1 className={cn(commonStyles.pageTitle, themeStyles.pageTitle)}>
            Browse Freelancers
          </h1>
          {!loading && total > 0 && (
            <p className={cn(commonStyles.pageCount, themeStyles.pageCount)}>
              {total.toLocaleString()} professional{total !== 1 ? 's' : ''} available
            </p>
          )}
        </header>

        {/* Filter bar */}
        <div className={cn(commonStyles.filterBar, themeStyles.filterBar)}>
          {/* Search */}
          <label
            className={cn(commonStyles.filterSearch, themeStyles.filterInput)}
            aria-label="Search freelancers"
          >
            <Search size={15} className={commonStyles.searchIcon} aria-hidden />
            <input
              type="search"
              placeholder="Search by name, skill, or bio…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={cn(commonStyles.searchInput, themeStyles.input)}
            />
          </label>

          {/* Min rate */}
          <div className={cn(commonStyles.rateGroup, themeStyles.filterInput)}>
            <span className={commonStyles.rateLabel} aria-hidden>$</span>
            <input
              type="number"
              placeholder="Min / hr"
              value={minRate}
              min={0}
              onChange={(e) => handleMinRate(e.target.value)}
              className={cn(commonStyles.rateInput, themeStyles.input)}
              aria-label="Minimum hourly rate"
            />
          </div>

          {/* Max rate */}
          <div className={cn(commonStyles.rateGroup, themeStyles.filterInput)}>
            <span className={commonStyles.rateLabel} aria-hidden>$</span>
            <input
              type="number"
              placeholder="Max / hr"
              value={maxRate}
              min={0}
              onChange={(e) => handleMaxRate(e.target.value)}
              className={cn(commonStyles.rateInput, themeStyles.input)}
              aria-label="Maximum hourly rate"
            />
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className={cn(commonStyles.errorBanner, themeStyles.errorBanner)}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Grid — skeleton / empty / results */}
        {loading ? (
          <div className={commonStyles.grid} aria-busy="true" aria-label="Loading freelancers">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonCard key={i} ts={themeStyles} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={cn(commonStyles.empty, themeStyles.empty)}>
            <Users size={52} strokeWidth={1.2} aria-hidden />
            <p>No freelancers match your search.</p>
            <p style={{ fontSize: '0.875rem', opacity: 0.65 }}>
              Try adjusting your filters or clearing the search.
            </p>
          </div>
        ) : (
          <div className={commonStyles.grid}>
            {items.map((f) => {
              const skills = parseSkills(f.skills).slice(0, 3);
              const displayName = f.name || 'Freelancer';
              const rating = f.rating ?? 0;

              return (
                <article
                  key={f.id}
                  className={cn(commonStyles.card, themeStyles.card)}
                >
                  {/* Avatar + meta */}
                  <div className={commonStyles.cardTop}>
                    {f.profile_image_url ? (
                      <img
                        src={f.profile_image_url}
                        alt={displayName}
                        className={cn(commonStyles.avatar, themeStyles.avatar)}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className={cn(
                          commonStyles.avatarFallback,
                          themeStyles.avatarFallback,
                        )}
                        aria-hidden
                      >
                        {getInitials(f.name)}
                      </div>
                    )}
                    <div className={commonStyles.cardMeta}>
                      <h2 className={cn(commonStyles.name, themeStyles.name)}>
                        {displayName}
                      </h2>
                      {f.headline && (
                        <p className={cn(commonStyles.headline, themeStyles.headline)}>
                          {f.headline}
                        </p>
                      )}
                      {f.location && (
                        <span className={cn(commonStyles.location, themeStyles.location)}>
                          <MapPin size={11} aria-hidden /> {f.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating + hourly rate */}
                  <div className={commonStyles.statsRow}>
                    <span className={commonStyles.ratingWrap}>
                      <StarRating value={rating} />
                      <span className={cn(commonStyles.ratingVal, themeStyles.ratingVal)}>
                        {rating > 0 ? rating.toFixed(1) : 'New'}
                      </span>
                    </span>
                    {f.hourly_rate != null && (
                      <span className={cn(commonStyles.rate, themeStyles.rate)}>
                        ${Math.round(f.hourly_rate)}
                        <span className={commonStyles.rateUnit}>/hr</span>
                      </span>
                    )}
                  </div>

                  {/* Top 3 skills */}
                  {skills.length > 0 && (
                    <div className={commonStyles.skills}>
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className={cn(commonStyles.skillTag, themeStyles.skillTag)}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div className={commonStyles.cardFooter}>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => router.push(`/freelancers/${f.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <nav
            className={cn(commonStyles.pagination, themeStyles.pagination)}
            aria-label="Freelancer list pagination"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => goPage(page - 1)}
              disabled={page <= 1}
              aria-label="Go to previous page"
            >
              <ChevronLeft size={16} aria-hidden /> Previous
            </Button>

            <span className={cn(commonStyles.pageInfo, themeStyles.pageInfo)}>
              {page} / {pages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goPage(page + 1)}
              disabled={page >= pages}
              aria-label="Go to next page"
            >
              Next <ChevronRight size={16} aria-hidden />
            </Button>
          </nav>
        )}

      </div>
    </div>
  );
}
