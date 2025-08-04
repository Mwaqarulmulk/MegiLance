// @AI-HINT: This is the User Management page for admins to view, search, and manage users. All styles are per-component only.
'use client';

import React from 'react';
import Input from '@/app/components/Input/Input';
import Button from '@/app/components/Button/Button';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './Users.common.css';
import './Users.light.css';
import './Users.dark.css';

interface UsersProps {
  theme?: 'light' | 'dark';
}

// Mock data for users
const mockUsers = [
  { id: 'u1', name: 'Alex Johnson', email: 'alex.j@example.com', type: 'Freelancer', status: 'Active', joined: '2025-08-01' },
  { id: 'u2', name: 'Beta Corp', email: 'contact@betacorp.com', type: 'Client', status: 'Active', joined: '2025-08-01' },
  { id: 'u3', name: 'Sam Lee', email: 'sam.lee@example.com', type: 'Freelancer', status: 'Suspended', joined: '2025-07-28' },
  { id: 'u4', name: 'Innovate Inc.', email: 'hello@innovate.com', type: 'Client', status: 'Active', joined: '2025-07-25' },
  { id: 'u5', name: 'Maria Garcia', email: 'maria.g@example.com', type: 'Freelancer', status: 'Active', joined: '2025-07-22' },
];

const Users: React.FC<UsersProps> = ({ theme = 'light' }) => {
  return (
    <div className={`Users Users--${theme}`}>
      <header className="Users-header">
        <h1>User Management</h1>
        <div className="Users-actions">
          <Input theme={theme} type="search" placeholder="Search by name or email..." />
          <Button theme={theme} variant="primary">Add User</Button>
        </div>
      </header>

      <div className={`Users-table-container Users-table-container--${theme}`}>
        <table className="Users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="User-info">
                    <UserAvatar theme={theme} name={user.name} />
                    <div>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td>{user.type}</td>
                <td>
                  <span className={`status-badge status-badge--${user.status}`}>{user.status}</span>
                </td>
                <td>{user.joined}</td>
                <td>
                  <div className="Table-actions">
                    <Button theme={theme} variant="outline" size="small">View</Button>
                    <Button theme={theme} variant="danger-outline" size="small">Suspend</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
