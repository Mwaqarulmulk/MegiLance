// @AI-HINT: Enhanced DashboardWidget component for displaying key metrics with trends, icons, and professional styling. Supports enterprise-grade dashboard layouts with comprehensive theming. Uses per-component CSS architecture.
import React from "react";
import "./DashboardWidget.common.css";
import "./DashboardWidget.light.css";
import "./DashboardWidget.dark.css";

export interface DashboardWidgetProps {
  theme?: "light" | "dark";
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
  theme = "light", 
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
  return (
    <div 
      className={`DashboardWidget DashboardWidget--${theme} ${onClick ? 'DashboardWidget--clickable' : ''}`}
      onClick={onClick}
    >
      <div className="DashboardWidget-header">
        {icon && <span className="DashboardWidget-icon">{icon}</span>}
        <span className="DashboardWidget-title">{title}</span>
        {actionButton && (
          <button onClick={actionButton.onClick} className="DashboardWidget-action-btn">
            {actionButton.label}
          </button>
        )}
      </div>
      {children ? (
        <div className="DashboardWidget-content">{children}</div>
      ) : (
        <>
          <div className="DashboardWidget-value">{value}</div>
          {trend && (
            <div className={`DashboardWidget-trend DashboardWidget-trend--${trendType}`}>
              <span className="DashboardWidget-trend-text">{trend}</span>
            </div>
          )}
        </>
      )}
      {footer && <div className="DashboardWidget-footer">{footer}</div>}
    </div>
  );
};

export default DashboardWidget;
