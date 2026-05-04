'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
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
  MapPin,
  Clock,
  TrendingUp,
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
  status?: 'Open' | 'In Progress' | 'Completed';
  type?: 'Fixed' | 'Hourly';
  hoursPerWeek?: number;
}

const ProjectMarketplacePage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'budget' | 'proposals'>('recent');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);
  const [filterLevel, setFilterLevel] = useState<string[]>([]);
  const [filterBudget, setFilterBudget] = useState<[number, number]>([0, 10000]);

  const themeStyles = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulated data - in production, fetch from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects([
        {
          id: 1,
          title: 'Build E-commerce Platform with Next.js',
          description: 'Looking for experienced developer to build a full-featured e-commerce platform with product catalog, shopping cart, and payment integration.',
          budget: 5000,
          type: 'Fixed',
          level: 'Expert',
          skills: ['Next.js', 'React', 'TypeScript', 'Stripe'],
          category: 'Web Development',
          client: { name: 'Tech Startup Inc', rating: 4.8, reviews: 24 },
          proposals: 12,
          views: 487,
          posted: '2 days ago',
        },
        {
          id: 2,
          title: 'Mobile App UI/UX Design',
          description: 'Need creative designer to create stunning UI/UX for iOS and Android mobile application. Must have experience with Figma and user research.',
          budget: 2500,
          type: 'Fixed',
          level: 'Intermediate',
          skills: ['Figma', 'UI Design', 'UX Design', 'Mobile Design'],
          category: 'Design',
          client: { name: 'Digital Agency Co', rating: 4.9, reviews: 56 },
          proposals: 8,
          views: 312,
          posted: '1 day ago',
        },
        {
          id: 3,
          title: 'Python Data Analysis Project',
          description: 'Analyze large dataset and create visualizations. Need someone proficient in pandas, numpy, and matplotlib. Deliver Jupyter notebooks with insights.',
          budget: 1500,
          type: 'Fixed',
          level: 'Intermediate',
          skills: ['Python', 'Data Analysis', 'Pandas', 'Matplotlib'],
          category: 'Data Science',
          client: { name: 'Analytics Firm', rating: 4.7, reviews: 18 },
          proposals: 15,
          views: 623,
          posted: '3 days ago',
        },
        {
          id: 4,
          title: 'WordPress Site Customization',
          description: 'Customize existing WordPress site with custom plugins and theme modifications. Update booking system and improve site speed.',
          budget: 800,
          type: 'Fixed',
          level: 'Entry',
          skills: ['WordPress', 'PHP', 'CSS', 'jQuery'],
          category: 'WordPress',
          client: { name: 'Small Business LLC', rating: 4.5, reviews: 9 },
          proposals: 5,
          views: 156,
          posted: '5 days ago',
        },
        {
          id: 5,
          title: 'Ongoing Content Writing - Blog Posts',
          description: 'Need continuous content writing for tech blog. 2-3 posts per week about web development, startups, and technology trends.',
          budget: 25,
          type: 'Hourly',
          hoursPerWeek: 10,
          level: 'Intermediate',
          skills: ['Content Writing', 'Technical Writing', 'SEO'],
          category: 'Writing',
          client: { name: 'Media Company', rating: 4.6, reviews: 41 },
          proposals: 22,
          views: 891,
          posted: '1 week ago',
        },
        {
          id: 6,
          title: 'Social Media Management',
          description: 'Long-term social media management for tech startup. Handle Instagram, Twitter, and LinkedIn. Create content calendar and manage engagement.',
          budget: 30,
          type: 'Hourly',
          hoursPerWeek: 20,
          level: 'Intermediate',
          skills: ['Social Media', 'Content Creation', 'Community Management'],
          category: 'Marketing',
          client: { name: 'Startup Hub', rating: 4.8, reviews: 33 },
          proposals: 18,
          views: 567,
          posted: '4 days ago',
        },
      ]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
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
        results.sort((a, b) => (b.posted ? 1 : 0) - (a.posted ? 1 : 0));
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
                  <Link href={`/project/${project.id}`}>
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
