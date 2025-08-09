// @AI-HINT: This is the main page for the blog, which displays a grid of recent articles with theme support and animations.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';

import BlogPostCard from '@/app/components/Public/BlogPostCard/BlogPostCard';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import { mockPosts } from './data';

import commonStyles from './Blog.common.module.css';
import lightStyles from './Blog.light.module.css';
import darkStyles from './Blog.dark.module.css';

const AnimatedSection: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });

  return (
    <div ref={ref} className={cn(className, commonStyles.isNotVisible, { [commonStyles.isVisible]: isVisible })}>
      {children}
    </div>
  );
};

const BlogPage: React.FC = () => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <main id="main-content" role="main" aria-labelledby="blog-title" className={commonStyles.container}>
      <AnimatedSection>
        <header className={commonStyles.header}>
          <h1 id="blog-title" className={cn(commonStyles.title, themeStyles.title)}>The MegiLance Blog</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            Insights on crypto, freelancing, and the future of work.
          </p>
        </header>
      </AnimatedSection>

      <AnimatedSection>
        <section className={commonStyles.grid} aria-label="Recent posts">
          {mockPosts.map((post) => (
            <BlogPostCard key={post.slug} {...post} />
          ))}
        </section>
      </AnimatedSection>
    </main>
  );
};

export default BlogPage;

