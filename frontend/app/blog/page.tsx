// @AI-HINT: This is the main page for the blog, which displays a grid of recent articles.
'use client';

import React from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import BlogPostCard, { BlogPostCardProps } from '@/app/components/Public/BlogPostCard/BlogPostCard';
import './BlogPage.common.css';
import './BlogPage.light.css';
import './BlogPage.dark.css';

const mockPosts: BlogPostCardProps[] = [
  {
    slug: 'mastering-defi-a-beginners-guide',
    title: 'Mastering DeFi: A Beginner’s Guide to Decentralized Finance',
    excerpt: 'Dive into the world of DeFi and learn how to navigate the complexities of decentralized exchanges, lending protocols, and more.',
    imageUrl: '/images/blog/defi-guide.jpg',
    author: 'Alice Johnson',
    date: 'August 8, 2025',
  },
  {
    slug: 'the-art-of-the-perfect-logo',
    title: 'The Art of the Perfect Logo: A Freelancer’s Perspective',
    excerpt: 'Discover the principles of great logo design and how to create a lasting brand identity for your clients.',
    imageUrl: '/images/blog/logo-design.jpg',
    author: 'Bob Williams',
    date: 'August 5, 2025',
  },
  {
    slug: 'securing-your-smart-contracts',
    title: 'Top 5 Security Practices for Smart Contracts',
    excerpt: 'Learn how to protect your smart contracts from common vulnerabilities and ensure the safety of your users’ funds.',
    imageUrl: '/images/blog/smart-contracts.jpg',
    author: 'Charlie Brown',
    date: 'August 2, 2025',
  },
];

const BlogPage: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`BlogPage-container BlogPage-container--${theme}`}>
      <header className="BlogPage-header">
        <h1 className="BlogPage-title">The MegiLance Blog</h1>
        <p className="BlogPage-subtitle">Insights on crypto, freelancing, and the future of work.</p>
      </header>
      <main className="BlogPage-main">
        <div className="BlogPage-grid">
          {mockPosts.map(post => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
