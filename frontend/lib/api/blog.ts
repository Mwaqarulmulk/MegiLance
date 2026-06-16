import { BlogPostCardProps } from '@/app/components/Public/BlogPostCard/BlogPostCard';
import { apiFetch } from './core';

// Always use /api/v1 for backend API calls.
// NEXT_PUBLIC_API_URL may be "https://api.megilance.site/api" (without v1),
// so we normalise to always include /api/v1.
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.includes('/api/v1')
  ? rawApiUrl.replace(/\/+$/, '')
  : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`;

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_published: boolean;
  is_news_trend: boolean;
  views: number;
  reading_time: number;
}

export interface CreateBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author: string;
  tags: string[];
  is_published: boolean;
  is_news_trend: boolean;
}

export interface UpdateBlogPost {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  image_url?: string;
  author?: string;
  tags?: string[];
  is_published?: boolean;
  is_news_trend?: boolean;
}

/**
 * Unified blog storage: the admin CMS and the public blog page both use MongoDB
 * (`megilance.blogs` via `/blog`). This maps a Mongo blog doc — which holds
 * both CMS fields and SEO/public render fields — onto the admin `BlogPost` shape.
 */
function mongoToBlogPost(d: any): BlogPost {
  return {
    id: d?.id || d?.slug || '',
    title: d?.title || '',
    slug: d?.slug || '',
    excerpt: d?.excerpt || d?.meta_description || '',
    content: d?.content || '',
    image_url: d?.image_url || d?.featured_image_url || '',
    author: d?.author || 'MegiLance',
    tags:
      Array.isArray(d?.tags) && d.tags.length
        ? d.tags
        : Array.isArray(d?.secondary_keywords) && d.secondary_keywords.length
          ? d.secondary_keywords
          : d?.category
            ? [d.category]
            : [],
    created_at: d?.created_at || d?.published_date || '',
    updated_at: d?.updated_at || d?.created_at || '',
    is_published:
      d?.is_published !== undefined ? d.is_published : d?.status ? d.status === 'published' : true,
    is_news_trend: d?.is_news_trend ?? false,
    views: d?.views ?? d?.view_count ?? 0,
    reading_time: d?.reading_time ?? d?.reading_time_minutes ?? 1,
  };
}

export const blogApi = {
  getAll: async (isPublished?: boolean, isNewsTrend?: boolean): Promise<BlogPost[]> => {
    try {
      // include_drafts=true so the admin CMS sees unpublished posts too
      const res = await apiFetch<{ items?: any[] }>(
        '/blog?include_drafts=true&limit=100',
      );
      let items = (res.items || []).map(mongoToBlogPost);
      if (isPublished !== undefined) items = items.filter((p) => p.is_published === isPublished);
      if (isNewsTrend !== undefined) items = items.filter((p) => p.is_news_trend === isNewsTrend);
      return items;
    } catch (error) {
      console.error('Blog API error:', error);
      return [];
    }
  },

  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const data = await apiFetch<any>(`/blog/${slug}`);
      return data ? mongoToBlogPost(data) : null;
    } catch (error) {
      console.error('Blog API error:', error);
      return null;
    }
  },

  create: async (post: CreateBlogPost): Promise<BlogPost> => {
    const data = await apiFetch<any>('/blog', {
      method: 'POST',
      body: JSON.stringify(post),
    });
    return mongoToBlogPost(data);
  },

  update: async (id: string, post: UpdateBlogPost): Promise<BlogPost> => {
    const data = await apiFetch<any>(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post),
    });
    return mongoToBlogPost(data);
  },

  delete: async (id: string): Promise<void> => {
    await apiFetch(`/blog/${id}`, { method: 'DELETE' });
  },
};

// ── MongoDB-backed SEO blog API ────────────────────────────────────────────────

export interface MongoBlog {
  id: string;
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  secondary_keywords: string[];
  category: string;
  target_audience: string;
  search_intent: string;
  content?: string;
  excerpt: string;
  canonical_url: string;
  featured_image_url: string;
  featured_image_webp_url: string;
  featured_image_alt: string;
  schema_jsonld?: string;
  internal_links: { url: string; text: string }[];
  related_blog_slugs: string[];
  related_blogs?: MongoBlog[];
  word_count: number;
  reading_time_minutes: number;
  status: string;
  published_date: string;
  view_count: number;
  seo_score: number;
  created_at: string;
}

export interface MongoBlogListResponse {
  items: MongoBlog[];
  total: number;
  skip: number;
  limit: number;
  pages: number;
}

export const mongoBlogApi = {
  getAll: async (limit = 10, skip = 0, category?: string, keyword?: string): Promise<MongoBlogListResponse> => {
    try {
      const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
      if (category) params.append('category', category);
      if (keyword) params.append('keyword', keyword);
      const res = await fetch(`${API_URL}/blog?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch mongo blogs');
      return res.json();
    } catch (e) {
      console.error('MongoBlog API error:', e);
      return { items: [], total: 0, skip, limit, pages: 0 };
    }
  },

  getBySlug: async (slug: string): Promise<MongoBlog | null> => {
    try {
      const res = await fetch(`${API_URL}/blog/${slug}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      console.error('MongoBlog API error:', e);
      return null;
    }
  },

  search: async (q: string, limit = 10, skip = 0): Promise<MongoBlogListResponse> => {
    try {
      const res = await fetch(`${API_URL}/blog/search/query?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    } catch (e) {
      console.error('MongoBlog search error:', e);
      return { items: [], total: 0, skip, limit, pages: 0 };
    }
  },

  getCategories: async (): Promise<{ categories: { name: string; count: number }[]; total: number }> => {
    try {
      const res = await fetch(`${API_URL}/blog/categories/list`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    } catch (e) {
      console.error('MongoBlog categories error:', e);
      return { categories: [], total: 0 };
    }
  },

  getStats: async () => {
    try {
      const res = await fetch(`${API_URL}/blog/stats/overview`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    } catch (e) {
      console.error('MongoBlog stats error:', e);
      return null;
    }
  },
};
