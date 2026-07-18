// @AI-HINT: Gigs marketplace API client module (Fiverr-style CRUD, order processing, deliveries, reviews)
import { apiFetch } from './core';
import type { ResourceId } from './core';
import type { Gig, GigOrder, GigList } from '@/types/api';

export const gigsApi = {
  list: (filters?: {
    page?: number;
    page_size?: number;
    category_id?: number;
    subcategory?: string;
    min_price?: number;
    max_price?: number;
    seller_level?: string;
    min_rating?: number;
    sort_by?: string;
    query?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, value.toString());
        }
      });
    }
    return apiFetch<GigList>(`/gigs?${params}`);
  },

  getBySlug: (slug: string) => apiFetch<Gig>(`/gigs/slug/${slug}`),

  getById: (id: ResourceId) => apiFetch<Gig>(`/gigs/${id}`),

  create: (data: Partial<Gig>) =>
    apiFetch<{ id: number; slug: string; status: string }>('/gigs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: ResourceId, data: Partial<Gig>) =>
    apiFetch<{ id: number; status: string }>(`/gigs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  publish: (id: ResourceId) =>
    apiFetch<{ status: string }>(`/gigs/${id}/publish`, {
      method: 'POST',
    }),

  pause: (id: ResourceId) =>
    apiFetch<{ status: string }>(`/gigs/${id}/pause`, {
      method: 'POST',
    }),

  delete: (id: ResourceId) =>
    apiFetch<void>(`/gigs/${id}`, {
      method: 'DELETE',
    }),

  getMyGigs: () => apiFetch<{ items: Gig[] }>('/gigs/seller/my-gigs'),

  // Order processing
  createOrder: (data: { gig_id: number; package: 'basic' | 'standard' | 'premium' }) =>
    apiFetch<{ id: number; status: string; price: number }>('/gigs/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyOrders: () => apiFetch<{ items: GigOrder[] }>('/gigs/orders'),

  deliverOrder: (orderId: ResourceId, data: { message: string; files?: string[] }) =>
    apiFetch<{ status: string }>(`/gigs/orders/${orderId}/deliver`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  acceptOrder: (orderId: ResourceId) =>
    apiFetch<{ status: string }>(`/gigs/orders/${orderId}/accept`, {
      method: 'POST',
    }),

  requestRevision: (orderId: ResourceId, data: { message: string }) =>
    apiFetch<{ status: string }>(`/gigs/orders/${orderId}/revision`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reviews
  createReview: (data: {
    gig_id: number;
    order_id: number;
    seller_id: number;
    communication_rating: number;
    service_rating: number;
    delivery_rating: number;
    recommendation_rating: number;
    review_text: string;
  }) =>
    apiFetch<{ id: number }>('/gigs/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getReviews: (gigId: ResourceId, page = 1, pageSize = 10) =>
    apiFetch<{ items: any[] }>(`/gigs/${gigId}/reviews?page=${page}&page_size=${pageSize}`),
};
