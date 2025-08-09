/* @AI-HINT: PublicLayout provides the shared chrome (Header, Footer, skip links) for all public-facing pages. It is theme-aware and uses per-component CSS modules (common, light, dark). */
"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import commonStyles from './PublicLayout.common.module.css';
import lightStyles from './PublicLayout.light.module.css';
import darkStyles from './PublicLayout.dark.module.css';

type Props = { children: React.ReactNode };

const PublicLayout: React.FC<Props> = ({ children }) => {
  const { theme } = useTheme();

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
  const styles = React.useMemo(() => ({
    root: cn(commonStyles.root, themeStyles.root),
    skipLink: cn(commonStyles.skipLink, themeStyles.skipLink),
    main: cn(commonStyles.main, themeStyles.main),
  }), [themeStyles]);

  return (
    <div className={styles.root}>
      {/* @AI-HINT: Accessibility - Align global skip link target across the app. */}
      <a href="#main-content" className={styles.skipLink}>Skip to content</a>
      <main id="main-content" role="main" className={styles.main}>
        {/* @AI-HINT: Layout - Constrain content to a readable width for improved rhythm. */}
        <div className={commonStyles.container}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
