import { useEffect, useState } from "react";
import api from "@/lib/api";
import { apiFetch } from "@/lib/api";

// @AI-HINT: Hook to fetch freelancer portal datasets (projects, jobs, wallet, analytics).

// Normalize a match/fit score to a 0–100 percent regardless of whether the
// backend sends a fraction (0–1) or an already-scaled value (0–100). Prevents
// bugs like "8500% fit" from blindly multiplying an 0–100 score by 100.
const toMatchPercent = (raw: unknown): number => {
  const n = Number(raw) || 0;
  const scaled = n > 0 && n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, Math.round(scaled)));
};

interface ProjectResponse {
  id: number | string;
  title?: string;
  client_name?: string;
  total_amount?: number;
  start_date?: string;
  status?: string;
}

interface JobResponse {
  id: number | string;
  title?: string;
  client_name?: string;
  description?: string;
  budget_max?: number;
  created_at?: string;
  skills?: string[];
}

interface RecommendationResponse {
  project_id: number | string;
  project_title?: string;
  project_description?: string;
  budget_max?: number;
  budget_min?: number;
  created_at?: string;
  match_score?: number;
}

interface ProposalResponse {
  id: number | string;
  project_title?: string;
  status?: string;
  created_at?: string;
  hourly_rate?: number;
  estimated_hours?: number;
}

interface TransactionResponse {
  id: number | string;
  amount?: number;
  created_at?: string;
  description?: string;
  payment_type?: string;
  status?: string;
}

export type FreelancerProject = {
  id: string;
  title: string;
  clientName: string;
  budget: string;
  postedTime: string;
  tags: string[];
  status: "Active" | "Completed" | "Pending";
};

export type FreelancerJob = {
  id: string;
  title: string;
  clientName: string;
  description?: string;
  budget: number;
  postedTime: string;
  skills: string[];
  status: "Open" | "Applied" | "Hired";
  // Optional fields used in UI mappings
  progress?: number;
  paid?: number;
  freelancers?: { id: string; name: string; avatarUrl?: string }[];
  updatedAt?: string;
  matchScore?: number;
};

export type FreelancerTransaction = {
  id: string;
  amount: string;
  date: string;
  description: string;
  type: "Payment" | "Withdrawal" | "Refund";
  status: "Completed" | "Pending" | "Failed";
};

export type FreelancerAnalytics = {
  activeProjects: number;
  pendingProposals: number;
  walletBalance: string;
  rank: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "N/A";
  totalEarnings: string;
  completedProjects: number;
  profileViews?: number;
  applicationsSent?: number;
  successRate?: number;
  averageRating?: number;
  availabilityStatus?: string;
  profileCompleteness?: number;
  headline?: string;
};

export type MonthlyEarning = {
  month: string;
  amount: number;
};

export type FreelancerProposal = {
  id: string;
  projectTitle: string;
  status: "Submitted" | "Viewed" | "Accepted" | "Rejected" | "Withdrawn";
  sentDate: string;
  bidAmount: string;
};

export function useFreelancerData() {
  const [projects, setProjects] = useState<FreelancerProject[] | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<
    FreelancerJob[] | null
  >(null);
  const [proposals, setProposals] = useState<FreelancerProposal[] | null>(null);
  const [transactions, setTransactions] = useState<
    FreelancerTransaction[] | null
  >(null);
  const [analytics, setAnalytics] = useState<FreelancerAnalytics | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Use the API client methods
        const fetchWithFallback = async <T>(
          promise: Promise<T>,
          fallback: T,
        ): Promise<T> => {
          try {
            return await promise;
          } catch {
            return fallback;
          }
        };

        const [
          projectsJson,
          walletJson,
          paymentsJson,
          statsJson,
          earningsJson,
          rankJson,
          recommendedJson,
          proposalsJson,
        ]: any[] = await Promise.all([
          fetchWithFallback(api.portal.freelancer.getProjects(), {
            projects: [],
          }),
          fetchWithFallback(api.portal.freelancer.getWallet(), { balance: 0, recent_transactions: [] }),
          fetchWithFallback(api.portal.freelancer.getPayments(), {
            payments: [],
          }),
          fetchWithFallback(api.portal.freelancer.getDashboardStats(), {}),
          fetchWithFallback(api.portal.freelancer.getMonthlyEarnings(6), {
            earnings: [],
          }),
          fetchWithFallback(api.gamification.getMyRank(), {
            rank: "Silver",
            percentile: 50,
          }),
          // Try AI matching first, but fallback is handled below
          fetchWithFallback(api.matching.findJobs(5), { recommendations: [] }),
          fetchWithFallback(api.portal.freelancer.getInvitations({ status: "pending", page_size: 5 }), {
            invitations: [],
          }),
        ]);

        if (!mounted) return;

        // Map Projects - handle both contract and project data formats
        const mappedProjects: FreelancerProject[] = (
          projectsJson.projects || []
        ).map((p: ProjectResponse) => ({
          id: String(p.id),
          title: p.title || "Untitled Project",
          clientName: p.client_name || "Unknown Client",
          budget: `$${p.total_amount || 0}`,
          postedTime: p.start_date || new Date().toISOString(),
          tags: [], // Not available in backend yet
          status:
            p.status === "active" || p.status === "in_progress"
              ? "Active"
              : p.status === "completed"
                ? "Completed"
                : "Pending",
        }));
        setProjects(mappedProjects);

        // Map Recommended Jobs — 3-tier fallback:
        // 1. AI-matched recommendations  2. Invitations  3. Open projects API
        let mappedRecommendedJobs: FreelancerJob[] = [];
        const aiRecommendations = recommendedJson.recommendations || [];
        const invitations = proposalsJson.invitations || proposalsJson.proposals || [];

        if (aiRecommendations.length > 0) {
          // Tier 1: Use AI-matched recommendations (with match score)
          mappedRecommendedJobs = aiRecommendations.map(
            (r: RecommendationResponse) => ({
              id: String(r.project_id),
              title: r.project_title || "Untitled Project",
              clientName: "AI Matched",
              description: r.project_description,
              budget: r.budget_max || r.budget_min || 0,
              postedTime: r.created_at,
              skills: [],
              status: "Open" as const,
              matchScore: toMatchPercent(r.match_score),
            }),
          );
        } else if (invitations.length > 0) {
          // Tier 2: Fallback to invitations
          mappedRecommendedJobs = invitations.slice(0, 5).map((inv: any) => ({
            id: String(inv.project_id || inv.id),
            title: inv.project_title || inv.title || "AI-Matched Project",
            clientName: inv.client_name || "Client",
            description: inv.description,
            budget: inv.budget_max || inv.budget_min || 0,
            postedTime: inv.created_at || inv.sent_date,
            skills: [],
            status: "Open" as const,
            matchScore: inv.fit_score ? toMatchPercent(inv.fit_score) : undefined,
          }));
        } else {
          // Tier 3: Fetch open projects from the projects API
          try {
            const openProjects = (await apiFetch(
              "/projects?status=open&page_size=5",
            )) as { items?: Array<Record<string, unknown>>; projects?: Array<Record<string, unknown>> };
            const openList = openProjects.items || openProjects.projects || [];
            mappedRecommendedJobs = openList.map(
              (p: Record<string, unknown>) => ({
                id: String(p.id),
                title: String(p.title || "Untitled Project"),
                clientName: String(p.client_name || "Client"),
                description: p.description ? String(p.description) : undefined,
                budget: Number(p.budget_max || p.budget_min || 0),
                postedTime: String(p.created_at || new Date().toISOString()),
                skills: typeof p.skills === "string"
                  ? p.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
                  : Array.isArray(p.skills) ? (p.skills as string[]) : [],
                status: "Open" as const,
                matchScore: undefined,
              }),
            );
          } catch {
            // Keep empty — user will see the empty state with a helpful CTA
            mappedRecommendedJobs = [];
          }
        }
        setRecommendedJobs(mappedRecommendedJobs);

        // Map Transactions
        const mappedTransactions: FreelancerTransaction[] = (
          paymentsJson.payments || []
        ).map((t: TransactionResponse) => ({
          id: String(t.id),
          amount: `$${t.amount}`,
          date: t.created_at,
          description: t.description || t.payment_type || "Transaction",
          type: t.payment_type === "withdrawal" ? "Withdrawal" : "Payment",
          status:
            t.status === "completed"
              ? "Completed"
              : t.status === "pending"
                ? "Pending"
                : "Failed",
        }));
        setTransactions(mappedTransactions);

        // Map Analytics
        setAnalytics({
          activeProjects: statsJson.active_projects || 0,
          pendingProposals: statsJson.pending_proposals || 0,
          walletBalance: `$${walletJson.balance || 0}`,
          rank: rankJson.rank || "Silver",
          totalEarnings: `$${statsJson.total_earnings || 0}`,
          completedProjects: statsJson.completed_projects || 0,
          successRate: statsJson.success_rate || 0,
          averageRating: statsJson.average_rating || 0,
          profileViews: statsJson.profile_views || 0,
          availabilityStatus: statsJson.availability_status || undefined,
          profileCompleteness: statsJson.profile_completeness ?? undefined,
          headline: statsJson.headline || undefined,
        });

        // Map Monthly Earnings
        setMonthlyEarnings(earningsJson.earnings || []);
      } catch (e: unknown) {
        if (!mounted) return;
        setError(
          e instanceof Error ? e.message : "Failed to load freelancer data",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    projects,
    recommendedJobs,
    transactions,
    analytics,
    monthlyEarnings,
    loading,
    error,
  };
}
