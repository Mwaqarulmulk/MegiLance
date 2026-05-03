// @AI-HINT: Simple hook to fetch AI-powered freelancer recommendations for clients
'use client';

import { useEffect, useState } from 'react';
import { matchingApi, APIError } from '@/lib/api';

interface RawRecommendation {
  freelancer_id: string | number;
  freelancer_name?: string;
  freelancer_bio?: string;
  match_factors?: { avg_rating?: number };
  hourly_rate?: number;
  profile_image_url?: string;
  location?: string;
  match_score?: number;
  headline?: string;
  experience_level?: string;
  availability_status?: string;
  profile_slug?: string;
  skills?: string;
}

export interface Recommendation {
  id: string;
  name: string;
  title: string;
  rating: number;
  hourlyRate: string;
  avatarUrl?: string;
  location?: string;
  matchScore?: number;
  headline?: string;
  experienceLevel?: string;
  availabilityStatus?: string;
  profileSlug?: string;
  skills?: string[];
}

export function useRecommendations(limit: number = 5) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);

        const data = await matchingApi.getRecommendations() as { recommendations?: RawRecommendation[] };

        if (cancelled) return;

        if (data.recommendations && Array.isArray(data.recommendations)) {
          const mapped = data.recommendations.slice(0, limit).map((r: RawRecommendation) => ({
            id: String(r.freelancer_id),
            name: r.freelancer_name || 'Unknown',
            title: r.headline || (r.freelancer_bio ? r.freelancer_bio.substring(0, 50) + '...' : 'Freelancer'),
            rating: r.match_factors?.avg_rating ? r.match_factors.avg_rating * 5 : 4.5,
            hourlyRate: r.hourly_rate ? `$${r.hourly_rate}/hr` : '$0/hr',
            avatarUrl: r.profile_image_url || '/avatars/default.jpg',
            location: r.location || 'Remote',
            matchScore: r.match_score,
            headline: r.headline,
            experienceLevel: r.experience_level,
            availabilityStatus: r.availability_status,
            profileSlug: r.profile_slug,
            skills: r.skills ? (typeof r.skills === 'string' ? r.skills.split(',').map((s: string) => s.trim()) : r.skills) : [],
          }));
          setRecommendations(mapped);
          setError(null);
        } else {
          setRecommendations([]);
          setError(null);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof APIError ? err.message
          : err instanceof Error ? err.message
          : 'Failed to fetch recommendations';
        setError(message);
        setRecommendations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [limit]);

  return { recommendations, loading, error };
}
