// @AI-HINT: This component provides a premium user management interface. It features a card-based layout, advanced filtering and sorting, and theme-aware styling using per-component CSS modules.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Badge from '@/app/components/Badge/Badge';
import Button from '@/app/components/Button/Button';
import Card from '@/app/components/Card/Card';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import ActionMenu, { ActionMenuItem } from '@/app/components/ActionMenu/ActionMenu';
import { MoreHorizontal, Users, Briefcase, Calendar, Search, User, Mail, Phone, Edit, Eye, UserX, Shield, UserCog } from 'lucide-react';

import commonStyles from './UserSearchTable.common.module.css';
import lightStyles from './UserSearchTable.light.module.css';
import darkStyles from './UserSearchTable.dark.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'Admin' | 'Client' | 'Freelancer';
  status: 'Active' | 'Inactive' | 'Suspended';
  joinDate: string;
}

const mockUsers: User[] = [
  { id: 'usr_001', name: 'Alice Johnson', email: 'alice.j@megilance.dev', avatarUrl: '/avatars/alice.png', role: 'Freelancer', status: 'Active', joinDate: '2024-05-15' },
  { id: 'usr_002', name: 'Bob Williams', email: 'bob.w@megilance.dev', avatarUrl: '/avatars/bob.png', role: 'Client', status: 'Active', joinDate: '2023-11-20' },
  { id: 'usr_003', name: 'Charlie Brown', email: 'charlie.b@megilance.dev', avatarUrl: '/avatars/charlie.png', role: 'Freelancer', status: 'Suspended', joinDate: '2024-01-10' },
  { id: 'usr_004', name: 'Diana Prince', email: 'diana.p@megilance.dev', avatarUrl: '/avatars/diana.png', role: 'Admin', status: 'Active', joinDate: '2022-08-01' },
  { id: 'usr_005', name: 'Ethan Hunt', email: 'ethan.h@megilance.dev', avatarUrl: '/avatars/ethan.png', role: 'Client', status: 'Inactive', joinDate: '2024-03-30' },
  { id: 'usr_006', name: 'Fiona Glenanne', email: 'fiona.g@megilance.dev', avatarUrl: '/avatars/fiona.png', role: 'Freelancer', status: 'Active', joinDate: '2023-09-05' },
];

const roleIcons = {
  Admin: <Shield size={14} />,
  Client: <Briefcase size={14} />,
  Freelancer: <UserCog size={14} />,
};

const statusVariantMap: { [key in User['status']]: 'success' | 'secondary' | 'danger' } = {
  Active: 'success',
  Inactive: 'secondary',
  Suspended: 'danger',
};

const UserCard: React.FC<{ user: User; themeStyles: any }> = ({ user, themeStyles }) => {
  const userActions: ActionMenuItem[] = [
    { label: 'View Profile', icon: Eye, onClick: () => console.log(`Viewing ${user.name}'s profile`) },
    { label: 'Edit User', icon: Edit, onClick: () => console.log(`Editing ${user.name}`) },
    { isSeparator: true },
    { label: 'Suspend User', icon: UserX, onClick: () => console.log(`Suspending ${user.name}`) },
  ];

  return (
    <Card className={cn(commonStyles.userCard, themeStyles.userCard)}>
      <div className={commonStyles.cardHeader}>
        <UserAvatar src={user.avatarUrl} name={user.name} size={48} />
        <div className={commonStyles.userInfo}>
          <h3 className={cn(commonStyles.userName, themeStyles.userName)}>{user.name}</h3>
          <p className={cn(commonStyles.userEmail, themeStyles.userEmail)}>{user.email}</p>
        </div>
        <ActionMenu items={userActions} />
      </div>
      <div className={commonStyles.cardBody}>
        <div className={cn(commonStyles.metaItem, themeStyles.metaItem)}>
          {roleIcons[user.role]}
          <span>{user.role}</span>
        </div>
        <div className={cn(commonStyles.metaItem, themeStyles.metaItem)}>
          <Calendar size={14} />
          <span>Joined {user.joinDate}</span>
        </div>
      </div>
      <div className={commonStyles.cardFooter}>
        <Badge variant={statusVariantMap[user.status]}>{user.status}</Badge>
      </div>
    </Card>
  );
};

const UserSearchTable: React.FC = () => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [sortOrder, setSortOrder] = React.useState('date-desc');

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const filteredAndSortedUsers = mockUsers
    .filter(user => {
      const term = searchTerm.toLowerCase();
      return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    })
    .filter(user => roleFilter === 'All' || user.role === roleFilter)
    .filter(user => statusFilter === 'All' || user.status === statusFilter)
    .sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc': return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
        case 'date-desc': return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={commonStyles.header}>
        <h2 className={cn(commonStyles.title, themeStyles.title)}>User Management</h2>
        <p className={cn(commonStyles.description, themeStyles.description)}>
          Search, filter, and manage all users in the system.
        </p>
      </header>

      <div className={cn(commonStyles.toolbar, themeStyles.toolbar)}>
        <Input
          id="search-users"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          iconBefore={<Search size={16} />}
          className={commonStyles.searchInput}
        />
        <div className={commonStyles.filters}>
          <Select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Roles' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Client', label: 'Client' },
              { value: 'Freelancer', label: 'Freelancer' },
            ]}
          />
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Suspended', label: 'Suspended' },
            ]}
          />
          <Select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'date-desc', label: 'Newest First' },
              { value: 'date-asc', label: 'Oldest First' },
              { value: 'name-asc', label: 'Name (A-Z)' },
              { value: 'name-desc', label: 'Name (Z-A)' },
            ]}
          />
        </div>
      </div>

      <div className={commonStyles.userGrid}>
        {filteredAndSortedUsers.length > 0 ? (
          filteredAndSortedUsers.map(user => (
            <UserCard key={user.id} user={user} themeStyles={themeStyles} />
          ))
        ) : (
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
            <Users size={48} />
            <h3>No Users Found</h3>
            <p>Adjust your search or filter criteria to find users.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchTable;
