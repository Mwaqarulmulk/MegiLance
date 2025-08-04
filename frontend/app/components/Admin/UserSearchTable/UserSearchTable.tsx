// @AI-HINT: This component provides a searchable and filterable table for managing users in the admin panel.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Badge from '@/app/components/Badge/Badge';
import Button from '@/app/components/Button/Button';
import './UserSearchTable.common.css';
import './UserSearchTable.light.css';
import './UserSearchTable.dark.css';

// Mock data for demonstration
const mockUsers = [
  { id: 'usr_001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Freelancer', status: 'Active' },
  { id: 'usr_002', name: 'Bob Williams', email: 'bob@example.com', role: 'Client', status: 'Active' },
  { id: 'usr_003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Freelancer', status: 'Suspended' },
  { id: 'usr_004', name: 'Diana Prince', email: 'diana@example.com', role: 'Admin', status: 'Active' },
  { id: 'usr_005', name: 'Ethan Hunt', email: 'ethan@example.com', role: 'Client', status: 'Inactive' },
];

const UserSearchTable: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`UserSearchTable-container UserSearchTable-container--${theme}`}>
      <div className="UserSearchTable-header">
        <h2 className="UserSearchTable-title">User Management</h2>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`UserSearchTable-search-input UserSearchTable-search-input--${theme}`}
        />
      </div>
      <div className="UserSearchTable-table-wrapper">
        <table className={`UserSearchTable UserSearchTable--${theme}`}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><Badge theme={theme} variant={user.role === 'Admin' ? 'primary' : 'secondary'}>{user.role}</Badge></td>
                <td><Badge theme={theme} variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge></td>
                <td className="UserSearchTable-actions">
                  <Button theme={theme} variant="secondary" size="small">View</Button>
                  <Button theme={theme} variant="primary" size="small">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserSearchTable;
