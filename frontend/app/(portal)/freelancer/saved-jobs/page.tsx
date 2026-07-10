// @AI-HINT: Freelancer saved jobs page - bookmarked project listings with search, sort, filters, notes, and bulk actions
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/atoms/Button/Button';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import {
  Bookmark, Briefcase, Clock, Users, ExternalLink, Trash2,
  Search, SortAsc, SlidersHorizontal, X, StickyNote, DollarSign,
  ChevronDown, CheckSquare, Square, BarChart3,
} from 'lucide-react';
import { apiFetch } from '@/lib/api/core';
import commonStyles from './SavedJobs.common.module.css';
import lightStyles from './SavedJobs.light.module.css';
import darkStyles from './SavedJobs.dark.module.css';

interface SavedJob {
  id: string;          // project id (used for routing/apply)
  favorite_id: string; // favorites row id (used for removal)
  title: string;
  description: string;
  budget_type: 'fixed' | 'hourly';
  budget_min: number;
  budget_max: number;
  skills: string[];
  client_name: string;
  posted_at: string;
  proposals_count: number;
  saved_at: string;
}

/** Skills may arrive as a JSON string, comma list, or array — normalize to string[]. */
function normalizeSkills(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch { /* not JSON — fall through to comma split */ }
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

/** Map a backend favorites row (project favorite) to the SavedJob shape the UI renders. */
function mapFavoriteToJob(fav: any): SavedJob {
  const bt = String(fav.budget_type || 'fixed').toLowerCase();
  return {
    id: String(fav.project_id ?? ''),
    favorite_id: String(fav.id ?? ''),
    title: fav.project_title || 'Untitled project',
    description: fav.project_description || '',
    budget_type: bt === 'hourly' ? 'hourly' : 'fixed',
    budget_min: Number(fav.budget_min ?? 0),
    budget_max: Number(fav.budget_max ?? 0),
    skills: normalizeSkills(fav.project_skills),
    client_name: fav.client_name || 'Client',
    posted_at: fav.project_created_at || fav.created_at || new Date().toISOString(),
    proposals_count: Number(fav.proposals_count ?? 0),
    saved_at: fav.created_at || new Date().toISOString(),
  };
}

type SortBy = 'saved_at' | 'budget_max' | 'proposals_count' | 'posted_at';
type BudgetFilter = 'all' | 'fixed' | 'hourly';

export default function SavedJobsPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('saved_at');
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    loadSavedJobs();
    // Load notes from localStorage
    try {
      const stored = localStorage.getItem('savedJobNotes');
      if (stored) setNotes(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      // Saved jobs are project favorites — backend exposes them via /favorites.
      const data = await apiFetch<any>('/favorites?target_type=project');
      const items: any[] = Array.isArray(data) ? data : data.items || data.jobs || [];
      setSavedJobs(items.filter(f => f.project_id != null).map(mapFavoriteToJob));
    } catch {
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (jobId: string) => {
    const job = savedJobs.find(j => j.id === jobId);
    setRemovingId(jobId);
    try {
      if (job?.favorite_id) {
        await apiFetch(`/favorites/${encodeURIComponent(job.favorite_id)}`, { method: 'DELETE' });
      }
    } catch { /* optimistic removal */ }
    setSavedJobs(prev => prev.filter(j => j.id !== jobId));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(jobId); return n; });
    setRemovingId(null);
  };

  const handleBulkRemove = async () => {
    const jobs = savedJobs.filter(j => selectedIds.has(j.id));
    for (const job of jobs) {
      try {
        if (job.favorite_id) {
          await apiFetch(`/favorites/${encodeURIComponent(job.favorite_id)}`, { method: 'DELETE' });
        }
      } catch { /* ok */ }
    }
    setSavedJobs(prev => prev.filter(j => !selectedIds.has(j.id)));
    setSelectedIds(new Set());
  };

  const saveNote = useCallback((jobId: string, text: string) => {
    const updated = { ...notes, [jobId]: text };
    if (!text.trim()) delete updated[jobId];
    setNotes(updated);
    localStorage.setItem('savedJobNotes', JSON.stringify(updated));
    setEditingNoteId(null);
  }, [notes]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredJobs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredJobs.map(j => j.id)));
    }
  };

  // Filtered + sorted jobs
  const filteredJobs = useMemo(() => {
    let result = [...savedJobs];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.client_name.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // Budget filter
    if (budgetFilter !== 'all') {
      result = result.filter(j => j.budget_type === budgetFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'budget_max': return b.budget_max - a.budget_max;
        case 'proposals_count': return a.proposals_count - b.proposals_count;
        case 'posted_at': return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
        default: return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      }
    });

    return result;
  }, [savedJobs, searchQuery, budgetFilter, sortBy]);

  const formatBudget = (job: SavedJob) => {
    if (job.budget_type === 'hourly') return `$${job.budget_min} - $${job.budget_max}/hr`;
    return `$${job.budget_min.toLocaleString()} - $${job.budget_max.toLocaleString()}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  // Stats
  const stats = useMemo(() => {
    const total = savedJobs.length;
    const fixed = savedJobs.filter(j => j.budget_type === 'fixed').length;
    const hourly = total - fixed;
    const avgBudget = total > 0 ? Math.round(savedJobs.reduce((s, j) => s + j.budget_max, 0) / total) : 0;
    return { total, fixed, hourly, avgBudget };
  }, [savedJobs]);

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;
  if (!resolvedTheme) return null;

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        {/* Header */}
        <ScrollReveal>
          <div className={commonStyles.header}>
            <div className={commonStyles.headerTop}>
              <div>
                <h1 className={cn(commonStyles.title, themeStyles.title)}>
                  <Bookmark size={28} />
                  Saved Jobs
                </h1>
                <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
                  {stats.total} job{stats.total !== 1 ? 's' : ''} saved for later
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => router.push('/freelancer/jobs')}>
                <Briefcase size={16} /> Browse More Jobs
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats Row */}
        {!loading && savedJobs.length > 0 && (
          <ScrollReveal delay={0.05}>
            <div className={commonStyles.statsRow}>
              <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
                <Bookmark size={16} />
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stats.total}</span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Total Saved</span>
              </div>
              <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
                <DollarSign size={16} />
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stats.fixed}</span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Fixed Price</span>
              </div>
              <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
                <Clock size={16} />
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>{stats.hourly}</span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Hourly</span>
              </div>
              <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
                <BarChart3 size={16} />
                <span className={cn(commonStyles.statValue, themeStyles.statValue)}>${stats.avgBudget.toLocaleString()}</span>
                <span className={cn(commonStyles.statLabel, themeStyles.statLabel)}>Avg Budget</span>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Search + Sort + Filter Toolbar */}
        {!loading && savedJobs.length > 0 && (
          <ScrollReveal delay={0.08}>
            <div className={cn(commonStyles.toolbar, themeStyles.toolbar)}>
              <div className={commonStyles.searchWrap}>
                <Search size={16} className={commonStyles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search saved jobs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(commonStyles.searchInput, themeStyles.searchInput)}
                />
                {searchQuery && (
                  <button className={commonStyles.searchClear} onClick={() => setSearchQuery('')} aria-label="Clear search">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className={commonStyles.toolbarRight}>
                <div className={commonStyles.sortWrap}>
                  <SortAsc size={14} />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    className={cn(commonStyles.sortSelect, themeStyles.sortSelect)}
                  >
                    <option value="saved_at">Recently Saved</option>
                    <option value="posted_at">Recently Posted</option>
                    <option value="budget_max">Highest Budget</option>
                    <option value="proposals_count">Fewest Proposals</option>
                  </select>
                </div>
                <button
                  className={cn(commonStyles.filterToggle, themeStyles.filterToggle, showFilters && commonStyles.filterToggleActive)}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
              </div>
            </div>

            {showFilters && (
              <div className={cn(commonStyles.filterPanel, themeStyles.filterPanel)}>
                <span className={cn(commonStyles.filterLabel, themeStyles.filterLabel)}>Budget Type:</span>
                {(['all', 'fixed', 'hourly'] as BudgetFilter[]).map(f => (
                  <button
                    key={f}
                    className={cn(commonStyles.filterChip, themeStyles.filterChip, budgetFilter === f && commonStyles.filterChipActive, budgetFilter === f && themeStyles.filterChipActive)}
                    onClick={() => setBudgetFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'fixed' ? 'Fixed Price' : 'Hourly'}
                  </button>
                ))}
              </div>
            )}
          </ScrollReveal>
        )}

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className={cn(commonStyles.bulkBar, themeStyles.bulkBar)}>
            <span>{selectedIds.size} selected</span>
            <Button variant="danger" size="sm" onClick={handleBulkRemove}>
              <Trash2 size={14} /> Remove Selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
            <p>Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <ScrollReveal>
            <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
              <Bookmark size={48} strokeWidth={1.5} opacity={0.5} />
              <h3>No Saved Jobs</h3>
              <p>Browse projects and save interesting ones for later</p>
              <Button variant="primary" onClick={() => router.push('/freelancer/jobs')}>
                Browse Jobs
              </Button>
            </div>
          </ScrollReveal>
        ) : filteredJobs.length === 0 ? (
          <ScrollReveal>
            <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
              <Search size={40} strokeWidth={1.5} opacity={0.5} />
              <h3>No Matching Jobs</h3>
              <p>Try adjusting your search or filters</p>
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setBudgetFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Select All Row */}
            <div className={cn(commonStyles.selectAllRow, themeStyles.selectAllRow)}>
              <button className={commonStyles.selectAllBtn} onClick={toggleSelectAll}>
                {selectedIds.size === filteredJobs.length ? <CheckSquare size={16} /> : <Square size={16} />}
                <span>Select All ({filteredJobs.length})</span>
              </button>
              <span className={cn(commonStyles.resultsCount, themeStyles.resultsCount)}>
                Showing {filteredJobs.length} of {savedJobs.length}
              </span>
            </div>

            <StaggerContainer className={commonStyles.jobsList}>
              {filteredJobs.map(job => (
                <StaggerItem key={job.id}>
                  <div className={cn(commonStyles.jobCard, themeStyles.jobCard, selectedIds.has(job.id) && commonStyles.jobCardSelected, selectedIds.has(job.id) && themeStyles.jobCardSelected)}>
                    <div className={commonStyles.jobCheckbox}>
                      <button onClick={() => toggleSelect(job.id)} aria-label={`Select ${job.title}`}>
                        {selectedIds.has(job.id) ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                    </div>
                    <div className={commonStyles.jobContent}>
                      <div className={commonStyles.jobHeader}>
                        <div className={commonStyles.jobTitleRow}>
                          <h3 className={cn(commonStyles.jobTitle, themeStyles.jobTitle)}>{job.title}</h3>
                          <span className={cn(commonStyles.savedTime, themeStyles.savedTime)}>
                            <Clock size={14} /> Saved {formatTimeAgo(job.saved_at)}
                          </span>
                        </div>
                        <p className={cn(commonStyles.clientName, themeStyles.clientName)}>
                          <Briefcase size={14} /> {job.client_name} • Posted {formatTimeAgo(job.posted_at)}
                        </p>
                      </div>

                      <p className={cn(commonStyles.description, themeStyles.description)}>
                        {job.description}
                      </p>

                      <div className={commonStyles.skills}>
                        {job.skills.map(skill => (
                          <span key={skill} className={cn(commonStyles.skill, themeStyles.skill)}>{skill}</span>
                        ))}
                      </div>

                      {/* Notes */}
                      {editingNoteId === job.id ? (
                        <div className={commonStyles.noteEdit}>
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="Add a note about this job..."
                            className={cn(commonStyles.noteInput, themeStyles.noteInput)}
                            rows={2}
                            autoFocus
                          />
                          <div className={commonStyles.noteActions}>
                            <Button variant="primary" size="sm" onClick={() => saveNote(job.id, noteText)}>Save</Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingNoteId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : notes[job.id] ? (
                        <div
                          className={cn(commonStyles.noteDisplay, themeStyles.noteDisplay)}
                          onClick={() => { setEditingNoteId(job.id); setNoteText(notes[job.id]); }}
                          role="button"
                          tabIndex={0}
                        >
                          <StickyNote size={14} />
                          <span>{notes[job.id]}</span>
                        </div>
                      ) : null}

                      <div className={commonStyles.jobFooter}>
                        <div className={commonStyles.jobMeta}>
                          <span className={cn(commonStyles.budget, themeStyles.budget)}>
                            {formatBudget(job)}
                            <span className={cn(commonStyles.budgetType, themeStyles.budgetType)}>
                              {job.budget_type === 'hourly' ? 'Hourly' : 'Fixed'}
                            </span>
                          </span>
                          <span className={cn(commonStyles.proposals, themeStyles.proposals)}>
                            <Users size={14} /> {job.proposals_count} proposal{job.proposals_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className={commonStyles.actions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingNoteId(job.id); setNoteText(notes[job.id] || ''); }}
                          >
                            <StickyNote size={14} /> Note
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(job.id)}
                            isLoading={removingId === job.id}
                          >
                            <Trash2 size={14} /> Remove
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => router.push(`/freelancer/jobs/${job.id}`)}
                          >
                            <ExternalLink size={14} /> View & Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        )}
      </div>
    </PageTransition>
  );
}
