// @AI-HINT: Blog RSS feed for SEO content discovery and syndication.
// Accessible at /blog/feed.xml - helps search engines discover new blog content faster.
import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://megilance.site';

interface BlogPost {
  slug: string;
  title: string;
  excerpt?: string;
  created_at?: string;
  updated_at?: string;
  author?: string;
}

async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blog?page=1&page_size=50&is_published=true`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = await fetchBlogPosts();

  const items = posts
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${BASE_URL}/blog/${escapeXml(post.slug)}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${escapeXml(post.slug)}</guid>
      ${post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : ''}
      ${post.created_at ? `<pubDate>${new Date(post.created_at).toUTCString()}</pubDate>` : ''}
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ''}
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MegiLance Blog - Freelancing Tips &amp; Remote Work Insights</title>
    <link>${BASE_URL}/blog</link>
    <description>Expert guides on freelance jobs online, remote work, hiring freelancers, and growing your freelance career. Tips from the MegiLance team.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE_URL}/icons/icon-512x512.svg</url>
      <title>MegiLance Blog</title>
      <link>${BASE_URL}/blog</link>
    </image>${items}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}
