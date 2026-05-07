// @AI-HINT: AI services — pricing estimation, fraud detection, writing assistance
import { apiFetch } from './core';
import type { ResourceId } from './core';

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
    }>('/ai/estimate-price', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  estimateFreelancerRate: (freelancerId: ResourceId, data?: {
    years_experience?: number;
    skills?: string[];
    completed_projects?: number;
    average_rating?: number;
  }) => {
    const params = new URLSearchParams();
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
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
    apiFetch<{ content: string }>('/ai-writing/generate/proposal', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateProjectDescription: (data: {
    project_type: string;
    key_features: string[];
    target_audience?: string;
    budget_range?: string;
    tone?: string;
  }) =>
    apiFetch<{ content: string }>('/ai-writing/generate/project-description', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  improveText: (data: {
    content: string;
    content_type: string;
    improvements?: string[];
  }) =>
    apiFetch<{ content: string }>('/ai-writing/improve', {
      method: 'POST',
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
    }>('/ai-writing/analyze/feasibility', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  generateUpsellSuggestions: (data: {
    project_description: string;
    proposal_content: string;
  }) =>
    apiFetch<{ suggestions: { title: string; description: string; type: string }[] }>('/ai-writing/generate/upsell', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const aiMatchingApi = {
  getRecommendedProjects: () =>
    apiFetch<{ projects: Array<{ project_id: number; match_score: number; reasons: string[] }> }>('/ai-matching/projects'),

  getMatchScore: (projectId: ResourceId, freelancerId: ResourceId) =>
    apiFetch<{ score: number; breakdown: Record<string, number> }>(`/ai-matching/score/${projectId}/${freelancerId}`),

  trackClick: (projectId: ResourceId) =>
    apiFetch('/ai-matching/track-click', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    }),
};

export const fraudDetectionApi = {
  checkUser: (userId: ResourceId) => apiFetch(`/fraud-detection/analyze/user/${userId}`),
  checkProject: (projectId: ResourceId) => apiFetch(`/fraud-detection/analyze/project/${projectId}`),
  checkProposal: (proposalId: ResourceId) => apiFetch(`/fraud-detection/analyze/proposal/${proposalId}`),
  checkTransaction: (transactionId: ResourceId) =>
    apiFetch(`/fraud-detection/transaction/${transactionId}`),
  reportSuspicious: (data: { type: string; target_id: string; reason: string; details?: string }) =>
    apiFetch('/fraud-detection/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAlerts: () => apiFetch('/admin/fraud-alerts'),
  dismissAlert: (alertId: ResourceId) =>
    apiFetch(`/admin/fraud-alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'false_positive' }),
    }),
};
