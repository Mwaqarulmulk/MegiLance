// @AI-HINT: This is the Notification component for displaying alerts and system messages. All styles are per-component only. See Notification.common.css, Notification.light.css, and Notification.dark.css for theming.
import React from "react";
import "./Notification.common.css";
import "./Notification.light.css";
import "./Notification.dark.css";

export interface NotificationProps {
  theme?: "light" | "dark";
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

const typeClass = {
  success: "Notification--success",
  error: "Notification--error",
  info: "Notification--info"
};

const Notification: React.FC<NotificationProps> = ({ theme = "light", message, type = "info", onClose }) => {
  return (
    <div className={`Notification Notification--${theme} ${typeClass[type]}`}> 
      <span className="Notification-message">{message}</span>
      {onClose && (
        <button className="Notification-close" onClick={onClose} aria-label="Close notification">×</button>
      )}
    </div>
  );
};

export default Notification;
