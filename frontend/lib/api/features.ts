// @AI-HINT: Referral, career development, availability calendar, rate cards, proposal templates, gamification, time entries API
import { apiFetch } from './core';
import type { ResourceId } from './core';
import type {
  WeeklyPatternSlot, AvailabilityBlockUpdate,
  AvailabilityBookingUpdate, ProposalTemplateMilestone,
} from '@/types/api';

// Backend exposes /referrals/* (see backend/app/api/v1/core_domain/referrals.py).
// This client maps the UI's expected method names + response shapes onto those routes.
export const referralApi = {
  // GET /referrals/me → { referral_code, referral_url, stats, total_earned, recent_referrals }
  getMyCode: async () => {
    const data = await apiFetch<any>('/referrals/me');
    return {
      code: data?.referral_code || '',
      referral_url: data?.referral_url || '',
      uses_count: data?.stats?.total_referrals ?? 0,
      reward_per_referral: 0,
    };
  },
  // GET /referrals/stats → { total_referrals, completed_referrals, pending, total_earned, this_month }
  getStats: async () => {
    const data = await apiFetch<any>('/referrals/stats');
    const total = Number(data?.total_referrals ?? 0);
    const completed = Number(data?.completed_referrals ?? 0);
    return {
      total_referrals: total,
      successful_referrals: completed,
      pending_referrals: Number(data?.pending ?? 0),
      total_earnings: Number(data?.total_earned ?? 0),
      pending_earnings: 0,
      conversion_rate: total > 0 ? (completed / total) * 100 : 0,
      this_month: Number(data?.this_month ?? 0),
    };
  },
  // GET /referrals/history → { items, total, page }
  getMyReferrals: async (status?: string, page = 1, pageSize = 50) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (status && status !== 'all') params.append('status_filter', status);
    const data = await apiFetch<any>(`/referrals/history?${params}`);
    const items = (data?.items || []) as any[];
    return items.map((r) => ({
      id: String(r.id),
      referred_email: r.referred_email,
      status: r.status,
      reward_amount: Number(r.reward_amount || 0),
      reward_paid: r.status === 'completed',
      created_at: r.created_at,
      referred_name: r.referred_name,
    }));
  },
  // GET /referrals/milestones → { milestones, completed_referrals }
  getMilestones: async () => {
    const data = await apiFetch<any>('/referrals/milestones');
    const completed = Number(data?.completed_referrals ?? 0);
    const milestones = ((data?.milestones || []) as any[]).map((m) => ({
      referrals: m.target_count,
      bonus: m.reward_amount,
      achieved: !!m.achieved,
      name: m.name,
    }));
    const next = milestones.find((m) => !m.achieved) || null;
    return {
      milestones,
      current_referrals: completed,
      next_milestone: next ? { referrals: next.referrals, bonus: next.bonus } : null,
    };
  },
  // No dedicated backend share-links route — derive from the referral URL on /referrals/me
  getShareLinks: async () => {
    const data = await apiFetch<any>('/referrals/me');
    const url = data?.referral_url || '';
    const text = encodeURIComponent('Join me on MegiLance — the smarter freelancing platform!');
    const enc = encodeURIComponent(url);
    return {
      direct_link: url,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${enc}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`,
      whatsapp: `https://wa.me/?text=${text}%20${enc}`,
    };
  },
  // POST /referrals/invite { email, message }
  sendInvite: (email: string, message?: string) =>
    apiFetch('/referrals/invite', {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    }),
  // POST /referrals/invite per email (no bulk route on backend → fan out)
  sendBulkInvites: (emails: string[]) =>
    Promise.all(
      emails.map((email) =>
        apiFetch('/referrals/invite', { method: 'POST', body: JSON.stringify({ email }) }).catch(() => null),
      ),
    ),
  // GET /referrals/leaderboard
  getLeaderboard: (period: 'monthly' | 'all_time' = 'monthly', limit = 10) =>
    apiFetch(`/referrals/leaderboard?period=${period}&limit=${limit}`),
  // GET /referrals/campaigns
  getCampaigns: () => apiFetch('/referrals/campaigns'),
};

export const careerApi = {
  getPaths: (category?: string) => {
    const params = category ? `?category=${category}` : '';
    return apiFetch(`/career/paths${params}`);
  },
  getPath: (pathId: ResourceId) => apiFetch(`/career/paths/${pathId}`),
  getMyProgress: () => apiFetch('/career/my-progress'),
  createGoal: (data: { title: string; target_skill: string; target_level: string; deadline?: string }) =>
    apiFetch('/career/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getGoals: (status?: string) => {
    const params = status ? `?status=${status}` : '';
    return apiFetch(`/career/goals${params}`);
  },
  updateGoal: (goalId: ResourceId, data: { progress?: number; status?: string }) =>
    apiFetch(`/career/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGoal: (goalId: ResourceId) => apiFetch(`/career/goals/${goalId}`, { method: 'DELETE' }),
  findMentors: (skill?: string, minExperience = 0) => {
    const params = new URLSearchParams({ min_experience: minExperience.toString() });
    if (skill) params.append('skill', skill);
    return apiFetch(`/career/mentors?${params}`);
  },
  requestMentorship: (mentorId: ResourceId, message: string, goals: string[]) =>
    apiFetch('/career/mentorship/request', {
      method: 'POST',
      body: JSON.stringify({ mentor_id: mentorId, message, goals }),
    }),
  getMentorshipRequests: () => apiFetch('/career/mentorship/requests'),
  respondToMentorship: (requestId: ResourceId, action: 'accept' | 'reject') =>
    apiFetch(`/career/mentorship/requests/${requestId}?action=${action}`, { method: 'PUT' }),
  getRecommendations: () => apiFetch('/career/recommendations'),
  analyzeSkillGaps: (targetRole: string) =>
    apiFetch(`/career/skill-gap-analysis?target_role=${encodeURIComponent(targetRole)}`),
  startAssessment: (skill: string) =>
    apiFetch('/career/skill-assessment', {
      method: 'POST',
      body: JSON.stringify({ skill }),
    }),
  getCertifications: () => apiFetch('/career/certifications'),
};

export const availabilityApi = {
  getSchedule: (startDate: string, endDate: string) =>
    apiFetch(`/availability/schedule?start_date=${startDate}&end_date=${endDate}`),
  getWeeklyPattern: () => apiFetch('/availability/weekly-pattern'),
  updateWeeklyPattern: (pattern: WeeklyPatternSlot[]) =>
    apiFetch('/availability/weekly-pattern', {
      method: 'PUT',
      body: JSON.stringify(pattern),
    }),
  createBlock: (data: {
    start_datetime: string;
    end_datetime: string;
    status: string;
    title?: string;
    is_recurring?: boolean;
  }) =>
    apiFetch('/availability/blocks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBlocks: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return apiFetch(`/availability/blocks?${params}`);
  },
  updateBlock: (blockId: ResourceId, data: AvailabilityBlockUpdate) =>
    apiFetch(`/availability/blocks/${blockId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBlock: (blockId: ResourceId) => apiFetch(`/availability/blocks/${blockId}`, { method: 'DELETE' }),
  getUserAvailableSlots: (userId: ResourceId, date: string, durationMinutes = 60) =>
    apiFetch(`/availability/user/${userId}/available-slots?date=${date}&duration_minutes=${durationMinutes}`),
  createBooking: (data: {
    freelancer_id: string;
    start_datetime: string;
    end_datetime: string;
    title: string;
  }) =>
    apiFetch('/availability/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBookings: (status?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return apiFetch(`/availability/bookings?${params}`);
  },
  updateBooking: (bookingId: ResourceId, data: AvailabilityBookingUpdate) =>
    apiFetch(`/availability/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  cancelBooking: (bookingId: ResourceId) =>
    apiFetch(`/availability/bookings/${bookingId}`, { method: 'DELETE' }),
  getSettings: () => apiFetch('/availability/settings'),
  updateSettings: (settings: Record<string, unknown>) =>
    apiFetch('/availability/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
  getSyncStatus: () => apiFetch('/availability/sync-status'),
  syncCalendar: (provider: 'google' | 'outlook' | 'apple') =>
    apiFetch(`/availability/sync/${provider}`, { method: 'POST' }),
};

export const rateCardsApi = {
  getMyCards: () => apiFetch('/rate-cards/my-cards'),
  create: (data: {
    name: string;
    rate_type: string;
    base_rate: number;
    currency?: string;
    description?: string;
  }) =>
    apiFetch('/rate-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (rateCardId: ResourceId) => apiFetch(`/rate-cards/${rateCardId}`),
  update: (rateCardId: ResourceId, data: Partial<{ name: string; rate_type: string; base_rate: number; currency: string; description: string }>) =>
    apiFetch(`/rate-cards/${rateCardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (rateCardId: ResourceId) => apiFetch(`/rate-cards/${rateCardId}`, { method: 'DELETE' }),
  getPackages: (rateCardId: ResourceId) => apiFetch(`/rate-cards/${rateCardId}/packages`),
  createPackage: (rateCardId: ResourceId, data: {
    name: string;
    description: string;
    price: number;
    deliverables: string[];
    estimated_duration: string;
    revisions?: number;
  }) =>
    apiFetch(`/rate-cards/${rateCardId}/packages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePackage: (packageId: ResourceId, data: Partial<{ name: string; description: string; price: number; deliverables: string[]; estimated_duration: string; revisions: number }>) =>
    apiFetch(`/rate-cards/packages/${packageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePackage: (packageId: ResourceId) =>
    apiFetch(`/rate-cards/packages/${packageId}`, { method: 'DELETE' }),
  getModifiers: (rateCardId: ResourceId) => apiFetch(`/rate-cards/${rateCardId}/modifiers`),
  createModifier: (rateCardId: ResourceId, data: { name: string; type: string; value: number; description?: string }) =>
    apiFetch(`/rate-cards/${rateCardId}/modifiers`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUserRateCards: (userId: ResourceId) => apiFetch(`/rate-cards/user/${userId}`),
  calculate: (data: { rate_card_id: string; hours?: number; package_id?: string; modifiers?: string[] }) =>
    apiFetch('/rate-cards/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const proposalTemplatesApi = {
  getMyTemplates: (tag?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (tag) params.append('tag', tag);
    return apiFetch(`/proposal-templates?${params}`);
  },
  create: (data: {
    name: string;
    cover_letter: string;
    description?: string;
    milestones_template?: ProposalTemplateMilestone[];
    default_rate?: number;
    tags?: string[];
  }) =>
    apiFetch('/proposal-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  get: (templateId: ResourceId) => apiFetch(`/proposal-templates/${templateId}`),
  update: (templateId: ResourceId, data: Partial<{ name: string; cover_letter: string; description: string; milestones_template: ProposalTemplateMilestone[]; default_rate: number; tags: string[] }>) =>
    apiFetch(`/proposal-templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (templateId: ResourceId) => apiFetch(`/proposal-templates/${templateId}`, { method: 'DELETE' }),
  duplicate: (templateId: ResourceId, newName?: string) =>
    apiFetch(`/proposal-templates/${templateId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ new_name: newName }),
    }),
  browsePublic: (category?: string, search?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    return apiFetch(`/proposal-templates/public/browse?${params}`);
  },
  usePublicTemplate: (templateId: ResourceId) =>
    apiFetch(`/proposal-templates/public/${templateId}/use`, { method: 'POST' }),
  getVariables: () => apiFetch('/proposal-templates/variables'),
  preview: (templateId: ResourceId, variables: Record<string, string>) =>
    apiFetch(`/proposal-templates/${templateId}/preview`, {
      method: 'POST',
      body: JSON.stringify(variables),
    }),
  getAnalytics: () => apiFetch('/proposal-templates/analytics'),
  generate: (templateId: ResourceId, projectId: ResourceId, variables?: Record<string, string>) =>
    apiFetch(`/proposal-templates/${templateId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, variables }),
    }),
};

export const gamificationApi = {
  getMyRank: () => apiFetch('/gamification/my-rank'),
  getBadges: () => apiFetch('/gamification/badges'),
  getLeaderboard: (limit = 10) => apiFetch(`/gamification/leaderboard?limit=${limit}`),
  getAchievements: () => apiFetch('/gamification/achievements'),
};

export const timeEntriesApi = {
  list: (contractId?: number, page = 1, pageSize = 50) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (contractId) params.append('contract_id', contractId.toString());
    return apiFetch(`/time-entries?${params}`);
  },

  create: (data: {
    contract_id: number;
    description: string;
    hours: number;
    date: string;
  }) =>
    apiFetch('/time-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: ResourceId, data: {
    description?: string;
    hours?: number;
    date?: string;
  }) =>
    apiFetch(`/time-entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: ResourceId) =>
    apiFetch(`/time-entries/${id}`, { method: 'DELETE' }),

  getSummary: (contractId: number) =>
    apiFetch(`/time-entries/summary?contract_id=${contractId}`),

  start: (contractId: number, description: string, billable = true, hourlyRate?: number) =>
    apiFetch('/time-entries/start', {
      method: 'POST',
      body: JSON.stringify({ contract_id: contractId, description, billable, hourly_rate: hourlyRate }),
    }),

  stop: (id: ResourceId) =>
    apiFetch(`/time-entries/${id}/stop`, { method: 'POST' }),

  approve: (id: ResourceId) =>
    apiFetch(`/time-entries/${id}/approve`, { method: 'POST' }),

  reject: (id: ResourceId, reason: string) =>
    apiFetch(`/time-entries/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
