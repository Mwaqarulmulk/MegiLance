// @AI-HINT: Component to display similar jobs using the Matching Engine
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import commonStyles from './SimilarJobs.common.module.css';
import lightStyles from './SimilarJobs.light.module.css';
import darkStyles from './SimilarJobs.dark.module.css';

interface SimilarJobsProps {
  projectId?: string;
  description?: string;
  limit?: number;
}

interface JobMatch {
  id: string;
  title: string;
  budget_min: number;
  budget_max: number;
  skills: string[];
  match_score: number;
}

export default function SimilarJobs({ projectId, description, limit = 3 }: SimilarJobsProps) {
  const { resolvedTheme } = useTheme();
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!projectId && !description) return;
      
      setLoading(true);
      try {
        const response: any = await (api.matching as any).findJobs?.({ 
            project_id: projectId, 
            description, 
            limit 
        });
        
        if (response && response.matches && response.matches.length > 0) {
             setJobs(response.matches);
        }
      } catch {
         // Leave jobs empty on error — no mock fallback
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [projectId, description, limit]);

  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  if (loading) {
    return <div className={cn(commonStyles.container, themeStyles.title)}>Loading recommendations...</div>;
  }

  if (jobs.length === 0) return null;

  return (
    <div className={cn(commonStyles.container)}>
      <h3 className={cn(commonStyles.title, themeStyles.title)}>Similar Jobs</h3>
      <div className={cn(commonStyles.grid)}>
        {jobs.map((job) => (
          <div key={job.id} className={cn(commonStyles.card, themeStyles.card)}>
            <div className={cn(commonStyles.cardHeader)}>
              <div className={cn(commonStyles.jobTitle, themeStyles.jobTitle)}>{job.title}</div>
              <div className={cn(commonStyles.matchScore, themeStyles.matchScore)}>
                {Math.round(job.match_score * 100)}% Match
              </div>
            </div>
            <div className={cn(commonStyles.budget, themeStyles.budget)}>
              ${job.budget_min} - ${job.budget_max}
            </div>
            <div className={cn(commonStyles.skills)}>
              {job.skills.map((skill) => (
                <span key={skill} className={cn(commonStyles.skill, themeStyles.skill)}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
