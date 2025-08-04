// @AI-HINT: This is the Payments page root component. All styles are per-component only. See Payments.common.css, Payments.light.css, and Payments.dark.css for theming.
import React from 'react';
import TransactionRow from '../components/TransactionRow/TransactionRow';
import './Payments.common.css';
import './Payments.light.css';
import './Payments.dark.css';

interface PaymentsProps {
  theme?: 'light' | 'dark';
}

const Payments: React.FC<PaymentsProps> = ({ theme = 'light' }) => {
  const mockTransactions = [
    {
      date: '2023-10-26',
      description: 'Payment from Global Retail Inc.',
      amount: '+$5,000.00',
      status: 'paid' as const,
    },
    {
      date: '2023-10-24',
      description: 'Milestone payment for Mobile App',
      amount: '+$2,500.00',
      status: 'paid' as const,
    },
    {
      date: '2023-10-22',
      description: 'Withdrawal to bank account',
      amount: '-$3,000.00',
      status: 'pending' as const,
    },
    {
      date: '2023-10-20',
      description: 'Platform service fee',
      amount: '-$50.00',
      status: 'failed' as const,
    },
  ];

  return (
    <div className={`Payments Payments--${theme}`}>
      <div className="Payments-header">
        <h1>Payments & Transactions</h1>
        {/* Add Payment Method Button will go here */}
      </div>
      <div className="Payments-content">
        <section className="Payments-summary">
          <h2>Account Balance</h2>
          <p className="Payments-balance">$1,234.56</p>
        </section>
        <section className="Payments-history">
          <h2>Transaction History</h2>
          <div className="Payments-transactions-list">
            {mockTransactions.map((transaction, index) => (
              <TransactionRow
                key={index}
                theme={theme}
                date={transaction.date}
                description={transaction.description}
                amount={transaction.amount}
                status={transaction.status}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Payments;
