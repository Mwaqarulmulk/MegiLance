import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";

// @AI-HINT: Hook to fetch client portal datasets (projects, payments, freelancers, reviews).
// Uses proper cleanup to prevent memory leaks and request abortion issues.

export type ClientProject = {
  id: string;
  title: string;
  status:
    | "Open"
    | "In Progress"
    | "Completed"
    | "Pending"
    | "Cancelled"
    | "open"
    | "in_progress"
    | "completed"
    | "cancelled";
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
  status: "Completed" | "Paid" | "Pending" | "Failed";
  type: "Payment" | "Refund";
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
  const [freelancers, setFreelancers] = useState<ClientFreelancer[] | null>(
    null,
  );
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
    // Safety net: if an upstream request hangs well past the per-request
    // timeout (15s + one retry), stop the spinner so the page can render its
    // empty/loaded state. Do NOT fabricate an error here — a slow network is
    // not the same as a failed load, and the real requests will still settle
    // and set a genuine error if projects actually failed.
    const safetyTimeout = setTimeout(() => {
      if (mountedRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }, 20000);

    try {
      const freelancersPromise =
        api.client?.getFreelancers?.() ?? Promise.resolve([]);
      const reviewsPromise = api.client?.getReviews?.() ?? Promise.resolve([]);

      const [projectsResult, paymentsResult, freelancersResult, reviewsResult] =
        await Promise.allSettled([
          api.client.getProjects(),
          api.client.getPayments(),
          freelancersPromise,
          reviewsPromise,
        ]);

      if (!mountedRef.current) return;

      const settle = <T>(result: PromiseSettledResult<T>, fallback: T): T =>
        result.status === "fulfilled" ? result.value : fallback;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const projectsRes = settle(projectsResult, { projects: [] } as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentsRes = settle(paymentsResult, { payments: [] } as any);
      const freelancersData = settle(freelancersResult, [] as any[]);
      const reviewsData = settle(reviewsResult, [] as any[]);

      const projectsData: any[] = Array.isArray(projectsRes)
        ? projectsRes
        : (projectsRes as any)?.items || (projectsRes as any)?.projects || [];
      const paymentsData: any[] = Array.isArray(paymentsRes)
        ? paymentsRes
        : (paymentsRes as any)?.payments || [];

      const mappedProjects: ClientProject[] = (projectsData || []).map(
        (p: any) => {
          const budgetAmount = (p.budget ||
            p.budget_max ||
            p.budget_min ||
            0) as string | number;
          const budgetStr =
            typeof budgetAmount === "number"
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
            skills: Array.isArray(p.skills)
              ? p.skills
              : typeof p.skills === "string" && p.skills
                ? p.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [],
            client: p.client_name || p.client,
          };
        },
      );
      setProjects(mappedProjects);

      const mappedPayments: ClientPayment[] = (paymentsData || []).map(
        (p: any) => ({
          id: p.id,
          date: p.date || p.created_at,
          description: p.description,
          amount:
            typeof p.amount === "string" && p.amount.startsWith("$")
              ? p.amount
              : `$${parseFloat(String(p.amount || "0")).toLocaleString()}`,
          status: p.status,
          type: p.type || p.payment_type || "Payment",
          project: p.project,
          freelancer: p.freelancer || p.freelancer_name,
          freelancerAvatarUrl: p.freelancerAvatarUrl,
        }),
      );
      setPayments(mappedPayments);

      const mappedFreelancers: ClientFreelancer[] = (freelancersData || []).map(
        (f: any) => ({
          id: f.id,
          name: f.name,
          title: f.title,
          rating: f.rating as number,
          hourlyRate: f.hourlyRate as string,
          skills: f.skills as string[],
          completedProjects: f.completedProjects as number,
          avatarUrl: f.avatarUrl,
          location: f.location,
          availability: f.availability,
        }),
      );
      setFreelancers(mappedFreelancers);

      const mappedReviews: ClientReview[] = (reviewsData || []).map(
        (r: any) => ({
          id: r.id,
          projectTitle: r.projectTitle,
          freelancerName: r.freelancerName,
          rating: r.rating as number,
          comment: r.comment as string,
          date: r.date as string,
          avatarUrl: r.avatarUrl,
        }),
      );
      setReviews(mappedReviews);

      // Only surface a blocking error when the PRIMARY dataset (projects)
      // genuinely failed to load. An empty result is success — the page shows
      // its "No projects yet" empty state. Payments/reviews/freelancers
      // failing is non-critical and must not hide a perfectly good (or empty)
      // projects list behind a scary "couldn't load" banner.
      if (projectsResult.status === "rejected") {
        const reason = projectsResult.reason;
        // A 401 is handled globally (token refresh / redirect); don't surface it.
        const isAuth =
          reason instanceof Error && reason.name === "APIError" &&
          (reason as { status?: number }).status === 401;
        if (!isAuth) {
          setError("We couldn't load your projects. Check your connection and try again.");
        }
      }
    } catch (e: unknown) {
      // Don't update state if unmounted or if it's an abort error
      if (!mountedRef.current) return;
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load client data");
    } finally {
      clearTimeout(safetyTimeout);
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

  return { projects, payments, freelancers, reviews, loading, error, refetch: load } as const;
}
