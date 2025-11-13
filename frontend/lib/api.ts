// @AI-HINT: Comprehensive API client for MegiLance backend integration
// Provides type-safe methods for all backend endpoints with proper error handling

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }
}

export function getAuthToken(): string | null {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

// Generic fetch wrapper with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===========================
// AUTHENTICATION
// ===========================
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await apiFetch<{ access_token: string; refresh_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(data.access_token);
    return data;
  },

  register: async (userData: { email: string; password: string; name: string; role: string }) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    setAuthToken(null);
  },

  refreshToken: async (refreshToken: string) => {
    const data = await apiFetch<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    setAuthToken(data.access_token);
    return data;
  },
};

// ===========================
// TIME TRACKING
// ===========================
export const timeEntriesApi = {
  start: (contractId: number, description: string, billable = true, hourlyRate?: number) =>
    apiFetch('/time-entries/', {
      method: 'POST',
      body: JSON.stringify({ contract_id: contractId, description, billable, hourly_rate: hourlyRate }),
    }),

  stop: (entryId: number) =>
    apiFetch(`/time-entries/${entryId}/stop`, { method: 'POST' }),

  list: (contractId?: number, page = 1, pageSize = 20) =>
    apiFetch(`/time-entries/?${new URLSearchParams({ 
      ...(contractId && { contract_id: contractId.toString() }), 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })}`),

  get: (entryId: number) =>
    apiFetch(`/time-entries/${entryId}`),

  update: (entryId: number, data: { description?: string; billable?: boolean }) =>
    apiFetch(`/time-entries/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (entryId: number) =>
    apiFetch(`/time-entries/${entryId}`, { method: 'DELETE' }),

  getSummary: (contractId: number) =>
    apiFetch(`/time-entries/summary?contract_id=${contractId}`),

  approve: (entryId: number) =>
    apiFetch(`/time-entries/${entryId}/approve`, { method: 'POST' }),

  reject: (entryId: number, reason: string) =>
    apiFetch(`/time-entries/${entryId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ===========================
// INVOICES
// ===========================
export const invoicesApi = {
  create: (data: {
    contract_id: number;
    to_user_id: number;
    due_date: string;
    items: Array<{ description: string; amount: number }>;
    notes?: string;
    tax_rate?: number;
  }) =>
    apiFetch('/invoices/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (filters?: { status?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/invoices/?${params}`);
  },

  get: (invoiceId: number) =>
    apiFetch(`/invoices/${invoiceId}`),

  update: (invoiceId: number, data: { due_date?: string; notes?: string; status?: string }) =>
    apiFetch(`/invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (invoiceId: number) =>
    apiFetch(`/invoices/${invoiceId}`, { method: 'DELETE' }),

  markAsPaid: (invoiceId: number, paymentId: number) =>
    apiFetch(`/invoices/${invoiceId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId }),
    }),

  send: (invoiceId: number) =>
    apiFetch(`/invoices/${invoiceId}/send`, { method: 'POST' }),
};

// ===========================
// ESCROW
// ===========================
export const escrowApi = {
  list: (page = 1, pageSize = 20) =>
    apiFetch(`/escrow/?page=${page}&page_size=${pageSize}`),

  get: (escrowId: number) =>
    apiFetch(`/escrow/${escrowId}`),

  fund: (data: { contract_id: number; amount: number; description?: string }) =>
    apiFetch('/escrow/fund', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  release: (escrowId: number, data: { amount: number; notes?: string }) =>
    apiFetch(`/escrow/${escrowId}/release`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refund: (escrowId: number, data: { amount?: number; reason: string }) =>
    apiFetch(`/escrow/${escrowId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBalance: () =>
    apiFetch('/escrow/balance'),
};

// ===========================
// CATEGORIES
// ===========================
export const categoriesApi = {
  list: () => apiFetch('/categories/'),
  
  getTree: () => apiFetch('/categories/tree'),
  
  getBySlug: (slug: string) => apiFetch(`/categories/${slug}`),
};

// ===========================
// TAGS
// ===========================
export const tagsApi = {
  list: (filters?: { type?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/tags/?${params}`);
  },

  create: (data: { name: string; type: 'skill' | 'priority' | 'location' | 'budget' | 'general' }) =>
    apiFetch('/tags/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (tagId: number) => apiFetch(`/tags/${tagId}`),

  update: (tagId: number, data: { name?: string; type?: string }) =>
    apiFetch(`/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (tagId: number) =>
    apiFetch(`/tags/${tagId}`, { method: 'DELETE' }),

  getPopular: () =>
    apiFetch('/tags/popular'),

  getProjectTags: (projectId: number) =>
    apiFetch(`/tags/projects/${projectId}/tags`),

  addToProject: (projectId: number, tagId: number) =>
    apiFetch(`/tags/projects/${projectId}/tags/${tagId}`, { method: 'POST' }),

  removeFromProject: (projectId: number, tagId: number) =>
    apiFetch(`/tags/projects/${projectId}/tags/${tagId}`, { method: 'DELETE' }),
};

// ===========================
// FAVORITES
// ===========================
export const favoritesApi = {
  list: (targetType?: 'project' | 'freelancer' | 'client', page = 1, pageSize = 20) =>
    apiFetch(`/favorites/?${new URLSearchParams({ 
      ...(targetType && { target_type: targetType }), 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })}`),

  create: (targetType: 'project' | 'freelancer' | 'client', targetId: number) =>
    apiFetch('/favorites/', {
      method: 'POST',
      body: JSON.stringify({ target_type: targetType, target_id: targetId }),
    }),

  delete: (favoriteId: number) =>
    apiFetch(`/favorites/${favoriteId}`, { method: 'DELETE' }),

  check: (targetType: string, targetId: number) =>
    apiFetch(`/favorites/check/${targetType}/${targetId}`),
};

// ===========================
// SUPPORT TICKETS
// ===========================
export const supportTicketsApi = {
  list: (filters?: { status?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/support-tickets/?${params}`);
  },

  create: (data: {
    subject: string;
    description: string;
    category: 'technical' | 'billing' | 'account' | 'project' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) =>
    apiFetch('/support-tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (ticketId: number) =>
    apiFetch(`/support-tickets/${ticketId}`),

  update: (ticketId: number, status: 'open' | 'in_progress' | 'resolved' | 'closed') =>
    apiFetch(`/support-tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  addMessage: (ticketId: number, data: { message: string }) =>
    apiFetch(`/support-tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ===========================
// REFUNDS
// ===========================
export const refundsApi = {
  list: (filter?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
    if (filter) params.append('status', filter);
    return apiFetch(`/refunds/?${params}`);
  },

  request: (data: { payment_id: number; amount: number; reason: string }) =>
    apiFetch('/refunds/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (refundId: number) =>
    apiFetch(`/refunds/${refundId}`),

  approve: (refundId: number, data?: { admin_notes?: string }) =>
    apiFetch(`/refunds/${refundId}/approve`, { 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  reject: (refundId: number, reason: string) =>
    apiFetch(`/refunds/${refundId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};

// ===========================
// SEARCH
// ===========================
export const searchApi = {
  projects: (query: string, filters?: {
    budget_min?: number;
    budget_max?: number;
    category?: string;
    skills?: string[];
    page?: number;
    page_size?: number;
  }) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    return apiFetch(`/search/projects?${params}`);
  },

  freelancers: (query: string, filters?: {
    skills?: string[];
    hourly_rate_min?: number;
    hourly_rate_max?: number;
    page?: number;
    page_size?: number;
  }) => {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    return apiFetch(`/search/freelancers?${params}`);
  },

  global: (query: string) =>
    apiFetch(`/search/?q=${encodeURIComponent(query)}`),

  autocomplete: (query: string) =>
    apiFetch(`/search/autocomplete?q=${encodeURIComponent(query)}`),

  getTrending: (type: 'projects' | 'freelancers' = 'projects', limit = 10) =>
    apiFetch(`/search/trending?type=${type}&limit=${limit}`),
};

// ===========================
// PROJECTS
// ===========================
export const projectsApi = {
  list: (filters?: { status?: string; category?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/projects/?${params}`);
  },

  create: (data: any) =>
    apiFetch('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (projectId: number) =>
    apiFetch(`/projects/${projectId}`),

  update: (projectId: number, data: any) =>
    apiFetch(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (projectId: number) =>
    apiFetch(`/projects/${projectId}`, { method: 'DELETE' }),
};

// ===========================
// CONTRACTS
// ===========================
export const contractsApi = {
  list: (filters?: { status?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return apiFetch(`/contracts/?${params}`);
  },

  create: (data: { project_id: number; freelancer_id: number; terms: string; budget: number }) =>
    apiFetch('/contracts/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (contractId: number) =>
    apiFetch(`/contracts/${contractId}`),

  update: (contractId: number, data: any) =>
    apiFetch(`/contracts/${contractId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  accept: (contractId: number) =>
    apiFetch(`/contracts/${contractId}/accept`, { method: 'POST' }),

  complete: (contractId: number) =>
    apiFetch(`/contracts/${contractId}/complete`, { method: 'POST' }),
};

// ===========================
// PROPOSALS
// ===========================
export const proposalsApi = {
  list: (projectId?: number, page = 1, pageSize = 20) =>
    apiFetch(`/proposals/?${new URLSearchParams({ 
      ...(projectId && { project_id: projectId.toString() }), 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })}`),

  create: (data: {
    project_id: number;
    cover_letter: string;
    proposed_rate: number;
    estimated_duration: string;
  }) =>
    apiFetch('/proposals/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (proposalId: number) =>
    apiFetch(`/proposals/${proposalId}`),

  update: (proposalId: number, data: any) =>
    apiFetch(`/proposals/${proposalId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  accept: (proposalId: number) =>
    apiFetch(`/proposals/${proposalId}/accept`, { method: 'POST' }),

  reject: (proposalId: number) =>
    apiFetch(`/proposals/${proposalId}/reject`, { method: 'POST' }),
};

// ===========================
// REVIEWS
// ===========================
export const reviewsApi = {
  list: (targetId?: number, targetType?: 'freelancer' | 'client', page = 1, pageSize = 20) =>
    apiFetch(`/reviews/?${new URLSearchParams({ 
      ...(targetId && { target_id: targetId.toString() }),
      ...(targetType && { target_type: targetType }), 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })}`),

  create: (data: {
    target_id: number;
    target_type: 'freelancer' | 'client';
    contract_id: number;
    rating: number;
    comment: string;
  }) =>
    apiFetch('/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  get: (reviewId: number) =>
    apiFetch(`/reviews/${reviewId}`),
};

export default {
  auth: authApi,
  timeEntries: timeEntriesApi,
  invoices: invoicesApi,
  escrow: escrowApi,
  categories: categoriesApi,
  tags: tagsApi,
  favorites: favoritesApi,
  supportTickets: supportTicketsApi,
  refunds: refundsApi,
  search: searchApi,
  projects: projectsApi,
  contracts: contractsApi,
  proposals: proposalsApi,
  reviews: reviewsApi,
};
