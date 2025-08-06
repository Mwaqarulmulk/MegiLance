// @AI-HINT: Enhanced DashboardWidget component for displaying key metrics with trends, icons, and professional styling. Supports enterprise-grade dashboard layouts with comprehensive theming. Uses per-component CSS architecture.
import React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import commonStyles from './DashboardWidget.common.module.css';
import lightStyles from './DashboardWidget.light.module.css';
import darkStyles from './DashboardWidget.dark.module.css';

export interface DashboardWidgetProps {
  title: string;
  value?: string | number;
  icon?: React.ReactNode | string;
  footer?: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
  children?: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  title, 
  value, 
  icon, 
  footer, 
  trend, 
  trendType = 'neutral',
  onClick,
  children,
  actionButton
}) => {
  const { theme } = useTheme();

  if (!theme) {
    return null; // Or a loading skeleton
  }

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div 
      className={cn(
        commonStyles.dashboardWidget,
        themeStyles.dashboardWidget,
        onClick && commonStyles.clickable,
        onClick && themeStyles.clickable
      )}
      onClick={onClick}
    >
      <div className={cn(commonStyles.header, themeStyles.header)}>
        {icon && <span className={cn(commonStyles.icon, themeStyles.icon)}>{icon}</span>}
        <span className={cn(commonStyles.title, themeStyles.title)}>{title}</span>
        {actionButton && (
          <button onClick={actionButton.onClick} className={cn(commonStyles.actionBtn, themeStyles.actionBtn)}>
            {actionButton.label}
          </button>
        )}
      </div>
      {children ? (
        <div className={cn(commonStyles.content, themeStyles.content)}>{children}</div>
      ) : (
        <>
          <div className={cn(commonStyles.value, themeStyles.value)}>{value}</div>
          {trend && (
            <div className={cn(commonStyles.trend, themeStyles.trend, commonStyles[trendType], themeStyles[trendType])}>
              <span className={cn(commonStyles.trendText, themeStyles.trendText)}>{trend}</span>
            </div>
          )}
        </>
      )}
      {footer && <div className={cn(commonStyles.footer, themeStyles.footer)}>{footer}</div>}
    </div>
  );
};

export default DashboardWidget;
