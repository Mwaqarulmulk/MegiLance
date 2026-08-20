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

export interface ReviewItem {
  id: number;
  contract_id: number;
  reviewer_id: number;
  reviewed_user_id: number;
  rating: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  deadline_rating?: number;
  review_text: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  reviewer_name?: string;
  project_name?: string;
  response_text?: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<string, number>;
  recommend_percentage?: number;
  avg_communication?: number;
  avg_quality?: number;
  avg_professionalism?: number;
  avg_deadline?: number;
}

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
  list: (filters?: { page?: number; page_size?: number; limit?: number; reviewer_id?: number; reviewed_user_id?: number; user_id?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch<{ items: Record<string, unknown>[]; total: number; page: number }>(`/reviews?${params}`);
  },
  getForUser: (userId: ResourceId) => apiFetch(`/reviews/user/${userId}`),
  getForContract: (contractId: ResourceId) => apiFetch(`/reviews/contract/${contractId}`),
  getMyReviews: async (): Promise<ReviewItem[]> => {
    try {
      const user = await apiFetch<{ id: number }>('/auth/me');
      if (user?.id) {
        const res = await apiFetch<{ items: Record<string, unknown>[]; total: number }>(`/reviews?user_id=${user.id}`);
        const items = (res && Array.isArray(res.items)) ? res.items : (Array.isArray(res) ? res : []);
        return items.map((r: Record<string, unknown>) => ({
          id: Number(r.id),
          contract_id: Number(r.contract_id || 0),
          reviewer_id: Number(r.reviewer_id || 0),
          reviewed_user_id: Number(r.reviewee_id || r.reviewed_user_id || 0),
          rating: Number(r.rating || 5),
          communication_rating: r.communication_rating !== undefined && r.communication_rating !== null ? Number(r.communication_rating) : undefined,
          quality_rating: r.quality_rating !== undefined && r.quality_rating !== null ? Number(r.quality_rating) : undefined,
          professionalism_rating: r.professionalism_rating !== undefined && r.professionalism_rating !== null ? Number(r.professionalism_rating) : undefined,
          deadline_rating: r.deadline_rating !== undefined && r.deadline_rating !== null ? Number(r.deadline_rating) : undefined,
          review_text: (r.comment as string) || (r.review_text as string) || '',
          is_public: r.is_public !== false,
          created_at: (r.created_at as string) || new Date().toISOString(),
          updated_at: (r.updated_at as string) || new Date().toISOString(),
          reviewer_name: (r.reviewer_name as string) || undefined,
          project_name: (r.project_title as string) || (r.project_name as string) || undefined,
          response_text: (r.response as string) || (r.response_text as string) || undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      return [];
    }
  },
  getReviewStats: async (): Promise<ReviewStats | null> => {
    try {
      const reviews = await reviewsApi.getMyReviews();
      if (!reviews.length) {
        return {
          average_rating: 0,
          total_reviews: 0,
          rating_breakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
          recommend_percentage: 0,
        };
      }
      const total = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const breakdown: Record<string, number> = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
      let recommendCount = 0;
      reviews.forEach(r => {
        const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
        breakdown[String(rounded)] = (breakdown[String(rounded)] || 0) + 1;
        if (r.rating >= 4) recommendCount++;
      });
      return {
        average_rating: sum / total,
        total_reviews: total,
        rating_breakdown: breakdown,
        recommend_percentage: Math.round((recommendCount / total) * 100),
        avg_communication: reviews.reduce((a, r) => a + (r.communication_rating || r.rating), 0) / total,
        avg_quality: reviews.reduce((a, r) => a + (r.quality_rating || r.rating), 0) / total,
        avg_professionalism: reviews.reduce((a, r) => a + (r.professionalism_rating || r.rating), 0) / total,
        avg_deadline: reviews.reduce((a, r) => a + (r.deadline_rating || r.rating), 0) / total,
      };
    } catch {
      return null;
    }
  },
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

export const talentInvitationsApi = {
  create: (data: { project_id: number; freelancer_id: number; message?: string; suggested_rate?: number }) =>
    apiFetch('/talent-invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listMine: (params?: { role?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set('role', params.role);
    if (params?.status) q.set('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiFetch(`/talent-invitations/my-invitations${queryStr}`);
  },
  listForProject: (projectId: number | string) =>
    apiFetch(`/talent-invitations/project/${projectId}`),
  respond: (invitationId: number | string, data: { action: 'accept' | 'decline'; message?: string }) =>
    apiFetch(`/talent-invitations/${invitationId}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  cancel: (invitationId: number | string) =>
    apiFetch(`/talent-invitations/${invitationId}/cancel`, {
      method: 'POST',
    }),
};

