import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';
import { buildArticleMeta, buildBreadcrumbJsonLd, BASE_URL } from '@/lib/seo';

type Props = {
  params: Promise<{ slug: string }>;
};

async function getPost(slug: string) {
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${API_URL}/api/v1/blog/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return buildArticleMeta({
    title: post.title,
    description: post.excerpt || post.meta_description,
    path: `/blog/${post.slug}`,
    image: post.featured_image_url || post.image_url,
    publishedTime: post.published_date || post.created_at,
  });
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // JSON-LD for BlogPosting
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.meta_description,
    image: (post.featured_image_url || post.image_url) ? `${BASE_URL}${post.featured_image_url || post.image_url}` : undefined,
    datePublished: post.published_date || post.created_at,
    dateModified: post.updated_at || post.published_date || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author || 'MegiLance',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MegiLance',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512x512.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogPostClient />
    </>
  );
}
