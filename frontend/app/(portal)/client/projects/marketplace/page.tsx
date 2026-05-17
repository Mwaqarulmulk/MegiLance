'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { projectsApi } from '@/lib/api';
import Button from '@/app/components/atoms/Button/Button';
import Loading from '@/app/components/atoms/Loading/Loading';
import {
  Search,
  Filter,
  SortAsc,
  DollarSign,
  Calendar,
  Users,
  Zap,
  Star,
  Clock,
  ChevronRight,
  Eye,
} from 'lucide-react';

import commonStyles from './ProjectMarketplace.common.module.css';
import lightStyles from './ProjectMarketplace.light.module.css';
import darkStyles from './ProjectMarketplace.dark.module.css';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  duration?: string;
  level?: 'Entry' | 'Intermediate' | 'Expert';
  skills: string[];
  category?: string;
  location?: string;
  client?: {
    name: string;
    avatar?: string;
    rating?: number;
    reviews?: number;
  };
  proposals?: number;
  views?: number;
  posted?: string;
  createdAt?: string;
  status?: 'Open' | 'In Progress' | 'Completed';
  type?: 'Fixed' | 'Hourly';
  hoursPerWeek?: number;
}

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidate = record.projects ?? record.items ?? record.data ?? record.results;
    return Array.isArray(candidate) ? candidate : [];
  }
  return [];
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') return Number(value.replace(/[$,]/g, '')) || 0;
  return 0;
};

const toTextArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const formatLevel = (value: unknown): Project['level'] | undefined => {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('entry') || normalized.includes('beginner')) return 'Entry';
  if (normalized.includes('expert') || normalized.includes('senior')) return 'Expert';
  if (normalized.includes('intermediate') || normalized.includes('mid')) return 'Intermediate';
  return undefined;
};

const formatPostedDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const mapProject = (value: unknown): Project => {
  const project = value as Record<string, any>;
  const client = project.client && typeof project.client === 'object' ? project.client : {};
  const budgetType = String(project.budget_type ?? project.type ?? '').toLowerCase();
  const createdAt = project.created_at ?? project.createdAt ?? project.posted_at;

  return {
    id: toNumber(project.id),
    title: String(project.title ?? 'Untitled Project'),
    description: String(project.description ?? project.summary ?? ''),
    budget: toNumber(project.budget_max ?? project.budget ?? project.rate ?? project.budget_min),
    type: budgetType.includes('hour') ? 'Hourly' : 'Fixed',
    hoursPerWeek: toNumber(project.hours_per_week || project.hoursPerWeek) || undefined,
    duration: project.estimated_duration ?? project.duration,
    level: formatLevel(project.experience_level ?? project.level),
    skills: toTextArray(project.skills),
    category: project.category,
    location: project.location,
    client: {
      name: String(project.client_name ?? client.name ?? (project.client_id ? `Client #${project.client_id}` : 'Verified Client')),
      avatar: project.client_avatar ?? client.avatar,
      rating: toNumber(project.client_rating ?? client.rating) || undefined,
      reviews: toNumber(project.client_reviews ?? client.reviews) || undefined,
    },
    proposals: toNumber(project.proposal_count ?? project.proposals_count ?? project.proposals),
    views: toNumber(project.views ?? project.view_count),
    posted: formatPostedDate(createdAt),
    createdAt: createdAt ? String(createdAt) : undefined,
    status: 'Open',
  };
};

const ProjectMarketplacePage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'budget' | 'proposals'>('recent');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [filterBudget, setFilterBudget] = useState<[number, number]>([0, 10000]);

  const themeStyles = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await projectsApi.list({ status: 'open', page: 1, page_size: 50, sort: 'created_at', order: 'desc' });
        if (cancelled) return;
        setProjects(asArray(response).map(mapProject).filter((project) => project.id > 0));
      } catch (error) {
        if (cancelled) return;
        setProjects([]);
        setLoadError(error instanceof Error ? error.message : 'Unable to load projects.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProjects();
    return () => {
      cancelled = true;
    };
  }, []);

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    projects.forEach((p) => {
      p.skills.forEach((s) => skillSet.add(s));
    });
    return Array.from(skillSet).sort();
  }, [projects]);

  const filteredAndSortedProjects = useMemo(() => {
    let results = [...projects];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.skills.some((s) => s.toLowerCase().includes(query)) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    // Filter by skills
    if (filterSkills.length > 0) {
      results = results.filter((p) =>
        filterSkills.some((s) => p.skills.includes(s))
      );
    }

    // Filter by level
    if (filterLevel.length > 0) {
      results = results.filter((p) => p.level && filterLevel.includes(p.level));
    }

    // Filter by budget
    results = results.filter((p) => p.budget >= filterBudget[0] && p.budget <= filterBudget[1]);

    // Sort
    switch (sortBy) {
      case 'recent':
        results.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      case 'budget':
        results.sort((a, b) => b.budget - a.budget);
        break;
      case 'proposals':
        results.sort((a, b) => (b.proposals || 0) - (a.proposals || 0));
        break;
    }

    return results;
  }, [projects, searchQuery, filterSkills, filterLevel, filterBudget, sortBy]);

  if (!mounted) {
    return null;
  }

  return (
    <main className={cn(commonStyles.page, themeStyles.page)}>
      {/* Header */}
      <section className={cn(commonStyles.header, themeStyles.header)}>
        <div className={commonStyles.headerContent}>
          <h1>Project Marketplace</h1>
          <p>Discover exciting projects from verified clients worldwide</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className={cn(commonStyles.searchSection, themeStyles.searchSection)}>
        <div className={commonStyles.searchContainer}>
          <Search className={commonStyles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search by project title, skill, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(commonStyles.searchInput, themeStyles.searchInput)}
          />
        </div>

        <div className={commonStyles.filterBar}>
          <div className={commonStyles.sortControl}>
            <SortAsc size={18} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={cn(commonStyles.select, themeStyles.select)}
            >
              <option value="recent">Most Recent</option>
              <option value="budget">Highest Budget</option>
              <option value="proposals">Most Popular</option>
            </select>
          </div>

          <details className={commonStyles.skillFilter}>
            <summary className={cn(commonStyles.filterButton, themeStyles.filterButton)}>
              <Filter size={18} />
              Skills ({filterSkills.length})
            </summary>
            <div className={commonStyles.skillOptions}>
              {allSkills.map((skill) => (
                <label key={skill} className={commonStyles.skillCheckbox}>
                  <input
                    type="checkbox"
                    checked={filterSkills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterSkills([...filterSkills, skill]);
                      } else {
                        setFilterSkills(filterSkills.filter((s) => s !== skill));
                      }
                    }}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </details>

          <details className={commonStyles.levelFilter}>
            <summary className={cn(commonStyles.filterButton, themeStyles.filterButton)}>
              <Zap size={18} />
              Level ({filterLevel.length})
            </summary>
            <div className={commonStyles.levelOptions}>
              {['Entry', 'Intermediate', 'Expert'].map((level) => (
                <label key={level} className={commonStyles.levelCheckbox}>
                  <input
                    type="checkbox"
                    checked={filterLevel.includes(level)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFilterLevel([...filterLevel, level]);
                      } else {
                        setFilterLevel(filterLevel.filter((l) => l !== level));
                      }
                    }}
                  />
                  <span>{level}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <Loading />
      ) : loadError ? (
        <div className={commonStyles.emptyState} role="alert">
          <p>{loadError}</p>
        </div>
      ) : filteredAndSortedProjects.length === 0 ? (
        <div className={commonStyles.emptyState}>
          <p>No projects found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <section className={commonStyles.listSection}>
          <motion.div
            className={commonStyles.list}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAndSortedProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                className={cn(commonStyles.card, themeStyles.card)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Header */}
                <div className={commonStyles.cardHeader}>
                  <div className={commonStyles.cardTitle}>
                    <h3 className={commonStyles.title}>{project.title}</h3>
                    {project.level && (
                      <span className={cn(commonStyles.levelBadge, commonStyles[`level${project.level}`])}>
                        {project.level}
                      </span>
                    )}
                  </div>
                  {project.client && (
                    <div className={commonStyles.client}>
                      {project.client.avatar ? (
                        <img src={project.client.avatar} alt={project.client.name} />
                      ) : (
                        <div className={commonStyles.clientPlaceholder}>
                          {project.client.name.charAt(0)}
                        </div>
                      )}
                      <div className={commonStyles.clientInfo}>
                        <p className={commonStyles.clientName}>{project.client.name}</p>
                        {project.client.rating && (
                          <div className={commonStyles.rating}>
                            <Star size={14} className={commonStyles.starIcon} />
                            <span>{project.client.rating}</span>
                            <span className={commonStyles.reviews}>({project.client.reviews} reviews)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className={commonStyles.description}>{project.description}</p>

                {/* Meta Info */}
                <div className={commonStyles.meta}>
                  <div className={commonStyles.metaItem}>
                    <DollarSign size={16} />
                    <span className={commonStyles.budget}>
                      {project.type === 'Hourly' ? `$${project.budget}/hr` : `$${project.budget.toLocaleString()}`}
                    </span>
                    {project.type && <span className={commonStyles.type}>{project.type}</span>}
                  </div>
                  {project.duration && (
                    <div className={commonStyles.metaItem}>
                      <Clock size={16} />
                      <span>{project.duration}</span>
                    </div>
                  )}
                  {project.hoursPerWeek && (
                    <div className={commonStyles.metaItem}>
                      <Calendar size={16} />
                      <span>{project.hoursPerWeek} hrs/week</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {project.skills.length > 0 && (
                  <div className={commonStyles.skills}>
                    {project.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className={commonStyles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className={commonStyles.skillTag}>+{project.skills.length - 4}</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className={commonStyles.cardFooter}>
                  <div className={commonStyles.stats}>
                    {project.proposals !== undefined && (
                      <div className={commonStyles.stat}>
                        <Users size={14} />
                        <span>{project.proposals} proposals</span>
                      </div>
                    )}
                    {project.views !== undefined && (
                      <div className={commonStyles.stat}>
                        <Eye size={14} />
                        <span>{project.views} views</span>
                      </div>
                    )}
                    {project.posted && (
                      <div className={commonStyles.stat}>
                        <Clock size={14} />
                        <span>{project.posted}</span>
                      </div>
                    )}
                  </div>
                  <Link href={`/client/projects/${project.id}`}>
                    <Button variant="primary" size="sm" className={commonStyles.viewBtn}>
                      View Project
                      <ChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* Results Count */}
      <div className={commonStyles.resultCount}>
        Showing {filteredAndSortedProjects.length} of {projects.length} projects
      </div>
    </main>
  );
};

export default ProjectMarketplacePage;
