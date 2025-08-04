// @AI-HINT: This is the TransactionRow component for displaying a single transaction in payment history lists. All styles are per-component only. See TransactionRow.common.css, TransactionRow.light.css, and TransactionRow.dark.css for theming.
import React from "react";
import PaymentBadge from "../PaymentBadge/PaymentBadge";
import "./TransactionRow.common.css";
import "./TransactionRow.light.css";
import "./TransactionRow.dark.css";

export interface TransactionRowProps {
  theme?: "light" | "dark";
  date: string;
  description: string;
  amount: string;
  status: "paid" | "pending" | "failed";
}

const TransactionRow: React.FC<TransactionRowProps> = ({ theme = "light", date, description, amount, status }) => {
  return (
    <div className={`TransactionRow TransactionRow--${theme}`}>
      <span className="TransactionRow-date">{date}</span>
      <span className="TransactionRow-description">{description}</span>
      <span className="TransactionRow-amount">{amount}</span>
      <PaymentBadge theme={theme} status={status} />
    </div>
  );
};

export default TransactionRow;
