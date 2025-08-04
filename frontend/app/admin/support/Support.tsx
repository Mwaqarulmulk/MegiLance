// @AI-HINT: This is the Support Ticket Management page for admins. All styles are per-component only.
'use client';

import React from 'react';
import Button from '@/app/components/Button/Button';
import './Support.common.css';
import './Support.light.css';
import './Support.dark.css';

interface SupportProps {
  theme?: 'light' | 'dark';
}

// Mock data for support tickets
const mockTickets = [
  { id: 't1', subject: 'Withdrawal not processing', user: 'Mike R.', priority: 'High', status: 'Open', lastUpdate: '2 hours ago' },
  { id: 't2', subject: 'Question about platform fees', user: 'Innovate Inc.', priority: 'Medium', status: 'Open', lastUpdate: '1 day ago' },
  { id: 't3', subject: 'Report a bug in messaging', user: 'Alex Johnson', priority: 'Medium', status: 'In Progress', lastUpdate: '3 hours ago' },
  { id: 't4', subject: 'Project dispute assistance', user: 'Startup X', priority: 'High', status: 'Open', lastUpdate: '5 hours ago' },
  { id: 't5', subject: 'How to change my email?', user: 'Sam Lee', priority: 'Low', status: 'Closed', lastUpdate: '2 days ago' },
];

const Support: React.FC<SupportProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Support Support--${theme}`}>
      <header className="Support-header">
        <h1>Support Tickets</h1>
        <p>View and manage all user support requests.</p>
      </header>

      <div className={`Support-table-container Support-table-container--${theme}`}>
        <table className="Support-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Subject</th>
              <th>User</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Last Update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTickets.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.user}</td>
                <td>
                  <span className={`priority-badge priority-badge--${ticket.priority}`}>{ticket.priority}</span>
                </td>
                <td>
                  <span className={`status-badge status-badge--${ticket.status.replace(/\s+/g, '-')}`}>{ticket.status}</span>
                </td>
                <td>{ticket.lastUpdate}</td>
                <td>
                  <Button theme={theme} variant="outline" size="small">View Ticket</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;
