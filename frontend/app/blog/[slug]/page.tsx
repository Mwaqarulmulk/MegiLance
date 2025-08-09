// @AI-HINT: This page displays an individual blog post with theme support and animations, fetching data from a centralized source.
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from 'next-themes';

import { mockPosts } from '../data';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

import commonStyles from './BlogPost.common.module.css';
import lightStyles from './BlogPost.light.module.css';
import darkStyles from './BlogPost.dark.module.css';

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

  return (
    <div ref={ref} className={cn(className, commonStyles.isNotVisible, { [commonStyles.isVisible]: isVisible })}>
      {children}
    </div>
  );
};

const BlogPostPage: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const post = mockPosts.find((p) => p.slug === slug);

  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  if (!post) {
    return (
      <main id="main-content" role="main" className={commonStyles.container}>
        <p role="status" aria-live="polite">Post not found.</p>
      </main>
    );
  }

  return (
    <main id="main-content" role="main" aria-labelledby="post-title">
      <div className={commonStyles.container}>
        <AnimatedSection>
          <article className={commonStyles.article}>
            <header className={commonStyles.header}>
              <h1 id="post-title" className={cn(commonStyles.title, themeStyles.title)}>{post.title}</h1>
              <div className={cn(commonStyles.meta, themeStyles.meta)}>
                <span className={commonStyles.author}>By {post.author}</span>
                <span>{post.date}</span>
              </div>
            </header>

            <figure className={commonStyles.imageWrapper}>
              <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" />
            </figure>

            <section
              aria-label="Post content"
              className={cn(commonStyles.content, themeStyles.content)}
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </article>
        </AnimatedSection>
      </div>
    </main>
  );
};


export default BlogPostPage;
