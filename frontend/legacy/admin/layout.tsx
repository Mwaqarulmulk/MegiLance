// @AI-HINT: This layout file applies the custom AdminLayout to all pages within the /admin route group, providing a consistent sidebar and content structure.
import React from 'react';
import AdminLayout from '@/app/admin/layouts/AdminLayout/AdminLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
