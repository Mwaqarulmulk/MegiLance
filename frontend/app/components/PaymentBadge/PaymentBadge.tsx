// @AI-HINT: This is the PaymentBadge component for displaying payment status (e.g., Paid, Pending) in lists and cards. All styles are per-component only. See PaymentBadge.common.css, PaymentBadge.light.css, and PaymentBadge.dark.css for theming.
import React from "react";
import "./PaymentBadge.common.css";
import "./PaymentBadge.light.css";
import "./PaymentBadge.dark.css";

export interface PaymentBadgeProps {
  theme?: "light" | "dark";
  status: "paid" | "pending" | "failed";
}

const statusLabels = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed"
};

const PaymentBadge: React.FC<PaymentBadgeProps> = ({ theme = "light", status }) => {
  return (
    <span className={`PaymentBadge PaymentBadge--${theme} PaymentBadge--${status}`}>{statusLabels[status]}</span>
  );
};

export default PaymentBadge;
