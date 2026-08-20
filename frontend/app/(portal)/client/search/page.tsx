// @AI-HINT: Client Search — auto-loads freelancers on mount, sidebar filters, category pills, rich cards
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/atoms/Button/Button';
import Loading from '@/app/components/atoms/Loading/Loading';
import EmptyState from '@/app/components/molecules/EmptyState/EmptyState';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { searchApi } from '@/lib/api';
import {
  Search, Filter, Star, MapPin, DollarSign, Briefcase, MessageSquare, Heart,
  SlidersHorizontal, ChevronLeft, ChevronRight, X, CheckCircle, Users, UserPlus,
  Code, Palette, PenTool, Megaphone, BarChart3, Cpu, Globe, Zap,
  RefreshCw, Award, Clock, TrendingUp,
} from 'lucide-react';
import commonStyles from './Search.common.module.css';
import lightStyles from './Search.light.module.css';
import darkStyles from './Search.dark.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All Talent', icon: Users },
  { id: 'web-development', label: 'Web Dev', icon: Code },
  { id: 'mobile', label: 'Mobile', icon: Cpu },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'data', label: 'Data & AI', icon: BarChart3 },
  { id: 'devops', label: 'DevOps', icon: Globe },
  { id: 'ai-ml', label: 'AI/ML', icon: Zap },
];

const RATE_RANGES = [
  { id: 'all', label: 'Any Rate', min: undefined as number | undefined, max: undefined as number | undefined },
  { id: 'budget', label: 'Under $50/hr', min: 0, max: 50 },
  { id: 'mid', label: '$50–$100/hr', min: 50, max: 100 },
  { id: 'professional', label: '$100–$150/hr', min: 100, max: 150 },
  { id: 'expert', label: '$150+/hr', min: 150, max: undefined as number | undefined },
];

const EXPERIENCE_LEVELS = [
  { id: '', label: 'Any Level' },
  { id: 'entry', label: 'Entry Level' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'rate_low', label: 'Rate: Low → High' },
  { value: 'rate_high', label: 'Rate: High → Low' },
  { value: 'jobs', label: 'Most Jobs Done' },
];

const ITEMS_PER_PAGE = 12;

interface Freelancer {
  id: string;
  name: string;
  title: string;
  avatar_url?: string;
  rating: number;
  reviews_count: number;
  hourly_rate: number;
  location: string;
  skills: string[];
  completed_jobs: number;
  availability?: boolean;
  experience_level?: string;
  job_success_score?: number;
  is_top_rated?: boolean;
  response_time?: string;
}

export default function ClientSearchPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [category, setCategory] = useState('all');
  const [filters, setFilters] = useState({
    rateRange: 'all',
    location: '',
    minRating: '',
    experienceLevel: '',
    availableOnly: false,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(searchQuery); setCurrentPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const rateConfig = RATE_RANGES.find(r => r.id === filters.rateRange);
      const params: Record<string, any> = {};
      if (rateConfig?.min !== undefined) params.hourly_rate_min = rateConfig.min;
      if (rateConfig?.max !== undefined) params.hourly_rate_max = rateConfig.max;
      if (filters.location) params.location = filters.location;
      if (filters.experienceLevel) params.experience_level = filters.experienceLevel;
      if (category !== 'all') params.category = category;

      const response = await searchApi.freelancers(debouncedQuery || '', params);
      const results = Array.isArray(response) ? response : (response as any).freelancers || [];
      setFreelancers(results.map((f: any) => ({
        id: f.id?.toString() || '',
        name: f.name || f.full_name || 'Freelancer',
        title: f.title || f.headline || 'Freelancer',
        avatar_url: f.avatar_url || f.profile_image_url,
        rating: f.rating || f.avg_rating || 4.5,
        reviews_count: f.reviews_count || 0,
        hourly_rate: f.hourly_rate || 0,
        location: f.location || 'Remote',
        skills: Array.isArray(f.skills) ? f.skills : typeof f.skills === 'string' ? f.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        completed_jobs: f.completed_jobs || f.completed_projects || 0,
        availability: f.availability ?? true,
        experience_level: f.experience_level,
        job_success_score: f.job_success_score,
        is_top_rated: f.is_top_rated || (f.rating >= 4.8 && (f.completed_jobs || 0) >= 10),
        response_time: f.response_time,
      })));
    } catch (err) {
      console.error('Failed to load freelancers:', err);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, category, filters.rateRange, filters.location, filters.experienceLevel]);

  useEffect(() => {
    if (mounted) fetchFreelancers();
  }, [mounted, fetchFreelancers]);

  const sortedFreelancers = useMemo(() => {
    let list = [...freelancers];
    if (filters.minRating) list = list.filter(f => f.rating >= parseFloat(filters.minRating));
    if (filters.availableOnly) list = list.filter(f => f.availability !== false);
    switch (sortBy) {
      case 'rating': return list.sort((a, b) => b.rating - a.rating);
      case 'rate_low': return list.sort((a, b) => a.hourly_rate - b.hourly_rate);
      case 'rate_high': return list.sort((a, b) => b.hourly_rate - a.hourly_rate);
      case 'jobs': return list.sort((a, b) => b.completed_jobs - a.completed_jobs);
      default: return list;
    }
  }, [freelancers, sortBy, filters.minRating, filters.availableOnly]);

  const totalPages = Math.max(1, Math.ceil(sortedFreelancers.length / ITEMS_PER_PAGE));
  const paginatedFreelancers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedFreelancers.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedFreelancers, currentPage]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ rateRange: 'all', location: '', minRating: '', experienceLevel: '', availableOnly: false });
    setCategory('all');
    setCurrentPage(1);
  }, []);

  const setFilter = useCallback((key: string, val: any) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  }, []);

  const activeFilterCount = [
    filters.rateRange !== 'all', filters.location, filters.minRating,
    filters.experienceLevel, filters.availableOnly, category !== 'all',
  ].filter(Boolean).length;

  const themed = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;
  if (!mounted) return <Loading />;

  const renderSidebarFilters = () => (
    <div className={commonStyles.filterGroups}>
      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Hourly Rate</h4>
        <div className={commonStyles.filterOptions}>
          {RATE_RANGES.map(r => (
            <label key={r.id} className={cn(commonStyles.filterOption, themed.filterOption)}>
              <input type="radio" name="rate" checked={filters.rateRange === r.id} onChange={() => setFilter('rateRange', r.id)} className="sr-only" />
              <span className={cn(commonStyles.filterRadio, themed.filterRadio, filters.rateRange === r.id && commonStyles.filterRadioActive, filters.rateRange === r.id && themed.filterRadioActive)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Experience Level</h4>
        <div className={commonStyles.filterOptions}>
          {EXPERIENCE_LEVELS.map(l => (
            <label key={l.id} className={cn(commonStyles.filterOption, themed.filterOption)}>
              <input type="radio" name="exp" checked={filters.experienceLevel === l.id} onChange={() => setFilter('experienceLevel', l.id)} className="sr-only" />
              <span className={cn(commonStyles.filterRadio, themed.filterRadio, filters.experienceLevel === l.id && commonStyles.filterRadioActive, filters.experienceLevel === l.id && themed.filterRadioActive)} />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Minimum Rating</h4>
        <div className={commonStyles.filterOptions}>
          {[{ v: '', l: 'Any Rating' }, { v: '4.5', l: '4.5+ stars' }, { v: '4', l: '4.0+ stars' }, { v: '3.5', l: '3.5+ stars' }].map(opt => (
            <label key={opt.v} className={cn(commonStyles.filterOption, themed.filterOption)}>
              <input type="radio" name="rating" checked={filters.minRating === opt.v} onChange={() => setFilter('minRating', opt.v)} className="sr-only" />
              <span className={cn(commonStyles.filterRadio, themed.filterRadio, filters.minRating === opt.v && commonStyles.filterRadioActive, filters.minRating === opt.v && themed.filterRadioActive)} />
              <span>{opt.l}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Location</h4>
        <input
          type="text"
          placeholder="e.g. Remote, USA, London..."
          value={filters.location}
          onChange={e => setFilter('location', e.target.value)}
          className={cn(commonStyles.filterTextInput, themed.filterTextInput)}
        />
      </div>

      <div className={commonStyles.filterGroup}>
        <label className={cn(commonStyles.checkOption, themed.checkOption)}>
          <input type="checkbox" checked={filters.availableOnly} onChange={e => setFilter('availableOnly', e.target.checked)} className="sr-only" />
          <span className={cn(commonStyles.checkBox, themed.checkBox, filters.availableOnly && commonStyles.checkBoxActive, filters.availableOnly && themed.checkBoxActive)}>
            {filters.availableOnly && <CheckCircle size={11} />}
          </span>
          <span>Available now only</span>
        </label>
      </div>

      {activeFilterCount > 0 && (
        <button className={cn(commonStyles.clearAllBtn, themed.clearAllBtn)} onClick={clearFilters}>
          <RefreshCw size={13} /> Clear all ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className={cn(commonStyles.page, themed.page)}>
        <ScrollReveal>
          <header className={commonStyles.pageHeader}>
            <div>
              <h1 className={cn(commonStyles.title, themed.title)}>Find Talent</h1>
              <p className={cn(commonStyles.subtitle, themed.subtitle)}>
                {sortedFreelancers.length > 0
                  ? `${sortedFreelancers.length} skilled freelancer${sortedFreelancers.length !== 1 ? 's' : ''} available`
                  : 'Find the perfect freelancer for your project'}
              </p>
            </div>
          </header>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <div className={cn(commonStyles.searchBox, themed.searchBox)}>
            <div className={commonStyles.searchRow}>
              <div className={commonStyles.searchInputWrapper}>
                <Search size={18} className={commonStyles.searchIconInner} />
                <input
                  type="text"
                  placeholder="Search by skill, name, or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(commonStyles.searchInput, themed.searchInput)}
                  aria-label="Search freelancers"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className={commonStyles.searchClearBtn} aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>
              <button
                className={cn(commonStyles.mobileFilterBtn, themed.mobileFilterBtn)}
                onClick={() => setShowMobileFilters(true)}
                aria-label="Open filters"
              >
                <SlidersHorizontal size={15} />
                Filters
                {activeFilterCount > 0 && <span className={commonStyles.filterBadge}>{activeFilterCount}</span>}
              </button>
            </div>

            <div className={commonStyles.categoryPillsRow}>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setCurrentPage(1); }}
                    className={cn(commonStyles.categoryPill, themed.categoryPill, category === cat.id && commonStyles.categoryPillActive, category === cat.id && themed.categoryPillActive)}
                  >
                    <Icon size={13} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        <div className={commonStyles.mainLayout}>
          <aside className={cn(commonStyles.sidebar, themed.sidebar)}>
            <div className={cn(commonStyles.sidebarCard, themed.sidebarCard)}>
              <h3 className={cn(commonStyles.sidebarTitle, themed.sidebarTitle)}>
                <Filter size={15} /> Filters
              </h3>
              {renderSidebarFilters()}
            </div>
          </aside>

          <div className={commonStyles.contentArea}>
            <div className={cn(commonStyles.toolbar, themed.toolbar)}>
              <span className={cn(commonStyles.resultCount, themed.resultCount)}>
                <strong>{sortedFreelancers.length}</strong> freelancer{sortedFreelancers.length !== 1 ? 's' : ''} found
                {searchQuery && <span className={commonStyles.searchHint}> for &ldquo;{searchQuery}&rdquo;</span>}
              </span>
              <select
                className={cn(commonStyles.sortSelect, themed.sortSelect)}
                value={sortBy}
                onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                aria-label="Sort freelancers"
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <div className={commonStyles.activeTags}>
                {category !== 'all' && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    {CATEGORIES.find(c => c.id === category)?.label}
                    <button onClick={() => setCategory('all')} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                {filters.rateRange !== 'all' && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    {RATE_RANGES.find(r => r.id === filters.rateRange)?.label}
                    <button onClick={() => setFilter('rateRange', 'all')} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                {filters.experienceLevel && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    {EXPERIENCE_LEVELS.find(e => e.id === filters.experienceLevel)?.label}
                    <button onClick={() => setFilter('experienceLevel', '')} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                {filters.minRating && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    {filters.minRating}+ stars
                    <button onClick={() => setFilter('minRating', '')} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                {filters.location && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    {filters.location}
                    <button onClick={() => setFilter('location', '')} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                {filters.availableOnly && (
                  <span className={cn(commonStyles.activeTag, themed.activeTag)}>
                    Available now
                    <button onClick={() => setFilter('availableOnly', false)} aria-label="Remove"><X size={11} /></button>
                  </span>
                )}
                <button className={cn(commonStyles.clearAllSmall, themed.clearAllSmall)} onClick={clearFilters}>Clear all</button>
              </div>
            )}

            {loading ? (
              <div className={commonStyles.skeletonGrid}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={cn(commonStyles.skeletonCard, themed.skeletonCard)}>
                    <div className={cn(commonStyles.skeletonAvatar, themed.skeletonEl)} />
                    <div className={cn(commonStyles.skeletonLine, commonStyles.skShort, themed.skeletonEl)} />
                    <div className={cn(commonStyles.skeletonLine, commonStyles.skMedium, themed.skeletonEl)} />
                    <div className={cn(commonStyles.skeletonLine, commonStyles.skLong, themed.skeletonEl)} />
                    <div className={cn(commonStyles.skeletonLine, commonStyles.skMedium, themed.skeletonEl)} />
                  </div>
                ))}
              </div>
            ) : sortedFreelancers.length === 0 ? (
              <EmptyState
                title="No freelancers found"
                description="Try adjusting your search or filters."
                icon={<Users size={48} />}
                action={
                  <Button variant="outline" size="md" onClick={clearFilters}>
                    <RefreshCw size={16} /> Clear all filters
                  </Button>
                }
              />
            ) : (
              <StaggerContainer className={commonStyles.resultsGrid}>
                {paginatedFreelancers.map(f => (
                  <StaggerItem key={f.id} className={cn(commonStyles.freelancerCard, themed.freelancerCard)}>
                    <div className={commonStyles.cardTopRow}>
                      <div className={commonStyles.avatarWrapper}>
                        <div className={cn(commonStyles.avatar, themed.avatar)}>
                          {f.avatar_url
                            ? <img src={f.avatar_url} alt={f.name} width={56} height={56} />
                            : <span>{f.name.charAt(0).toUpperCase()}</span>}
                        </div>
                        {f.availability !== false && (
                          <span className={commonStyles.onlineDot} title="Available now" />
                        )}
                      </div>
                      <div className={commonStyles.cardTopMeta}>
                        {f.is_top_rated && (
                          <span className={cn(commonStyles.topRatedBadge, themed.topRatedBadge)}>
                            <Award size={10} /> Top Rated
                          </span>
                        )}
                        <button
                          className={cn(commonStyles.favoriteBtn, themed.favoriteBtn, favorites.has(f.id) && commonStyles.favoriteBtnActive)}
                          onClick={() => toggleFavorite(f.id)}
                          aria-label={favorites.has(f.id) ? 'Remove from saved' : 'Save freelancer'}
                        >
                          <Heart size={16} fill={favorites.has(f.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <h3 className={cn(commonStyles.name, themed.name)}>{f.name}</h3>
                    <p className={cn(commonStyles.titleText, themed.titleText)}>{f.title}</p>

                    <div className={commonStyles.metaRow}>
                      <span className={cn(commonStyles.metaChip, themed.metaChip)}>
                        <Star size={12} fill="#F2C94C" stroke="#F2C94C" />
                        {f.rating.toFixed(1)}
                        <span className={commonStyles.reviewCount}>({f.reviews_count})</span>
                      </span>
                      <span className={cn(commonStyles.metaChip, themed.metaChip)}>
                        <MapPin size={12} />{f.location}
                      </span>
                    </div>

                    <div className={commonStyles.statsRow}>
                      <div className={cn(commonStyles.rateDisplay, themed.rateDisplay)}>
                        <DollarSign size={14} />${f.hourly_rate}<span className={commonStyles.perHr}>/hr</span>
                      </div>
                      {f.completed_jobs > 0 && (
                        <span className={cn(commonStyles.jobsBadge, themed.jobsBadge)}>
                          <Briefcase size={11} /> {f.completed_jobs} jobs
                        </span>
                      )}
                      {f.experience_level && (
                        <span className={cn(commonStyles.expLevelBadge, themed.expLevelBadge)}>{f.experience_level}</span>
                      )}
                    </div>

                    {typeof f.job_success_score === 'number' && f.job_success_score > 0 && (
                      <div className={commonStyles.jssRow}>
                        <span className={cn(commonStyles.jssLabel, themed.jssLabel)}>
                          <TrendingUp size={11} /> {f.job_success_score}% JSS
                        </span>
                        <div className={cn(commonStyles.jssTrack, themed.jssTrack)}>
                          <div
                            className={cn(
                              commonStyles.jssFill,
                              f.job_success_score >= 90 ? commonStyles.jssHigh
                                : f.job_success_score >= 70 ? commonStyles.jssMid
                                : commonStyles.jssLow
                            )}
                            style={{ width: `${f.job_success_score}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {f.response_time && (
                      <div className={cn(commonStyles.responseTime, themed.responseTime)}>
                        <Clock size={11} /> Responds in {f.response_time}
                      </div>
                    )}

                    <div className={commonStyles.skillsRow}>
                      {f.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className={cn(commonStyles.skillTag, themed.skillTag)}>{s}</span>
                      ))}
                      {f.skills.length > 4 && (
                        <span className={cn(commonStyles.moreSkills, themed.moreSkills)}>+{f.skills.length - 4}</span>
                      )}
                    </div>

                    <div className={commonStyles.cardActions}>
                      <Link href={`/freelancers/${f.id}`} className={commonStyles.profileLink}>
                        <Button variant="outline" size="sm" fullWidth>Profile</Button>
                      </Link>
                      <Link href={`/client/projects/create?invite=${f.id}`}>
                        <Button variant="primary" size="sm" iconBefore={<UserPlus size={13} />}>
                          Invite
                        </Button>
                      </Link>
                      <Link href={`/client/messages?to=${f.id}`}>
                        <Button variant="ghost" size="sm" iconBefore={<MessageSquare size={13} />}>
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {!loading && totalPages > 1 && (
              <nav className={commonStyles.pagination} aria-label="Freelancer pages">
                <button
                  className={cn(commonStyles.pageBtn, themed.pageBtn)}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pn: number;
                  if (totalPages <= 7) pn = i + 1;
                  else if (currentPage <= 4) pn = i + 1;
                  else if (currentPage >= totalPages - 3) pn = totalPages - 6 + i;
                  else pn = currentPage - 3 + i;
                  return (
                    <button
                      key={pn}
                      onClick={() => setCurrentPage(pn)}
                      className={cn(commonStyles.pageBtn, themed.pageBtn, currentPage === pn && commonStyles.pageBtnActive, currentPage === pn && themed.pageBtnActive)}
                      aria-current={currentPage === pn ? 'page' : undefined}
                    >
                      {pn}
                    </button>
                  );
                })}
                <button
                  className={cn(commonStyles.pageBtn, themed.pageBtn)}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </nav>
            )}
          </div>
        </div>

        {showMobileFilters && (
          <div className={commonStyles.mobileOverlay}>
            <div className={commonStyles.mobileBackdrop} onClick={() => setShowMobileFilters(false)} />
            <div className={cn(commonStyles.mobilePanel, themed.mobilePanel)}>
              <div className={cn(commonStyles.mobilePanelHeader, themed.mobilePanelHeader)}>
                <h3>Filters</h3>
                <button onClick={() => setShowMobileFilters(false)} aria-label="Close"><X size={20} /></button>
              </div>
              <div className={commonStyles.mobilePanelBody}>{renderSidebarFilters()}</div>
              <div className={cn(commonStyles.mobilePanelFooter, themed.mobilePanelFooter)}>
                <Button variant="ghost" size="md" onClick={clearFilters}>Clear all</Button>
                <Button variant="primary" size="md" onClick={() => setShowMobileFilters(false)}>
                  Show {sortedFreelancers.length} results
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
