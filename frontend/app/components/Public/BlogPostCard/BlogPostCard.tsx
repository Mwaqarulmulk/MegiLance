// @AI-HINT: This component displays a preview card for a single blog post, used on the main blog listing page.
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/ThemeContext';
import './BlogPostCard.common.css';
import './BlogPostCard.light.css';
import './BlogPostCard.dark.css';

export interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ slug, title, excerpt, imageUrl, author, date }) => {
  const { theme } = useTheme();

  return (
    <Link href={`/blog/${slug}`} className={`BlogPostCard-link BlogPostCard-link--${theme}`}>
      <div className={`BlogPostCard-container BlogPostCard-container--${theme}`}>
        <div className="BlogPostCard-image-wrapper">
          <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" />
        </div>
        <div className="BlogPostCard-content">
          <h3 className="BlogPostCard-title">{title}</h3>
          <p className="BlogPostCard-excerpt">{excerpt}</p>
          <div className="BlogPostCard-meta">
            <span className="BlogPostCard-author">By {author}</span>
            <span className="BlogPostCard-date">{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
