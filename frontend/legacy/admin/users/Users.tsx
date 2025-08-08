'use client';

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import commonStyles from './Users.common.module.css';
import lightStyles from './Users.light.module.css';
import darkStyles from './Users.dark.module.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input/input';

// @AI-HINT: This is the Admin User Management page.
// It has been fully refactored to use CSS modules and the global theme context.

const users = [
  { id: 'USR-001', name: 'John Doe', email: 'john.doe@example.com', role: 'Freelancer', status: 'Active', joined: '2023-01-15' },
  { id: 'USR-002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Client', status: 'Active', joined: '2023-02-20' },
  { id: 'USR-003', name: 'Sam Wilson', email: 'sam.wilson@example.com', role: 'Freelancer', status: 'Suspended', joined: '2023-03-10' },
  { id: 'USR-004', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Client', status: 'Active', joined: '2023-04-05' },
  { id: 'USR-005', name: 'Robert Brown', email: 'robert.b@example.com', role: 'Freelancer', status: 'Active', joined: '2023-05-21' },
];

type User = typeof users[0];

const Users: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const getStatusClass = (status: string) => {
    return status === 'Active' ? styles.statusActive : styles.statusSuspended;
  };

  return (
    <div className={`${styles.usersPage} ${theme === 'dark' ? darkStyles.usersPage : lightStyles.usersPage}`}>
      <header className={styles.header}>
        <h1>User Management</h1>
        <div className={styles.actions}>
          <Input placeholder="Search users..." className={styles.input} />
          <Button>Add User</Button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  <div className={styles.userInfo}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                </td>
                <td>{user.role}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joined}</td>
                <td>
                  <div className={styles.tableActions}>
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
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
