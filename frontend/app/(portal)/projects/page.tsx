// @AI-HINT: Portal Projects — sidebar filters (category, budget, type, experience), numbered pagination, rich cards
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PageTransition, ScrollReveal } from '@/app/components/Animations';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import Button from '@/app/components/atoms/Button/Button';
import { Badge } from '@/app/components/atoms/Badge';
import Loading from '@/app/components/atoms/Loading/Loading';
import EmptyState from '@/app/components/molecules/EmptyState/EmptyState';
import {
  Briefcase, Search, ChevronRight, Calendar, DollarSign, Users, ArrowUpDown,
  ChevronLeft, Filter, X, RefreshCw, SlidersHorizontal,
  Code, Palette, PenTool, Megaphone, BarChart3, Cpu, Globe, Zap,
  Shield, BookOpen, Clock, Layers, Tag, Plus,
} from 'lucide-react';
import commonStyles from './Projects.common.module.css';
import lightStyles from './Projects.light.module.css';
import darkStyles from './Projects.dark.module.css';

const PAGE_SIZE = 12;

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Layers },
  { id: 'web-development', name: 'Web Dev', icon: Code },
  { id: 'mobile-development', name: 'Mobile', icon: Cpu },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'writing', name: 'Writing', icon: PenTool },
  { id: 'marketing', name: 'Marketing', icon: Megaphone },
  { id: 'data-science', name: 'Data & AI', icon: BarChart3 },
  { id: 'ai-ml', name: 'AI/ML', icon: Zap },
  { id: 'devops', name: 'DevOps', icon: Globe },
  { id: 'cybersecurity', name: 'Security', icon: Shield },
  { id: 'education', name: 'Education', icon: BookOpen },
];

const BUDGET_RANGES = [
  { id: 'all', label: 'Any Budget', min: undefined as number | undefined, max: undefined as number | undefined },
  { id: 'micro', label: 'Under $500', min: 0, max: 500 },
  { id: 'small', label: '$500–$2,000', min: 500, max: 2000 },
  { id: 'medium', label: '$2k–$10k', min: 2000, max: 10000 },
  { id: 'large', label: '$10k–$50k', min: 10000, max: 50000 },
  { id: 'enterprise', label: '$50k+', min: 50000, max: undefined as number | undefined },
];

const EXPERIENCE_LEVELS = [
  { id: 'all', label: 'Any Level' },
  { id: 'entry', label: 'Entry Level' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'expert', label: 'Expert' },
];

const DURATION_OPTIONS = [
  { id: 'all', label: 'Any Duration' },
  { id: 'short', label: '< 1 month' },
  { id: 'medium', label: '1–3 months' },
  { id: 'long', label: '3–6 months' },
  { id: 'ongoing', label: '6+ months' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'budget_high', label: 'Budget: High → Low' },
  { key: 'budget_low', label: 'Budget: Low → High' },
  { key: 'deadline', label: 'Deadline (Soonest)' },
  { key: 'proposals', label: 'Most Proposals' },
];

const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'primary' | 'secondary' => {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'primary' | 'secondary'> = {
    open: 'success', active: 'primary', in_progress: 'warning', completed: 'secondary', closed: 'danger',
  };
  return map[status?.toLowerCase()] || 'primary';
};

const formatBudget = (p: any) => {
  if (p.budget_type === 'hourly') {
    if (p.budget_min && p.budget_max) return `$${p.budget_min}–$${p.budget_max}/hr`;
    if (p.budget_max) return `Up to $${p.budget_max}/hr`;
    return 'Hourly';
  }
  if (p.budget_max && p.budget_min && p.budget_min !== p.budget_max) return `$${p.budget_min.toLocaleString()}–$${p.budget_max.toLocaleString()}`;
  const val = p.budget_max || p.budget_min || p.budget;
  return val ? `$${Number(val).toLocaleString()}` : 'Negotiable';
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function PortalProjectsPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    budgetRange: 'all',
    budgetType: 'all',
    experienceLevel: 'all',
    duration: 'all',
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(searchQuery); setCurrentPage(1); }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const budgetConfig = BUDGET_RANGES.find(b => b.id === filters.budgetRange);
      const params: Record<string, any> = {
        page_size: 200,
        sort: sortBy === 'budget_high' || sortBy === 'budget_low' ? 'budget' : sortBy === 'deadline' ? 'deadline' : 'created_at',
        order: sortBy === 'budget_high' || sortBy === 'deadline' ? 'desc' : sortBy === 'budget_low' ? 'asc' : 'desc',
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (category !== 'all') params.category = category;
      if (budgetConfig?.min !== undefined) params.budget_min = budgetConfig.min;
      if (budgetConfig?.max !== undefined) params.budget_max = budgetConfig.max;
      if (filters.budgetType !== 'all') params.budget_type = filters.budgetType;
      if (filters.experienceLevel !== 'all') params.experience_level = filters.experienceLevel;

      const data = await projectsApi.list(params);
      const items = Array.isArray(data) ? data : (data as any)?.items || [];
      setProjects(items);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, category, sortBy, filters.budgetRange, filters.budgetType, filters.experienceLevel]);

  useEffect(() => {
    if (mounted) loadProjects();
  }, [mounted, loadProjects]);

  useEffect(() => { setCurrentPage(1); }, [debouncedQuery, statusFilter, category, filters]);

  const filteredProjects = useMemo(() => {
    let result = projects.filter(p => {
      if (statusFilter !== 'all' && (p.status || 'open').toLowerCase() !== statusFilter) return false;
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        if (!p.title?.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
      }
      if (filters.duration !== 'all') {
        const d = (p.estimated_duration || '').toLowerCase();
        const matchesDuration = filters.duration === 'short' ? d.includes('day') || d.includes('week') || d.includes('month') && !d.includes('month') :
          filters.duration === 'medium' ? d.includes('1') || d.includes('2') || d.includes('3') :
          filters.duration === 'long' ? d.includes('4') || d.includes('5') || d.includes('6') :
          d.includes('6+') || d.includes('ongoing') || d.includes('long');
        if (!matchesDuration) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'budget_high': return (b.budget_max || b.budget || 0) - (a.budget_max || a.budget || 0);
        case 'budget_low': return (a.budget_min || a.budget || 0) - (b.budget_min || b.budget || 0);
        case 'deadline': {
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        case 'proposals': return (b.proposals_count || 0) - (a.proposals_count || 0);
        default: return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });
    return result;
  }, [projects, debouncedQuery, statusFilter, sortBy, filters.duration]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const statusCounts = useMemo(() => ({
    open: projects.filter(p => (p.status || 'open').toLowerCase() === 'open').length,
    active: projects.filter(p => ['active', 'in_progress'].includes((p.status || '').toLowerCase())).length,
  }), [projects]);

  const activeFiltersCount = [
    filters.budgetRange !== 'all', filters.budgetType !== 'all',
    filters.experienceLevel !== 'all', filters.duration !== 'all', category !== 'all',
  ].filter(Boolean).length;

  const setFilter = useCallback((key: string, val: string) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ budgetRange: 'all', budgetType: 'all', experienceLevel: 'all', duration: 'all' });
    setCategory('all');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  if (!mounted) return null;
  const themed = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  const renderSidebarFilters = () => (
    <div className={commonStyles.filterGroups}>
      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Status</h4>
        <div className={commonStyles.filterChips}>
          {[{ k: 'all', l: 'All' }, { k: 'open', l: 'Open' }, { k: 'active', l: 'Active' }].map(s => (
            <button key={s.k} onClick={() => { setStatusFilter(s.k); setCurrentPage(1); }} className={cn(commonStyles.filterChip, themed.filterChip, statusFilter === s.k && commonStyles.filterChipActive, statusFilter === s.k && themed.filterChipActive)}>
              {s.l}
            </button>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Budget Range</h4>
        <div className={commonStyles.filterOptions}>
          {BUDGET_RANGES.map(r => (
            <label key={r.id} className={cn(commonStyles.filterOption, themed.filterOption)}>
              <input type="radio" name="budget" checked={filters.budgetRange === r.id} onChange={() => setFilter('budgetRange', r.id)} className="sr-only" />
              <span className={cn(commonStyles.filterRadio, themed.filterRadio, filters.budgetRange === r.id && commonStyles.filterRadioActive, filters.budgetRange === r.id && themed.filterRadioActive)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={commonStyles.filterGroup}>
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Project Type</h4>
        <div className={commonStyles.filterChips}>
          {[{ k: 'all', l: 'All' }, { k: 'fixed', l: 'Fixed' }, { k: 'hourly', l: 'Hourly' }].map(t => (
            <button key={t.k} onClick={() => setFilter('budgetType', t.k)} className={cn(commonStyles.filterChip, themed.filterChip, filters.budgetType === t.k && commonStyles.filterChipActive, filters.budgetType === t.k && themed.filterChipActive)}>
              {t.l}
            </button>
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
        <h4 className={cn(commonStyles.filterGroupLabel, themed.filterGroupLabel)}>Project Duration</h4>
        <div className={commonStyles.filterOptions}>
          {DURATION_OPTIONS.map(d => (
            <label key={d.id} className={cn(commonStyles.filterOption, themed.filterOption)}>
              <input type="radio" name="dur" checked={filters.duration === d.id} onChange={() => setFilter('duration', d.id)} className="sr-only" />
              <span className={cn(commonStyles.filterRadio, themed.filterRadio, filters.duration === d.id && commonStyles.filterRadioActive, filters.duration === d.id && themed.filterRadioActive)} />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button className={cn(commonStyles.clearAllBtn, themed.clearAllBtn)} onClick={clearFilters}>
          <RefreshCw size={13} /> Clear all ({activeFiltersCount})
        </button>
      )}
    </div>
  );

  const userRole = (user?.user_type || user?.role || (typeof window !== 'undefined' ? localStorage.getItem('portal_area') : 'client') || 'client').toLowerCase();

  const roleTitle = userRole === 'client' ? 'My Posted Projects & Hiring' : userRole === 'admin' ? 'Platform Projects & Moderation' : 'Explore & Apply to Projects';
  const roleSubtitle = userRole === 'client' ? 'Manage your job listings, review incoming proposals, and track active hires.' : userRole === 'admin' ? 'Monitor all active and archived marketplace projects across the platform.' : 'Browse high-quality client projects matching your skill set and submit competitive proposals.';

  return (
    <PageTransition>
      <div className={cn(commonStyles.page, themed.page)}>
        <ScrollReveal>
          <header className={commonStyles.pageHeader}>
            <div>
              <h1 className={commonStyles.pageTitle}>{roleTitle}</h1>
              <p className={cn(commonStyles.pageSubtitle, themed.pageSubtitle)}>
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available • {roleSubtitle}
              </p>
            </div>
            <div className={commonStyles.headerActions}>
              {userRole === 'client' && (
                <Button variant="primary" size="md" onClick={() => router.push('/create-project')}>
                  <Plus size={16} /> Post New Project
                </Button>
              )}
              <div className={cn(commonStyles.sortWrapper, themed.sortWrapper)}>
                <ArrowUpDown size={13} />
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }} className={cn(commonStyles.sortSelect, themed.sortSelect)} aria-label="Sort projects">
                  {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
              <button
                className={cn(commonStyles.mobileFilterBtn, themed.mobileFilterBtn)}
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={15} /> Filters
                {activeFiltersCount > 0 && <span className={commonStyles.filterBadge}>{activeFiltersCount}</span>}
              </button>
            </div>
          </header>
        </ScrollReveal>

        {/* Category pills */}
        <ScrollReveal delay={0.04}>
          <div className={cn(commonStyles.categoryBar, themed.categoryBar)}>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button key={cat.id} onClick={() => { setCategory(cat.id); setCurrentPage(1); }} className={cn(commonStyles.categoryPill, themed.categoryPill, category === cat.id && commonStyles.categoryPillActive, category === cat.id && themed.categoryPillActive)}>
                  <Icon size={13} /><span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        <div className={commonStyles.mainLayout}>
          <aside className={cn(commonStyles.sidebar, themed.sidebar)}>
            <div className={cn(commonStyles.sidebarCard, themed.sidebarCard)}>
              <h3 className={cn(commonStyles.sidebarTitle, themed.sidebarTitle)}><Filter size={14} /> Filters</h3>
              {renderSidebarFilters()}
            </div>
          </aside>

          <div className={commonStyles.contentArea}>
            <ScrollReveal delay={0.06}>
              <div className={cn(commonStyles.searchBar, themed.searchBar)}>
                <Search className={cn(commonStyles.searchIcon, themed.searchIcon)} size={17} />
                <input type="text" placeholder="Search by title, skill, or description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={cn(commonStyles.searchInput, themed.searchInput)} aria-label="Search projects" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className={commonStyles.searchClear}><X size={15} /></button>}
              </div>
            </ScrollReveal>

            {activeFiltersCount > 0 && (
              <div className={commonStyles.activeTags}>
                {category !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{CATEGORIES.find(c => c.id === category)?.name}<button onClick={() => setCategory('all')}><X size={11} /></button></span>}
                {statusFilter !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{statusFilter}<button onClick={() => setStatusFilter('all')}><X size={11} /></button></span>}
                {filters.budgetRange !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{BUDGET_RANGES.find(b => b.id === filters.budgetRange)?.label}<button onClick={() => setFilter('budgetRange', 'all')}><X size={11} /></button></span>}
                {filters.budgetType !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{filters.budgetType}<button onClick={() => setFilter('budgetType', 'all')}><X size={11} /></button></span>}
                {filters.experienceLevel !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{EXPERIENCE_LEVELS.find(e => e.id === filters.experienceLevel)?.label}<button onClick={() => setFilter('experienceLevel', 'all')}><X size={11} /></button></span>}
                {filters.duration !== 'all' && <span className={cn(commonStyles.activeTag, themed.activeTag)}>{DURATION_OPTIONS.find(d => d.id === filters.duration)?.label}<button onClick={() => setFilter('duration', 'all')}><X size={11} /></button></span>}
                <button className={cn(commonStyles.clearAllSmall, themed.clearAllSmall)} onClick={clearFilters}>Clear all</button>
              </div>
            )}

            {loading ? (
              <Loading />
            ) : paginatedProjects.length === 0 ? (
              <EmptyState
                icon={<Briefcase size={48} />}
                title="No projects found"
                description={searchQuery ? 'Try adjusting your search or filters.' : 'Check back later for new opportunities.'}
                action={activeFiltersCount > 0 ? <Button variant="outline" size="md" onClick={clearFilters}><RefreshCw size={15} /> Clear filters</Button> : undefined}
              />
            ) : (
              <StaggerContainer className={commonStyles.projectsGrid}>
                {paginatedProjects.map((project, idx) => (
                  <StaggerItem key={project.id || idx}>
                    <article
                      className={cn(commonStyles.projectCard, themed.projectCard)}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/projects/${project.id}`); } }}
                      tabIndex={0}
                      role="link"
                      aria-label={`View project: ${project.title || 'Untitled'}`}
                    >
                      <div className={commonStyles.cardTopRow}>
                        <div className={commonStyles.cardTopLeft}>
                          <div className={cn(commonStyles.categoryChip, themed.categoryChip)}>
                            <Tag size={11} />
                            <span>{project.category || 'General'}</span>
                          </div>
                          <Badge variant={getStatusVariant(project.status || 'open')}>
                            {(project.status || 'Open').replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className={cn(commonStyles.budgetDisplay, themed.budgetDisplay)}>
                          <DollarSign size={14} />
                          <span>{formatBudget(project)}</span>
                        </div>
                      </div>

                      <h3 className={cn(commonStyles.cardTitle, themed.cardTitle)}>{project.title || 'Untitled Project'}</h3>
                      <p className={cn(commonStyles.cardDesc, themed.cardDesc)}>
                        {project.description || 'No description available.'}
                      </p>

                      {project.required_skills && project.required_skills.length > 0 && (
                        <div className={commonStyles.skillTags}>
                          {project.required_skills.slice(0, 4).map((skill: string, i: number) => (
                            <span key={i} className={cn(commonStyles.skillTag, themed.skillTag)}>{skill}</span>
                          ))}
                          {project.required_skills.length > 4 && (
                            <span className={cn(commonStyles.skillTag, themed.skillTag)}>+{project.required_skills.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div className={cn(commonStyles.cardMeta, themed.cardMeta)}>
                        {project.created_at && (
                          <span className={cn(commonStyles.metaItem, themed.metaItem)}>
                            <Clock size={13} /> {formatTimeAgo(project.created_at)}
                          </span>
                        )}
                        {project.deadline && (
                          <span className={cn(commonStyles.metaItem, themed.metaItem)}>
                            <Calendar size={13} />
                            Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {project.proposals_count !== undefined && (
                          <span className={cn(commonStyles.metaItem, themed.metaItem)}>
                            <Users size={13} />
                            {project.proposals_count} proposal{project.proposals_count !== 1 ? 's' : ''}
                          </span>
                        )}
                        {project.experience_level && (
                          <span className={cn(commonStyles.expBadge, themed.expBadge)}>{project.experience_level}</span>
                        )}
                      </div>

                      <div className={commonStyles.cardActions}>
                        <span className={cn(commonStyles.viewLink, themed.viewLink)}>View Details</span>
                        <ChevronRight size={16} className={cn(commonStyles.chevron, themed.chevron)} />
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}

            {!loading && totalPages > 1 && (
              <nav className={cn(commonStyles.pagination, themed.pagination)} aria-label="Project pages">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={cn(commonStyles.pageBtn, themed.pageBtn)} aria-label="Previous"><ChevronLeft size={17} /></button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pn: number;
                  if (totalPages <= 7) pn = i + 1;
                  else if (currentPage <= 4) pn = i + 1;
                  else if (currentPage >= totalPages - 3) pn = totalPages - 6 + i;
                  else pn = currentPage - 3 + i;
                  return (
                    <button key={pn} onClick={() => setCurrentPage(pn)} className={cn(commonStyles.pageBtn, themed.pageBtn, currentPage === pn && commonStyles.pageBtnActive, currentPage === pn && themed.pageBtnActive)} aria-current={currentPage === pn ? 'page' : undefined}>
                      {pn}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={cn(commonStyles.pageBtn, themed.pageBtn)} aria-label="Next"><ChevronRight size={17} /></button>
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
                <button onClick={() => setShowMobileFilters(false)}><X size={20} /></button>
              </div>
              <div className={commonStyles.mobilePanelBody}>{renderSidebarFilters()}</div>
              <div className={cn(commonStyles.mobilePanelFooter, themed.mobilePanelFooter)}>
                <Button variant="ghost" size="md" onClick={clearFilters}>Clear all</Button>
                <Button variant="primary" size="md" onClick={() => setShowMobileFilters(false)}>Show {filteredProjects.length} results</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
