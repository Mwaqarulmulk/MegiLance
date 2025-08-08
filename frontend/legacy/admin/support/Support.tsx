'use client';

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import commonStyles from './Support.common.module.css';
import lightStyles from './Support.light.module.css';
import darkStyles from './Support.dark.module.css';

// @AI-HINT: This is the Admin Support Ticket Management page.
// It has been fully refactored to use CSS modules and the global theme context.

const supportTickets = [
  { id: 'TKT-001', user: 'Alice Johnson', subject: 'Payment Issue', priority: 'High', status: 'Open', lastUpdate: '2024-08-04' },
  { id: 'TKT-002', user: 'Bob Williams', subject: 'Project Dispute', priority: 'Medium', status: 'In-Progress', lastUpdate: '2024-08-03' },
  { id: 'TKT-003', user: 'Charlie Brown', subject: 'Account Access', priority: 'Low', status: 'Closed', lastUpdate: '2024-08-01' },
  { id: 'TKT-004', user: 'Diana Prince', subject: 'Feature Request', priority: 'Low', status: 'Closed', lastUpdate: '2024-07-30' },
  { id: 'TKT-005', user: 'Ethan Hunt', subject: 'Bug Report: Profile Page', priority: 'High', status: 'Open', lastUpdate: '2024-08-05' },
];

type Ticket = typeof supportTickets[0];

const Support: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const getPriorityClass = (priority: string) => {
    if (priority === 'High') return styles.priorityHigh;
    if (priority === 'Medium') return styles.priorityMedium;
    return styles.priorityLow;
  };

  const getStatusClass = (status: string) => {
    if (status === 'Open') return styles.statusOpen;
    if (status === 'In-Progress') return styles.statusInProgress;
    return styles.statusClosed;
  };

  return (
    <div className={`${styles.supportPage} ${theme === 'dark' ? styles.supportPageDark : styles.supportPageLight}`}>
      <header className={styles.header}>
        <h1>Support Tickets</h1>
        <p>Manage and respond to user support requests.</p>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>User</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {supportTickets.map((ticket: Ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.user}</td>
                <td>{ticket.subject}</td>
                <td>
                  <span className={`${styles.priorityBadge} ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;
