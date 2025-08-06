// @AI-HINT: This component displays a preview card for a single blog post, used on the main blog listing page.
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import commonStyles from './BlogPostCard.common.module.css';
import lightStyles from './BlogPostCard.light.module.css';
import darkStyles from './BlogPostCard.dark.module.css';

// @AI-HINT: This component displays a preview card for a single blog post, used on the main blog listing page. It is fully theme-aware and uses CSS modules.

export interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
  className?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ slug, title, excerpt, imageUrl, author, date, className }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <Link href={`/blog/${slug}`} className={cn(commonStyles.blogPostCardLink, className)}>
      <div className={cn(commonStyles.container, themeStyles.themeWrapper)}>
        <div className={commonStyles.imageWrapper}>
          <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" />
        </div>
        <div className={commonStyles.content}>
          <h3 className={commonStyles.title}>{title}</h3>
          <p className={commonStyles.excerpt}>{excerpt}</p>
          <div className={commonStyles.meta}>
            <span className={commonStyles.author}>By {author}</span>
            <span className={commonStyles.date}>{date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
