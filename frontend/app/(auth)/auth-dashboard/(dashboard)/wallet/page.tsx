// @AI-HINT: This file renders the premium, investor-grade Wallet page for the MegiLance dashboard.
// It includes a balance summary, financial metrics, payment methods, and a detailed transaction history.
// The component uses modular CSS for styling and lucide-react for icons, ensuring a clean and maintainable structure.

import React from 'react';
import { PlusCircle, Download, MoreVertical, CreditCard, Landmark, Search, Filter, Trash2, Edit } from 'lucide-react';
import styles from './Wallet.module.css';

// @AI-HINT: Mock data is used for UI development and prototyping.
// This will be replaced with dynamic data from the backend API once the frontend is complete.
const walletData = {
  currentBalance: 12450.75,
  lifetimeEarnings: 85200.00,
  pendingClearance: 3200.50,
  expensesThisMonth: 1850.25,
  paymentMethods: [
    { id: 1, type: 'Mastercard', last4: '4291', expiry: '08/25', isDefault: true },
    { id: 2, type: 'Visa', last4: '8823', expiry: '11/26', isDefault: false },
    { id: 3, type: 'Bank Account', last4: '7719', isDefault: false },
  ],
  transactions: [
    { id: 'TRX-9431', date: '2023-11-20', description: 'Payment from Stellar Goods Co.', type: 'Deposit', amount: 7500.00, status: 'Completed' },
    { id: 'TRX-9430', date: '2023-11-18', description: 'Withdrawal to Bank Account', type: 'Withdrawal', amount: -5000.00, status: 'Completed' },
    { id: 'TRX-9429', date: '2023-11-15', description: 'MegiLance Service Fee', type: 'Fee', amount: -750.00, status: 'Completed' },
    { id: 'TRX-9428', date: '2023-11-12', description: 'Payment from CoinFlow', type: 'Deposit', amount: 12000.00, status: 'Pending' },
    { id: 'TRX-9427', date: '2023-11-05', description: 'Software Subscription', type: 'Expense', amount: -49.99, status: 'Completed' },
  ],
};

// @AI-HINT: Helper function to determine the CSS class for transaction status badges.
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Completed': return styles.statusCompleted;
    case 'Pending': return styles.statusPending;
    default: return styles.statusFailed;
  }
};

// @AI-HINT: Helper function to render a visual icon based on the transaction type.
const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'Deposit': return <div className={`${styles.typeIcon} ${styles.depositIcon}`}>+</div>;
    case 'Withdrawal':
    case 'Expense':
    case 'Fee':
      return <div className={`${styles.typeIcon} ${styles.withdrawalIcon}`}>-</div>;
    default: return null;
  }
}

const WalletPage = () => {
  return (
    <div className={styles.walletContainer}>
      <header className={styles.pageHeader}>
        <h1>Wallet</h1>
        <button className={styles.statementButton}>
          <Download size={16} />
          <span>Download Statement</span>
        </button>
      </header>

      <main className={styles.mainGrid}>
        <section className={styles.balanceCard}>
          <div className={styles.balanceHeader}>
            <span>Available Balance</span>
            <MoreVertical size={20} className={styles.moreIcon} />
          </div>
          <p className={styles.balanceAmount}>${walletData.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={styles.balanceActions}>
            <button className={styles.addFundsButton}><PlusCircle size={18} /> Add Funds</button>
            <button className={styles.withdrawButton}><Download size={18} /> Withdraw</button>
          </div>
        </section>

        <aside className={styles.metricsGrid}>
          <div className={styles.metricCard}><h4>Lifetime Earnings</h4><p>${walletData.lifetimeEarnings.toLocaleString('en-US')}</p></div>
          <div className={styles.metricCard}><h4>Pending Clearance</h4><p>${walletData.pendingClearance.toLocaleString('en-US')}</p></div>
          <div className={styles.metricCard}><h4>Expenses This Month</h4><p>${walletData.expensesThisMonth.toLocaleString('en-US')}</p></div>
        </aside>

        <section className={styles.paymentMethods}>
          <h3>Payment Methods</h3>
          <div>
            {walletData.paymentMethods.map(method => (
              <div key={method.id} className={styles.methodCard}>
                {method.type.includes('Bank') ? <Landmark size={24} className={styles.methodIcon} /> : <CreditCard size={24} className={styles.methodIcon} />}
                <div className={styles.methodDetails}>
                  <span className={styles.methodType}>{method.type} ending in {method.last4}</span>
                  {method.expiry && <small className={styles.methodExpiry}>Expires {method.expiry}</small>}
                </div>
                {method.isDefault && <span className={styles.defaultBadge}>DEFAULT</span>}
                <button className={styles.methodAction} title="Edit method"><Edit size={16} /></button>
                <button className={styles.methodAction} title="Remove method"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
           <button className={styles.addMethodButton}>
              <PlusCircle size={16} /> Add New Payment Method
            </button>
        </section>

        <section className={styles.transactionsSection}>
          <div className={styles.transactionControls}>
            <h3>Transaction History</h3>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input type="text" placeholder="Search transactions..." />
            </div>
            <button className={styles.filterButton}>
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
          <div className={styles.transactionHeader}>
            <span>DESCRIPTION</span>
            <span>DATE</span>
            <span>STATUS</span>
            <span className={styles.amountHeader}>AMOUNT</span>
          </div>
          <div>
            {walletData.transactions.map(tx => (
              <div key={tx.id} className={styles.transactionRow}>
                <div className={styles.transactionDescription}>
                  {getTransactionTypeIcon(tx.type)}
                  <div>
                    <p>{tx.description}</p>
                    <small>{tx.id}</small>
                  </div>
                </div>
                <span>{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span><span className={`${styles.statusBadge} ${getStatusClass(tx.status)}`}>{tx.status}</span></span>
                <span className={`${styles.transactionAmount} ${tx.amount > 0 ? styles.positiveAmount : styles.negativeAmount}`}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                 <button className={styles.methodAction} title="Transaction details"><MoreVertical size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WalletPage;
