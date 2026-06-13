import { BlogPostCardProps } from '@/app/components/Public/BlogPostCard/BlogPostCard';

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

export const blogApi = {
  getAll: async (isPublished?: boolean, isNewsTrend?: boolean): Promise<BlogPost[]> => {
    const params = new URLSearchParams();
    if (isPublished !== undefined) params.append('is_published', String(isPublished));
    if (isNewsTrend !== undefined) params.append('is_news_trend', String(isNewsTrend));
    
    try {
      const res = await fetch(`${API_URL}/blog?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      // Return actual data only - no demo fallback for production
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Blog API error:', error);
      return [];
    }
  },

  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    try {
      const res = await fetch(`${API_URL}/blog/${slug}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        return data || null;
      }
      return null;
    } catch (error) {
      console.error('Blog API error:', error);
      return null;
    }
  },

  create: async (post: CreateBlogPost): Promise<BlogPost> => {
    const res = await fetch(`${API_URL}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to create post');
    return res.json();
  },

  update: async (id: string, post: UpdateBlogPost): Promise<BlogPost> => {
    const res = await fetch(`${API_URL}/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to update post');
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/blog/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete post');
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
      const res = await fetch(`${API_URL}/blogs-mongo?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch mongo blogs');
      return res.json();
    } catch (e) {
      console.error('MongoBlog API error:', e);
      return { items: [], total: 0, skip, limit, pages: 0 };
    }
  },

  getBySlug: async (slug: string): Promise<MongoBlog | null> => {
    try {
      const res = await fetch(`${API_URL}/blogs-mongo/${slug}`, { cache: 'no-store' });
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      console.error('MongoBlog API error:', e);
      return null;
    }
  },

  search: async (q: string, limit = 10, skip = 0): Promise<MongoBlogListResponse> => {
    try {
      const res = await fetch(`${API_URL}/blogs-mongo/search/query?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    } catch (e) {
      console.error('MongoBlog search error:', e);
      return { items: [], total: 0, skip, limit, pages: 0 };
    }
  },

  getCategories: async (): Promise<{ categories: { name: string; count: number }[]; total: number }> => {
    try {
      const res = await fetch(`${API_URL}/blogs-mongo/categories/list`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    } catch (e) {
      console.error('MongoBlog categories error:', e);
      return { categories: [], total: 0 };
    }
  },

  getStats: async () => {
    try {
      const res = await fetch(`${API_URL}/blogs-mongo/stats/overview`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    } catch (e) {
      console.error('MongoBlog stats error:', e);
      return null;
    }
  },
};
