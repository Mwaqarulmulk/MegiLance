// @AI-HINT: Premium blog post card with gradient overlays, tag badges, reading-time indicators, and smooth hover animations.
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Clock, Eye, ArrowUpRight, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import commonStyles from './BlogPostCard.common.module.css';
import lightStyles from './BlogPostCard.light.module.css';
import darkStyles from './BlogPostCard.dark.module.css';

export interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  date: string;
  views?: number;
  readingTime?: number;
  content?: string;
  tags?: string[];
  isFeatured?: boolean;
  className?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  slug, title, excerpt, imageUrl, author, date,
  views, readingTime, tags, isFeatured, className
}) => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;

  const displayTags = tags?.slice(0, 2) || [];

  return (
    <Link href={`/blog/${slug}`} className={cn(commonStyles.blogPostCardLink, isFeatured && commonStyles.featured, className)}>
      <article className={cn(commonStyles.container, themeStyles.container)}>
        {/* Image section with gradient overlay */}
        <div className={commonStyles.imageWrapper}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes={isFeatured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
            className={commonStyles.image}
          />
          <div className={cn(commonStyles.imageOverlay, themeStyles.imageOverlay)} />

          {/* Floating badges on image */}
          <div className={commonStyles.badgeRow}>
            {readingTime !== undefined && (
              <span className={cn(commonStyles.badge, commonStyles.badgeTime)}>
                <Clock size={12} />
                {readingTime} min
              </span>
            )}
            {displayTags.length > 0 && (
              <span className={cn(commonStyles.badge, commonStyles.badgeTag)}>
                {displayTags[0]}
              </span>
            )}
          </div>

          {/* Arrow icon on hover */}
          <div className={cn(commonStyles.arrowIcon, themeStyles.arrowIcon)}>
            <ArrowUpRight size={20} />
          </div>
        </div>

        {/* Content section */}
        <div className={commonStyles.content}>
          <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
          <p className={cn(commonStyles.excerpt, themeStyles.excerpt)}>{excerpt}</p>

          {/* Footer with author and stats */}
          <div className={commonStyles.footer}>
            <div className={cn(commonStyles.authorRow, themeStyles.authorRow)}>
              <div className={cn(commonStyles.avatar, themeStyles.avatar)}>
                <User size={14} />
              </div>
              <div>
                <span className={commonStyles.authorName}>{author}</span>
                <span className={commonStyles.date}>{date}</span>
              </div>
            </div>
            {views !== undefined && views > 0 && (
              <div className={cn(commonStyles.viewCount, themeStyles.viewCount)}>
                <Eye size={14} />
                <span>{views.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export default BlogPostCard;
