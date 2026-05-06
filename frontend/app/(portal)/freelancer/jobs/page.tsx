// @AI-HINT: Freelancer Jobs — pill-based filters, visual match score, rich job cards, category chips
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { searchApi, projectsApi } from '@/lib/api';
import api from '@/lib/api';
import { Button } from '@/app/components/atoms/Button';
import JobCard from '@/app/components/organisms/JobCard/JobCard';
import { PageTransition, StaggerContainer, StaggerItem } from '@/app/components/Animations';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import {
  Search, X, Briefcase, ChevronLeft, ChevronRight, Zap, Filter,
  SlidersHorizontal, RefreshCw, Code, Palette, PenTool, Megaphone,
  BarChart3, Cpu, Globe, Shield, Clock, TrendingUp,
} from 'lucide-react';
import commonStyles from './Jobs.common.module.css';
import lightStyles from './Jobs.light.module.css';
import darkStyles from './Jobs.dark.module.css';

const PAGE_SIZE = 12;

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'web-development', label: 'Web Dev', icon: Code },
  { id: 'mobile-development', label: 'Mobile', icon: Cpu },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
  { id: 'data-science', label: 'Data/AI', icon: BarChart3 },
  { id: 'devops', label: 'DevOps', icon: Globe },
  { id: 'cybersecurity', label: 'Security', icon: Shield },
];

const PROJECT_TYPES = [
  { id: 'all', label: 'Any Type' },
  { id: 'fixed', label: 'Fixed Price' },
  { id: 'hourly', label: 'Hourly' },
];

const EXPERIENCE_LEVELS = [
  { id: 'all', label: 'Any Level' },
  { id: 'entry', label: 'Entry' },
  { id: 'intermediate', label: 'Mid' },
  { id: 'expert', label: 'Expert' },
];

const DURATIONS = [
  { id: 'all', label: 'Any Duration' },
  { id: 'less_1_month', label: '< 1 Month' },
  { id: '1_3_months', label: '1–3 Months' },
  { id: '3_6_months', label: '3–6 Months' },
  { id: 'more_6_months', label: '6+ Months' },
];

interface Job {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  budget_type: 'fixed' | 'hourly';
  skills: string[];
  created_at: string;
  posted_at: string;
  client_name: string;
  client_rating: number;
  match_score?: number;
  is_verified?: boolean;
  experience_level?: string;
  estimated_duration?: string;
  proposals_count?: number;
  category?: string;
  status?: string;
}

export default function JobsPage() {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'best-matches' | 'most-recent' | 'saved'>('best-matches');
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [userSkills, setUserSkills] = useState<string[]>([]);

  const [category, setCategory] = useState('all');
  const [budgetType, setBudgetType] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [projectLength, setProjectLength] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const me: any = await api.auth.me();
        const skills = Array.isArray(me.skills)
          ? me.skills
          : me.skills ? String(me.skills).split(',').map((s: string) => s.trim()).filter(Boolean) : [];
        setUserSkills(skills.slice(0, 8));
      } catch { /* ok */ }
    })();
  }, []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: PAGE_SIZE, status: 'open' };
      if (category !== 'all') params.category = category;
      if (budgetType !== 'all') params.budget_type = budgetType;
      if (minBudget) params.budget_min = parseInt(minBudget);
      if (experienceLevel !== 'all') params.experience_level = experienceLevel;
      if (projectLength !== 'all') params.estimated_duration = projectLength;
      if (activeTab === 'most-recent') params.sort = 'newest';

      let response: any;
      if (query) {
        response = await searchApi.projects(query, params);
      } else {
        response = await projectsApi.list(params);
      }

      const data = Array.isArray(response) ? response : (response.projects || response.items || []);
      const total = Array.isArray(response) ? response.length : (response.total || response.count || data.length);

      const enriched: Job[] = data.map((job: any) => ({
        ...job,
        posted_at: job.posted_at || job.created_at || new Date().toISOString(),
        match_score: job.match_score ?? null,
        client_rating: job.client_rating ?? null,
        is_verified: job.is_verified ?? false,
        client_name: job.client_name || 'Anonymous Client',
        skills: Array.isArray(job.skills) ? job.skills : typeof job.skills === 'string' ? job.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      }));

      if (activeTab === 'best-matches') enriched.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

      setJobs(enriched);
      setTotalJobs(total);
    } catch {
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  }, [query, category, budgetType, minBudget, activeTab, experienceLevel, projectLength, page]);

  useEffect(() => {
    const t = setTimeout(() => fetchJobs(), 500);
    return () => clearTimeout(t);
  }, [fetchJobs]);

  useEffect(() => { setPage(1); }, [query, category, budgetType, minBudget, activeTab, experienceLevel, projectLength]);

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  const activeFiltersCount = useMemo(() =>
    [category !== 'all', budgetType !== 'all', !!minBudget, experienceLevel !== 'all', projectLength !== 'all'].filter(Boolean).length,
    [category, budgetType, minBudget, experienceLevel, projectLength]);

  const clearAllFilters = () => {
    setQuery('');
    setCategory('all');
    setBudgetType('all');
    setMinBudget('');
    setExperienceLevel('all');
    setProjectLength('all');
    setPage(1);
  };

  const renderFilters = () => (
    <div className={commonStyles.filterGroups}>
      <div className={commonStyles.filterGroup}>
        <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Category</span>
        <div className={commonStyles.filterChips}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(commonStyles.filterChip, themeStyles.filterChip, category === cat.id && commonStyles.filterChipActive, category === cat.id && themeStyles.filterChipActive)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Project Type</span>
        <div className={commonStyles.filterChips}>
          {PROJECT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setBudgetType(t.id)}
              className={cn(commonStyles.filterChip, themeStyles.filterChip, budgetType === t.id && commonStyles.filterChipActive, budgetType === t.id && themeStyles.filterChipActive)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Experience Level</span>
        <div className={commonStyles.filterChips}>
          {EXPERIENCE_LEVELS.map(l => (
            <button
              key={l.id}
              onClick={() => setExperienceLevel(l.id)}
              className={cn(commonStyles.filterChip, themeStyles.filterChip, experienceLevel === l.id && commonStyles.filterChipActive, experienceLevel === l.id && themeStyles.filterChipActive)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Project Duration</span>
        <div className={commonStyles.filterChips}>
          {DURATIONS.map(d => (
            <button
              key={d.id}
              onClick={() => setProjectLength(d.id)}
              className={cn(commonStyles.filterChip, themeStyles.filterChip, projectLength === d.id && commonStyles.filterChipActive, projectLength === d.id && themeStyles.filterChipActive)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Min Budget ($)</span>
        <input
          type="number"
          placeholder="e.g. 500"
          value={minBudget}
          onChange={e => setMinBudget(e.target.value)}
          className={cn(commonStyles.budgetInput, themeStyles.budgetInput)}
        />
      </div>

      {activeFiltersCount > 0 && (
        <button className={cn(commonStyles.clearBtn, themeStyles.clearBtn)} onClick={clearAllFilters}>
          <RefreshCw size={13} /> Clear all ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <div className={commonStyles.header}>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Find Your Next Project</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Discover opportunities tailored to your skills and expertise
          </p>

          <div className={cn(commonStyles.searchBar, themeStyles.searchBar)}>
            <Search className="ml-3 flex-shrink-0 opacity-40" size={20} />
            <input
              type="text"
              placeholder="Search by title, skills, or keywords..."
              className={cn(commonStyles.searchInput, themeStyles.searchInput)}
              value={query}
              onChange={e => setQuery(e.target.value)}
              aria-label="Search jobs"
            />
            {query && (
              <button onClick={() => setQuery('')} className={commonStyles.searchClear} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          {userSkills.length > 0 && (
            <div className={cn(commonStyles.quickChips, themeStyles.quickChips)}>
              <span className={cn(commonStyles.quickChipsLabel, themeStyles.quickChipsLabel)}>
                <Zap size={13} /> Your skills:
              </span>
              {userSkills.map(skill => (
                <button
                  key={skill}
                  className={cn(commonStyles.quickChip, themeStyles.quickChip, query === skill && commonStyles.quickChipActive, query === skill && themeStyles.quickChipActive)}
                  onClick={() => setQuery(prev => prev === skill ? '' : skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}

          {activeFiltersCount > 0 && (
            <div className={cn(commonStyles.activeFilters, themeStyles.activeFilters)}>
              <span className={cn(commonStyles.activeFiltersLabel, themeStyles.activeFiltersLabel)}>Active:</span>
              {category !== 'all' && <span className={cn(commonStyles.filterTag, themeStyles.filterTag)}>{category}<button onClick={() => setCategory('all')}><X size={11} /></button></span>}
              {budgetType !== 'all' && <span className={cn(commonStyles.filterTag, themeStyles.filterTag)}>{budgetType}<button onClick={() => setBudgetType('all')}><X size={11} /></button></span>}
              {minBudget && <span className={cn(commonStyles.filterTag, themeStyles.filterTag)}>${minBudget}+<button onClick={() => setMinBudget('')}><X size={11} /></button></span>}
              {experienceLevel !== 'all' && <span className={cn(commonStyles.filterTag, themeStyles.filterTag)}>{experienceLevel}<button onClick={() => setExperienceLevel('all')}><X size={11} /></button></span>}
              {projectLength !== 'all' && <span className={cn(commonStyles.filterTag, themeStyles.filterTag)}>{projectLength.replace(/_/g, ' ')}<button onClick={() => setProjectLength('all')}><X size={11} /></button></span>}
              <button className={cn(commonStyles.clearAllBtn, themeStyles.clearAllBtn)} onClick={clearAllFilters}>Clear all</button>
            </div>
          )}
        </div>

        <div className={commonStyles.layout}>
          <aside className={cn(commonStyles.filters, themeStyles.filters, showFilters ? 'block' : 'hidden lg:block')}>
            <div className={commonStyles.filterHeader}>
              <h3 className={cn(commonStyles.filterTitle, themeStyles.filterTitle)}>
                <Filter size={15} /> Filters
              </h3>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>Reset</Button>
            </div>
            {renderFilters()}
          </aside>

          <main>
            <div className={cn(commonStyles.tabs, themeStyles.tabs)}>
              {(['best-matches', 'most-recent', 'saved'] as const).map(tab => (
                <button
                  key={tab}
                  className={cn(commonStyles.tab, themeStyles.tab, activeTab === tab && themeStyles.activeTab)}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'best-matches' ? 'Best Matches' : tab === 'most-recent' ? 'Most Recent' : 'Saved Jobs'}
                </button>
              ))}
            </div>

            <div className={commonStyles.resultsHeader}>
              <span className={cn(commonStyles.resultsCount, themeStyles.resultsCount)}>
                {loading ? 'Searching…' : `${jobs.length} project${jobs.length !== 1 ? 's' : ''} found`}
              </span>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
                <SlidersHorizontal size={15} className="mr-1" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>
            </div>

            {loading ? (
              <div className={commonStyles.skeletonGrid}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(commonStyles.skeletonCard, themeStyles.skeletonCard)}>
                    <div className={commonStyles.skeletonHeader}>
                      <Skeleton className={commonStyles.skeletonTitle} />
                      <Skeleton className={commonStyles.skeletonBadge} />
                    </div>
                    <Skeleton className={commonStyles.skeletonDescription} />
                    <div className={cn(commonStyles.skeletonDescription, themeStyles.skeletonDescription)} style={{ width: '70%', height: '14px', borderRadius: '6px' }} />
                    <div className={commonStyles.skeletonFooter}>
                      <Skeleton className={commonStyles.skeletonChip} />
                      <Skeleton className={commonStyles.skeletonChip} />
                      <Skeleton className={commonStyles.skeletonChip} />
                    </div>
                    <div className={commonStyles.skeletonMeta}>
                      <Skeleton className={commonStyles.skeletonBudget} />
                      <Skeleton className={commonStyles.skeletonDate} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <StaggerContainer className={commonStyles.jobGrid}>
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <StaggerItem key={job.id}>
                      {typeof job.match_score === 'number' && job.match_score > 0 && (
                        <div className={cn(commonStyles.matchScoreBar, themeStyles.matchScoreBar)}>
                          <TrendingUp size={12} />
                          <span>{Math.round(job.match_score * 100)}% match</span>
                          <div className={cn(commonStyles.matchTrack, themeStyles.matchTrack)}>
                            <div
                              className={cn(commonStyles.matchFill, job.match_score >= 0.8 ? commonStyles.matchHigh : job.match_score >= 0.5 ? commonStyles.matchMid : commonStyles.matchLow)}
                              style={{ width: `${Math.round(job.match_score * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <JobCard
                        {...{
                          id: job.id,
                          title: job.title,
                          clientName: job.client_name,
                          description: job.description,
                          budget: job.budget_max || job.budget_min,
                          postedAt: job.posted_at,
                          skills: job.skills || [],
                          matchScore: job.match_score,
                          clientRating: job.client_rating,
                          isVerified: job.is_verified,
                        } as any}
                      />
                    </StaggerItem>
                  ))
                ) : (
                  <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
                    <Briefcase size={48} className={commonStyles.emptyIcon} />
                    <h3 className={commonStyles.emptyTitle}>No matching projects</h3>
                    <p className={commonStyles.emptyText}>Try broadening your criteria or check back for new opportunities.</p>
                    <Button variant="primary" onClick={clearAllFilters}>Clear Filters</Button>
                  </div>
                )}
              </StaggerContainer>
            )}

            {!loading && totalPages > 1 && (
              <div className={cn(commonStyles.pagination, themeStyles.pagination)}>
                <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={15} /> Prev
                </Button>
                <span className={cn(commonStyles.pageInfo, themeStyles.pageInfo)}>
                  {page} / {totalPages}
                </span>
                <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Next <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
