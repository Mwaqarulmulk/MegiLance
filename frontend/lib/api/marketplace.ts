// @AI-HINT: Client direct, support tickets, matching, disputes, reviews API
import { apiFetch } from './core';
import type { ResourceId } from './core';
import type { DisputeUpdateData } from '@/types/api';

export const clientApi = {
  getProjects: () => apiFetch<{ items: Record<string, unknown>[]; total: number; page: number; page_size: number }>('/portal/client/projects'),
  getPayments: () => apiFetch<Record<string, unknown>[]>('/portal/client/payments'),
  getFreelancers: async () => {
    try {
      const response = await apiFetch<{ recommendations: Record<string, unknown>[] }>('/matching/recommendations?limit=5');
      if (!response?.recommendations) {
        return [];
      }
      return response.recommendations.map((r: Record<string, unknown>) => ({
        id: (r.freelancer_id as number).toString(),
        name: r.freelancer_name as string,
        title: r.freelancer_bio ? (r.freelancer_bio as string).substring(0, 30) + '...' : 'Freelancer',
        rating: (r.match_factors as Record<string, number>)?.avg_rating ? (r.match_factors as Record<string, number>).avg_rating * 5 : 5.0,
        hourlyRate: r.hourly_rate ? `$${r.hourly_rate}` : '$0',
        skills: [],
        completedProjects: 0,
        avatarUrl: r.profile_image_url as string | undefined,
        location: r.location as string | undefined,
        matchScore: r.match_score as number
      }));
    } catch (error) {
      console.error('Failed to fetch freelancer recommendations:', error);
      return [];
    }
  },
  getReviews: async () => {
    try {
      const response = await apiFetch<{ reviews: Record<string, unknown>[] }>('/reviews?page_size=10');
      const reviews = response.reviews || response;
      return Array.isArray(reviews) ? reviews.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        projectTitle: r.project_title || 'Project',
        freelancerName: r.reviewee_name || 'Freelancer',
        rating: r.rating || 5,
        comment: r.comment || '',
        date: r.created_at || new Date().toISOString()
      })) : [];
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return [];
    }
  },
  createJob: (data: { title: string; description: string; category: string; budget_type: string; budget_min?: number; budget_max?: number }) => apiFetch('/portal/client/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const supportTicketsApi = {
  create: (data: { subject: string; description?: string; message?: string; category?: string; priority?: string } | FormData) =>
    apiFetch('/support-tickets', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  list: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiFetch(`/support-tickets${params}`);
  },
  get: (ticketId: ResourceId) => apiFetch(`/support-tickets/${ticketId}`),
  reply: (ticketId: ResourceId, message: string) =>
    apiFetch(`/support-tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  addMessage: (ticketId: ResourceId, data: { message: string }) =>
    apiFetch(`/support-tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  close: (ticketId: ResourceId) =>
    apiFetch(`/support-tickets/${ticketId}/close`, { method: 'POST' }),
};

export const matchingApi = {
  findFreelancers: (projectId: ResourceId, limit = 20) =>
    apiFetch(`/matching/project/${projectId}/freelancers?limit=${limit}`),
  findJobs: (limit = 20) => apiFetch(`/matching/projects?limit=${limit}`),
  getMatchScore: (projectId: ResourceId, freelancerId: ResourceId) =>
    apiFetch(`/matching/score?project_id=${projectId}&freelancer_id=${freelancerId}`),
  getRecommendations: () => apiFetch('/matching/recommendations'),
  updatePreferences: (preferences: Record<string, unknown>) =>
    apiFetch('/matching/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    }),
};

export const disputesApi = {
  create: (data: {
    contract_id: number;
    dispute_type?: string;
    reason?: string;
    description: string;
  }) =>
    apiFetch('/disputes', {
      method: 'POST',
      body: JSON.stringify({
        contract_id: data.contract_id,
        dispute_type: data.dispute_type || data.reason || 'other',
        description: data.description,
      }),
    }),
  list: (filters?: { status?: string; dispute_type?: string; page?: number; page_size?: number; contract_id?: number; raised_by_me?: boolean }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/disputes?${params}`);
  },
  get: (disputeId: ResourceId) =>
    apiFetch(`/disputes/${disputeId}`),
  update: (disputeId: ResourceId, data: DisputeUpdateData) =>
    apiFetch(`/disputes/${disputeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  assign: (disputeId: ResourceId, adminId: ResourceId) =>
    apiFetch(`/disputes/${disputeId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ admin_id: adminId }),
    }),
  resolve: (disputeId: ResourceId, resolution: string, contractStatus?: string) => {
    return apiFetch(`/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({
        resolution,
        ...(contractStatus && { contract_status: contractStatus }),
      }),
    });
  },
  uploadEvidence: (disputeId: ResourceId, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch(`/disputes/${disputeId}/evidence`, {
      method: 'POST',
      body: formData,
    });
  },
};

export const reviewsApi = {
  create: (data: {
    contract_id: number;
    rating: number;
    comment?: string;
    communication_rating?: number;
    quality_rating?: number;
    deadline_rating?: number;
    reviewed_user_id?: number;
    review_text?: string;
    is_public?: boolean;
    professionalism_rating?: number;
    would_recommend?: boolean;
  }) =>
    apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  list: (filters?: { page?: number; page_size?: number; reviewer_id?: number; reviewed_user_id?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/reviews?${params}`);
  },
  getForUser: (userId: ResourceId) => apiFetch(`/reviews/user/${userId}`),
  getForContract: (contractId: ResourceId) => apiFetch(`/reviews/contract/${contractId}`),
  update: (reviewId: ResourceId, data: {
    rating?: number;
    comment?: string;
    communication_rating?: number;
    quality_rating?: number;
    deadline_rating?: number;
    professionalism_rating?: number;
    would_recommend?: boolean;
  }) =>
    apiFetch(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (reviewId: ResourceId) => apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' }),
};

export const reviewResponsesApi = {
  getResponse: (reviewId: ResourceId) => apiFetch(`/review-responses/${reviewId}`),
  createResponse: (reviewId: ResourceId, response: string) =>
    apiFetch(`/review-responses/${reviewId}`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    }),
  updateResponse: (reviewId: ResourceId, response: string) =>
    apiFetch(`/review-responses/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ response }),
    }),
  deleteResponse: (reviewId: ResourceId) =>
    apiFetch(`/review-responses/${reviewId}`, { method: 'DELETE' }),
};
