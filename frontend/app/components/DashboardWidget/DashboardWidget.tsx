// @AI-HINT: This is the refactored DashboardWidget, a premium, theme-aware component for displaying key metrics. It uses CSS modules and a useMemo hook for efficient styling.
import React, { useMemo, useId } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

import commonStyles from './DashboardWidget.common.module.css';
import lightStyles from './DashboardWidget.light.module.css';
import darkStyles from './DashboardWidget.dark.module.css';

export interface DashboardWidgetProps {
  title: string;
  value?: string | number;
  footer?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  title, 
  value, 
  footer, 
  onClick,
  children
}) => {
  const { theme } = useTheme();
  const titleId = useId();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const isClickable = !!onClick;

  const interactiveProps = isClickable ? {
    role: 'button',
    tabIndex: 0,
    onClick: onClick,
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick();
      }
    },
    title: `View details for ${title}`,
  } : {};

  return (
    <section 
      className={cn(styles.widget, isClickable && styles.clickable)}
      aria-labelledby={titleId}
      {...interactiveProps}
    >
      <div className={styles.header}>
        <h3 id={titleId} className={styles.title}>{title}</h3>
      </div>

      {children ? (
        <div className={styles.content}>{children}</div>
      ) : (
        <p className={styles.value}>{value}</p>
      )}

      {footer && <div className={styles.footer}>{footer}</div>}
    </section>
  );
};

export default DashboardWidget;
