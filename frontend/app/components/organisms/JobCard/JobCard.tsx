// @AI-HINT: JobCard component for displaying job listings in the freelancer portal.
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { authApi, proposalsApi } from '@/lib/api';
import Button from '@/app/components/atoms/Button/Button';
import { Heart, ShieldCheck, Star, Clock, MapPin, Sparkles } from 'lucide-react';
import common from './JobCard.common.module.css';
import light from './JobCard.light.module.css';
import dark from './JobCard.dark.module.css';

export interface JobCardProps {
  id: string | number;
  title: string;
  clientName: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  budget?: string | number; // Fallback
  skills: string[];
  postedTime: string;
  matchScore?: number;
  clientRating?: number;
  isVerified?: boolean;
  location?: string;
}

const JobCard: React.FC<JobCardProps> = ({
  id,
  title,
  clientName,
  description,
  budgetMin,
  budgetMax,
  budget,
  skills,
  postedTime,
  matchScore,
  clientRating = 0,
  isVerified = false,
  location = 'Remote',
}) => {
  const { resolvedTheme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const themeStyles = resolvedTheme === 'dark' ? dark : light;

  const displayBudget = budgetMin !== undefined && budgetMax !== undefined
    ? `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`
    : typeof budget === 'number' 
      ? `$${budget.toLocaleString()}`
      : budget || 'Negotiable';

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  useEffect(() => {
    let mounted = true;
    const checkApplied = async () => {
      try {
        const user = await authApi.me();
        if (!user || !user.id) return;
        const resp: any = await proposalsApi.list({ project_id: Number(id) });
        // API may return array or { data: [] }
        const items = Array.isArray(resp) ? resp : resp?.proposals || resp?.data || [];
        if (!mounted) return;
        const applied = items.some((p: any) => Number(p.freelancer_id) === Number(user.id));
        setHasApplied(Boolean(applied));
      } catch (err) {
        // ignore errors silently; don't block rendering
      }
    };
    checkApplied();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className={cn(common.card, themeStyles.card)}>
      {matchScore && matchScore > 80 && (
        <div className={cn(common.matchBadge, themeStyles.matchBadge)}>
          <Sparkles size={12} />
          {matchScore}% Match
        </div>
      )}

      <div className={common.header}>
        <div className={common.headerContent}>
          <div className={common.titleRow}>
            <h3 className={cn(common.title, themeStyles.title)}>{title}</h3>
          </div>
          
          <div className={common.clientRow}>
            <span className={cn(common.clientName, themeStyles.clientName)}>{clientName}</span>
            {isVerified && (
              <span className={cn(common.verifiedBadge, themeStyles.verifiedBadge)}>
                <ShieldCheck size={10} /> Verified
              </span>
            )}
            {clientRating > 0 && (
              <div className={cn(common.rating, themeStyles.rating)}>
                <Star size={10} fill="currentColor" />
                {clientRating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        <div className={common.budgetWrapper}>
          <span className={cn(common.budget, themeStyles.budget)}>
            {displayBudget}
          </span>
          <span className={common.budgetType}>Fixed Price</span>
        </div>
      </div>

      {description && <p className={cn(common.description, themeStyles.description)}>{description}</p>}

      <div className={common.tags}>
        {skills.slice(0, 4).map(skill => (
          <span key={skill} className={cn(common.tag, themeStyles.tag)}>{skill}</span>
        ))}
        {skills.length > 4 && (
          <span className={cn(common.tag, themeStyles.tag)}>+{skills.length - 4}</span>
        )}
      </div>

      <div className={cn(common.footer, themeStyles.footer)}>
        <div className={common.meta}>
          <div className={common.metaItem}>
            <Clock size={14} />
            <span>Posted {new Date(postedTime).toLocaleDateString()}</span>
          </div>
          <div className={common.metaItem}>
            <MapPin size={14} />
            <span>{location}</span>
          </div>
        </div>

        <div className={common.actions}>
          <button
            className={cn(
              common.saveButton,
              themeStyles.saveButton,
              isSaved && themeStyles.saveButtonActive
            )}
            onClick={toggleSave}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
          <Link href={`/jobs/${id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
          {hasApplied ? (
            <Link href={`/freelancer/submit-proposal?jobId=${id}`}>
              <Button variant="outline" size="sm">Edit Proposal</Button>
            </Link>
          ) : (
            <Link href={`/freelancer/submit-proposal?jobId=${id}`}>
              <Button variant="primary" size="sm">Apply Now</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
