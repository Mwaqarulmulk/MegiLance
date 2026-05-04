import { BlogPostCardProps } from '@/app/components/Public/BlogPostCard/BlogPostCard';

// Build API URL with proper fallback for production
const envUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = envUrl 
  ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`)
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
    ? '/api' 
    : 'http://localhost:8000/api');

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
