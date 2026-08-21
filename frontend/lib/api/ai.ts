// @AI-HINT: AI services — Client Assistant, pricing estimation, fraud detection, writing assistance, matching
import { apiFetch } from "./core";
import type { ResourceId } from "./core";

// ─── Client Assistant ─────────────────────────────────────────────────────────

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  tool_results?: unknown[];
}

export interface ClientAssistantResponse {
  reply: string;
  tool_results: Array<{
    tool_name: string;
    data: Record<string, unknown>;
    display_type:
      | "freelancer_cards"
      | "cost_estimate"
      | "market_rates"
      | "scope_plan"
      | "text";
  }>;
  suggestions: string[];
  action_buttons: Array<{ label: string; href: string; variant: string }>;
  intent?: string;
}

export const clientAssistantApi = {
  chat: (
    message: string,
    conversationHistory: ConversationMessage[] = [],
    pageContext?: string,
  ): Promise<ClientAssistantResponse> =>
    apiFetch("/ai/client-assistant/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        conversation_history: conversationHistory,
        page_context: pageContext,
      }),
    }) as Promise<ClientAssistantResponse>,

  getWelcomeMessage: (): Promise<{
    greeting: string;
    message: string;
    suggestions: string[];
    action_buttons: Array<{ label: string; href: string; variant: string }>;
  }> =>
    apiFetch("/ai/client-assistant/welcome", { method: "GET" }) as Promise<{
      greeting: string;
      message: string;
      suggestions: string[];
      action_buttons: Array<{ label: string; href: string; variant: string }>;
    }>,
};

export const aiApi = {
  checkFraud: (userId: ResourceId) =>
    apiFetch<{
      user_id: number;
      risk_score: number;
      risk_level: string;
      risk_factors: string[];
      recommendation: string;
    }>(`/fraud-detection/analyze/user/${userId}`),

  estimatePrice: (data: {
    category: string;
    skills_required: string[];
    description?: string;
    estimated_hours?: number;
    complexity?: string;
  }) =>
    apiFetch<{
      estimated_hourly_rate: number;
      estimated_total: number;
      estimated_hours: number;
      low_estimate: number;
      high_estimate: number;
      complexity: string;
      category: string;
      confidence: number;
      factors: string[];
    }>("/ai/estimate-price", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Market rate estimate from real freelancer data on the platform. Returns a
  // confidence (0–1) and sample_size so the UI can show how grounded it is.
  estimateRate: (data: {
    skills: string[];
    experience_level?: string;
    location?: string;
  }) =>
    apiFetch<{
      estimated_rate: number;
      range: { min: number; max: number };
      confidence: number;
      factors: { sample_size?: number; market_avg?: number };
      message: string;
    }>("/ai/estimate-rate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Budget suggestion for a project, grounded in similar real projects on the
  // platform. Returns a confidence (0–1) reflecting how much data backed it.
  estimateProjectBudget: (data: {
    title: string;
    description: string;
    category?: string;
  }) => {
    const params = new URLSearchParams();
    params.append("title", data.title);
    params.append("description", data.description);
    if (data.category) params.append("category", data.category);
    return apiFetch<{
      estimated_budget: number;
      budget_range: { min: number; max: number };
      estimated_duration_days: number;
      confidence: number;
      factors: { word_count?: number; category?: string; similar_projects?: number };
      message: string;
    }>(`/ai/project/estimate?${params}`);
  },

  estimateFreelancerRate: (
    freelancerId: ResourceId,
    data?: {
      years_experience?: number;
      skills?: string[];
      completed_projects?: number;
      average_rating?: number;
    },
  ) => {
    const params = new URLSearchParams();
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    return apiFetch<{
      freelancer_id: number;
      current_rate: number | null;
      estimated_rate: number;
      low_estimate: number;
      high_estimate: number;
      factors: Record<string, number | string>;
      confidence: number;
    }>(`/ai/estimate-freelancer-rate/${freelancerId}?${params}`);
  },
};

export const aiWritingApi = {
  generateProposal: (data: {
    project_title: string;
    project_description: string;
    user_skills: string[];
    user_experience?: string;
    tone?: string;
    highlight_points?: string[];
  }) =>
    apiFetch<{ content: string }>("/ai-writing/generate/proposal", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  generateProjectDescription: (data: {
    project_type: string;
    key_features: string[];
    target_audience?: string;
    budget_range?: string;
    tone?: string;
  }) =>
    apiFetch<{ content: string }>("/ai-writing/generate/project-description", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  improveText: (data: {
    content: string;
    content_type: string;
    improvements?: string[];
  }) =>
    apiFetch<{ content: string }>("/ai-writing/improve", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  analyzeFeasibility: (data: {
    project_description: string;
    budget_min: number;
    budget_max: number;
    timeline_days: number;
  }) =>
    apiFetch<{
      complexity_score: number;
      budget_realism: string;
      timeline_realism: string;
      flags: string[];
      recommendations: string[];
    }>("/ai-writing/analyze/feasibility", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  generateUpsellSuggestions: (data: {
    project_description: string;
    proposal_content: string;
  }) =>
    apiFetch<{
      suggestions: { title: string; description: string; type: string }[];
    }>("/ai-writing/generate/upsell", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const aiMatchingApi = {
  getRecommendedProjects: () =>
    apiFetch<{
      projects: Array<{
        project_id: number;
        match_score: number;
        reasons: string[];
      }>;
    }>("/matching/projects"),

  getMatchScore: (projectId: ResourceId, freelancerId: ResourceId) =>
    apiFetch<{ score: number; breakdown: Record<string, number> }>(
      `/matching/score?project_id=${projectId}&freelancer_id=${freelancerId}`,
    ),

  trackClick: (projectId: ResourceId) =>
    apiFetch("/matching/track-click", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    }),

  instantMatch: (data: {
    prompt: string;
    category?: string;
    budget_hint?: number;
    skills?: string[];
    experience_level?: string;
    duration?: string;
  }) =>
    apiFetch<{
      extracted_brief: {
        title: string;
        description: string;
        category: string;
        skills: string[];
        budget_min: number;
        budget_max: number;
        budget_type: string;
        estimated_days: number;
        experience_level: string;
        duration: string;
      };
      matches: Array<{
        freelancer_id: string | number;
        name: string;
        title?: string;
        avatar_url?: string;
        hourly_rate: number;
        match_score: number;
        match_quality: string;
        why_good_fit: string;
        top_skills: string[];
        trust_signals: {
          is_id_verified: boolean;
          identity_verified: boolean;
          payment_verified: boolean;
          jss_score: number;
          seller_level: string;
          verified_badge: string;
          verified_skill_badges: string[];
          escrow_protected: boolean;
          client_fee_rate: number;
          review_count: number;
          average_rating: number;
        };
      }>;
      total_matched: number;
    }>("/ai/instant-match", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const fraudDetectionApi = {
  checkUser: (userId: ResourceId) =>
    apiFetch(`/fraud-detection/analyze/user/${userId}`),
  checkProject: (projectId: ResourceId) =>
    apiFetch(`/fraud-detection/analyze/project/${projectId}`),
  checkProposal: (proposalId: ResourceId) =>
    apiFetch(`/fraud-detection/analyze/proposal/${proposalId}`),
  checkTransaction: (transactionId: ResourceId) =>
    apiFetch(`/fraud-detection/transaction/${transactionId}`),
  reportSuspicious: (data: {
    type: string;
    target_id: string;
    reason: string;
    details?: string;
  }) =>
    apiFetch("/fraud-detection/report", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAlerts: () => apiFetch("/admin/fraud-alerts"),
  dismissAlert: (alertId: ResourceId) =>
    apiFetch(`/admin/fraud-alerts/${alertId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "false_positive" }),
    }),
};
