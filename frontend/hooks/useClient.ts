import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api';

// @AI-HINT: Hook to fetch client portal datasets (projects, payments, freelancers, reviews).
// Uses proper cleanup to prevent memory leaks and request abortion issues.

export type ClientProject = { 
  id: string; 
  title: string; 
  status: 'Open' | 'In Progress' | 'Completed' | 'Pending' | 'Cancelled' | 'open' | 'in_progress' | 'completed' | 'cancelled'; 
  budget: string; 
  updatedAt?: string;
  updated?: string;
  description?: string;
  skills?: string[];
  client?: string;
  progress?: number;
  paid?: number;
  freelancers?: { id: string; name: string }[];
  proposals_count?: number;
};

export type ClientPayment = { 
  id: string; 
  date: string; 
  description: string; 
  amount: string; 
  status: 'Completed' | 'Paid' | 'Pending' | 'Failed';
  type: 'Payment' | 'Refund';
  project?: string;
  freelancer?: string;
  freelancerAvatarUrl?: string;
};

export type ClientFreelancer = { 
  id: string; 
  name: string; 
  title: string; 
  rating: number; 
  hourlyRate: string;
  skills: string[];
  completedProjects: number;
  avatarUrl?: string;
  location?: string;
  availability?: string;
};

export type ClientReview = { 
  id: string; 
  projectTitle: string; 
  freelancerName: string; 
  rating: number; 
  comment: string;
  date: string;
  avatarUrl?: string;
};

export function useClientData() {
  const [projects, setProjects] = useState<ClientProject[] | null>(null);
  const [payments, setPayments] = useState<ClientPayment[] | null>(null);
  const [freelancers, setFreelancers] = useState<ClientFreelancer[] | null>(null);
  const [reviews, setReviews] = useState<ClientReview[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchWithFallback = async <T>(promise: Promise<T>, fallback: T): Promise<T> => {
        try {
          return await promise;
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            throw err;
          }
          return fallback;
        }
      };
      
      const freelancersPromise = api.client?.getFreelancers?.() ?? Promise.resolve([]);
      const reviewsPromise = api.client?.getReviews?.() ?? Promise.resolve([]);
      
      const [projectsRes, paymentsRes, freelancersData, reviewsData] = await Promise.all([
        fetchWithFallback<unknown>(api.client.getProjects(), { projects: [] }),
        fetchWithFallback<unknown>(api.client.getPayments(), { payments: [] }),
        fetchWithFallback(freelancersPromise, []),
        fetchWithFallback(reviewsPromise, []),
      ]);
        
      // Check if component is still mounted before updating state
      if (!mountedRef.current) return;
      
      // Extract arrays from response objects (API returns {total, projects} or {total, payments} structure)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectsData: any[] = Array.isArray(projectsRes) ? projectsRes : ((projectsRes as any)?.projects || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentsData: any[] = Array.isArray(paymentsRes) ? paymentsRes : ((paymentsRes as any)?.payments || []);
        
      // Map projects - handle API response format (budget_min/budget_max instead of budget)
      const mappedProjects: ClientProject[] = (projectsData || []).map((p: any) => {
        // Calculate budget display - use budget_max or budget_min if budget isn't available
        const budgetAmount = (p.budget || p.budget_max || p.budget_min || 0) as string | number;
        const budgetStr = typeof budgetAmount === 'number' 
          ? `$${budgetAmount.toLocaleString()}` 
          : budgetAmount;
        
        return {
          id: String(p.id),
          title: p.title,
          status: p.status,
          budget: budgetStr,
          updatedAt: p.updated_at || p.updatedAt,
          progress: p.progress,
          paid: p.paid,
          freelancers: p.freelancers,
          description: p.description,
          proposals_count: p.proposals_count || 0,
        };
      });
      setProjects(mappedProjects);

      // Map payments
      const mappedPayments: ClientPayment[] = (paymentsData || []).map((p: any) => ({
        id: p.id,
        date: p.date,
        description: p.description,
        amount: typeof p.amount === 'string' && p.amount.startsWith('$') ? p.amount : `$${parseFloat(String(p.amount || '0')).toLocaleString()}`,
        status: p.status,
        type: p.type,
        project: p.project,
        freelancer: p.freelancer,
        freelancerAvatarUrl: p.freelancerAvatarUrl
      }));
      setPayments(mappedPayments);

      // Map freelancers
      const mappedFreelancers: ClientFreelancer[] = (freelancersData || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        title: f.title,
        rating: f.rating as number,
        hourlyRate: f.hourlyRate as string,
        skills: f.skills as string[],
        completedProjects: f.completedProjects as number,
        avatarUrl: f.avatarUrl,
        location: f.location,
        availability: f.availability
      }));
      setFreelancers(mappedFreelancers);

      // Map reviews
      const mappedReviews: ClientReview[] = (reviewsData || []).map((r: any) => ({
        id: r.id,
        projectTitle: r.projectTitle,
        freelancerName: r.freelancerName,
        rating: r.rating as number,
        comment: r.comment as string,
        date: r.date as string,
        avatarUrl: r.avatarUrl
      }));
      setReviews(mappedReviews);

    } catch (e: unknown) {
      // Don't update state if unmounted or if it's an abort error
      if (!mountedRef.current) return;
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Failed to load client data');
    } finally {
      loadingRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    
    return () => { 
      mountedRef.current = false; 
    };
  }, [load]);

  return { projects, payments, freelancers, reviews, loading, error } as const;
}