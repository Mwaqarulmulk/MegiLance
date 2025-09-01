// @AI-HINT: Blog search page filtering mock posts client-side.
'use client';
import React, { useState, useMemo } from 'react';
import { mockPosts } from '../data';
import BlogPostCard from '@/app/components/Public/BlogPostCard/BlogPostCard';

export default function BlogSearchPage() {
  const [q, setQ] = useState('');
  const posts = useMemo(() => mockPosts.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Search Blog</h1>
      <input
        value={q}
        onChange={e=>setQ(e.target.value)}
        placeholder="Search posts..."
        className="w-full rounded-md border px-4 py-2 mb-8 bg-[var(--surface-elev)] border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        aria-label="Search blog posts"
      />
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map(p => <BlogPostCard key={p.slug} {...p} />)}
        {posts.length===0 && <p className="opacity-70">No posts found.</p>}
      </div>
    </main>
  );
}
