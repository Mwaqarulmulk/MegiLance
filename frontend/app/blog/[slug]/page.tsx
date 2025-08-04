// @AI-HINT: This page displays the full content of a single blog post, identified by its slug.
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/ThemeContext';
import './BlogPostPage.common.css';
import './BlogPostPage.light.css';
import './BlogPostPage.dark.css';

interface BlogPost {
  title: string;
  author: string;
  date: string;
  imageUrl: string;
  content: string;
}

// Mock data - in a real app, this would be fetched from a CMS
const mockPosts: { [key: string]: BlogPost } = {
  'mastering-defi-a-beginners-guide': {
    title: 'Mastering DeFi: A Beginner’s Guide to Decentralized Finance',
    author: 'Alice Johnson',
    date: 'August 8, 2025',
    imageUrl: '/images/blog/defi-guide.jpg',
    content: `
      <p>Decentralized Finance (DeFi) is a revolutionary movement built on blockchain technology...</p>
      <h2>What is a DEX?</h2>
      <p>A Decentralized Exchange (DEX) is a peer-to-peer marketplace where cryptocurrency traders make transactions directly with one another...</p>
      <h2>Lending and Borrowing</h2>
      <p>DeFi lending platforms allow users to lend their crypto and earn interest, or borrow assets against their holdings...</p>
    `,
  },
  'the-art-of-the-perfect-logo': {
    title: 'The Art of the Perfect Logo: A Freelancer’s Perspective',
    author: 'Bob Williams',
    date: 'August 5, 2025',
    imageUrl: '/images/blog/logo-design.jpg',
    content: `
      <p>A logo is more than just an image; it's the cornerstone of a brand's identity...</p>
      <h2>Simplicity is Key</h2>
      <p>The most iconic logos are often the simplest. Think of Nike, Apple, or McDonald's...</p>
    `,
  },
  'securing-your-smart-contracts': {
    title: 'Top 5 Security Practices for Smart Contracts',
    author: 'Charlie Brown',
    date: 'August 2, 2025',
    imageUrl: '/images/blog/smart-contracts.jpg',
    content: `
      <p>With great power comes great responsibility. Smart contracts handle significant value, making their security paramount...</p>
      <h2>1. Use Trusted Libraries</h2>
      <p>Don't reinvent the wheel. Use well-audited libraries like OpenZeppelin for common patterns like ERC20 or ERC721...</p>
    `,
  },
};

const BlogPostPage: React.FC = () => {
  const { theme } = useTheme();
  const params = useParams();
  const slug = params.slug as string;
  const post = mockPosts[slug];

  if (!post) {
    return <div className={`BlogPostPage-container BlogPostPage-container--${theme}`}>Post not found.</div>;
  }

  return (
    <div className={`BlogPostPage-container BlogPostPage-container--${theme}`}>
      <article className="BlogPostPage-article">
        <header className="BlogPostPage-header">
          <h1 className="BlogPostPage-title">{post.title}</h1>
          <div className="BlogPostPage-meta">
            <span>By {post.author}</span>
            <span>{post.date}</span>
          </div>
        </header>
        <div className="BlogPostPage-image-wrapper">
          <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" />
        </div>
        <div 
          className="BlogPostPage-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
};

export default BlogPostPage;
