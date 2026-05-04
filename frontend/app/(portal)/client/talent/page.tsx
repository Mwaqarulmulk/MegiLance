'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useRecommendations, Recommendation } from '@/hooks/useRecommendations';
import Button from '@/app/components/atoms/Button/Button';
import Loading from '@/app/components/atoms/Loading/Loading';
import {
  Star,
  MapPin,
  Award,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Search,
  Filter,
  SortAsc,
  Clock,
  DollarSign,
} from 'lucide-react';

import commonStyles from './TalentShowcase.common.module.css';
import lightStyles from './TalentShowcase.light.module.css';
import darkStyles from './TalentShowcase.dark.module.css';

const TalentShowcasePage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const { recommendations: freelancers, loading } = useRecommendations(50);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'match' | 'rate'>('rating');
  const [filterSkills, setFilterSkills] = useState<string[]>([]);

  const themeStyles = mounted && resolvedTheme === 'dark' ? darkStyles : lightStyles;

  useEffect(() => {
    setMounted(true);
  }, []);

  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    if (Array.isArray(freelancers)) {
      freelancers.forEach((f) => {
        if (Array.isArray(f.skills)) {
          f.skills.forEach((s) => skillSet.add(s));
        }
      });
    }
    return Array.from(skillSet).sort();
  }, [freelancers]);

  const filteredAndSortedFreelancers = useMemo(() => {
    let results = Array.isArray(freelancers) ? [...freelancers] : [];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.title.toLowerCase().includes(query) ||
          f.headline?.toLowerCase().includes(query) ||
          (f.skills && f.skills.some((s) => s.toLowerCase().includes(query)))
      );
    }

    // Filter by skills
    if (filterSkills.length > 0) {
      results = results.filter((f) =>
        f.skills && filterSkills.some((s) => f.skills?.includes(s))
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'match':
        results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'rate':
        const getRate = (hourlyRate: string) => {
          const match = hourlyRate.match(/\$(\d+)/);
          return match ? parseInt(match[1]) : 0;
        };
        results.sort((a, b) => getRate(b.hourlyRate) - getRate(a.hourlyRate));
        break;
    }

    return results;
  }, [freelancers, searchQuery, filterSkills, sortBy]);

  if (!mounted) {
    return null;
  }

  return (
    <main className={cn(commonStyles.page, themeStyles.page)}>
      {/* Header */}
      <section className={cn(commonStyles.header, themeStyles.header)}>
        <div className={commonStyles.headerContent}>
          <h1>Discover Top Talent</h1>
          <p>Find verified freelancers ready to work on your projects</p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className={cn(commonStyles.searchSection, themeStyles.searchSection)}>
        <div className={commonStyles.searchContainer}>
          <Search className={commonStyles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Search by name, skill, or expertise..."
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
              <option value="rating">Highest Rated</option>
              <option value="match">Best Match</option>
              <option value="rate">Hourly Rate</option>
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
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <Loading />
      ) : filteredAndSortedFreelancers.length === 0 ? (
        <div className={commonStyles.emptyState}>
          <p>No freelancers found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <section className={commonStyles.gridSection}>
          <motion.div
            className={commonStyles.grid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filteredAndSortedFreelancers.map((freelancer, idx) => (
              <motion.div
                key={freelancer.id}
                className={cn(commonStyles.card, themeStyles.card)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Avatar */}
                <div className={commonStyles.cardHeader}>
                  <div className={commonStyles.avatar}>
                    {freelancer.avatarUrl ? (
                      <img src={freelancer.avatarUrl} alt={freelancer.name} />
                    ) : (
                      <div className={commonStyles.avatarPlaceholder}>
                        {freelancer.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {freelancer.experienceLevel && (
                    <div className={commonStyles.badge}>★ {freelancer.experienceLevel}</div>
                  )}
                </div>

                {/* Info */}
                <div className={commonStyles.cardContent}>
                  <h3 className={commonStyles.name}>{freelancer.name}</h3>
                  <p className={commonStyles.title}>{freelancer.title}</p>

                  {freelancer.location && (
                    <div className={commonStyles.location}>
                      <MapPin size={14} />
                      <span>{freelancer.location}</span>
                    </div>
                  )}

                  {/* Rating & Match Score */}
                  <div className={commonStyles.ratingSection}>
                    <div className={commonStyles.rating}>
                      <Star size={16} className={commonStyles.starIcon} />
                      <span className={commonStyles.ratingValue}>
                        {freelancer.rating.toFixed(1)}
                      </span>
                      {freelancer.matchScore && (
                        <span className={commonStyles.reviews}>
                          ({freelancer.matchScore.toFixed(0)}% match)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className={commonStyles.stats}>
                    {freelancer.hourlyRate && (
                      <div className={commonStyles.stat}>
                        <DollarSign size={14} />
                        <span>{freelancer.hourlyRate}</span>
                      </div>
                    )}
                    {freelancer.availabilityStatus && (
                      <div className={commonStyles.stat}>
                        <Clock size={14} />
                        <span>{freelancer.availabilityStatus}</span>
                      </div>
                    )}
                    {freelancer.experienceLevel && (
                      <div className={commonStyles.stat}>
                        <TrendingUp size={14} />
                        <span>{freelancer.experienceLevel}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className={commonStyles.skills}>
                      {freelancer.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className={commonStyles.skillTag}>
                          {skill}
                        </span>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <span className={commonStyles.skillTag}>
                          +{freelancer.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Headline */}
                  {freelancer.headline && (
                    <p className={commonStyles.bio}>{freelancer.headline}</p>
                  )}
                </div>

                {/* Actions */}
                <div className={commonStyles.cardFooter}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={commonStyles.actionBtn}
                  >
                    <MessageSquare size={16} />
                    Message
                  </Button>
                  <Link href={`/freelancer/${freelancer.id}`}>
                    <Button variant="primary" size="sm" className={commonStyles.actionBtn}>
                      <BookOpen size={16} />
                      View Profile
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
        Showing {filteredAndSortedFreelancers.length} of{' '}
        {Array.isArray(freelancers) ? freelancers.length : 0} freelancers
      </div>
    </main>
  );
};

export default TalentShowcasePage;
