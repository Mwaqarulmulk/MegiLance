// @AI-HINT: This is the DashboardWidget component for displaying key stats or summaries in the dashboard. All styles are per-component only. See DashboardWidget.common.css, DashboardWidget.light.css, and DashboardWidget.dark.css for theming.
import React from "react";
import "./DashboardWidget.common.css";
import "./DashboardWidget.light.css";
import "./DashboardWidget.dark.css";

export interface DashboardWidgetProps {
  theme?: "light" | "dark";
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ theme = "light", title, value, icon, footer }) => {
  return (
    <div className={`DashboardWidget DashboardWidget--${theme}`}>
      <div className="DashboardWidget-header">
        {icon && <span className="DashboardWidget-icon">{icon}</span>}
        <span className="DashboardWidget-title">{title}</span>
      </div>
      <div className="DashboardWidget-value">{value}</div>
      {footer && <div className="DashboardWidget-footer">{footer}</div>}
    </div>
  );
};

export default DashboardWidget;
