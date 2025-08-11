// @AI-HINT: This is the modernized client projects page, using the new ProjectCard, custom controls, and a clean, responsive layout.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PlusCircle, Download, Search, AlertTriangle, SearchX } from 'lucide-react';
import { useClientData } from '@/hooks/useClient'; // Using mock data hook
import ProjectCard, { ProjectCardProps } from '@/app/components/ProjectCard/ProjectCard';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import Button from '@/app/components/Button/Button';
import Pagination from '@/app/components/Pagination/Pagination';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import common from './Projects.common.module.css';
import light from './Projects.light.module.css';
import dark from './Projects.dark.module.css';

// Mock data transformation
const transformProjectData = (projects: any[]): ProjectCardProps[] => {
  if (!Array.isArray(projects)) return [];
  return projects.map(p => ({
    id: p.id,
    title: p.title || 'Untitled Project',
    status: p.status || 'Pending',
    progress: p.progress ?? Math.floor(Math.random() * 101),
    budget: p.budget || 0,
    paid: p.paid ?? Math.floor(Math.random() * (p.budget || 0)),
    freelancers: p.freelancers || [],
    updatedAt: p.updatedAt || new Date().toLocaleDateString(),
  }));
};

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'title', label: 'Title' },
  { value: 'budget', label: 'Budget' },
  { value: 'progress', label: 'Progress' },
];

const Projects: React.FC = () => {
  const { theme } = useTheme();
  const themed = theme === 'dark' ? dark : light;
  const { projects: rawProjects, loading, error } = useClientData();
  const projects = useMemo(() => transformProjectData(rawProjects || []), [rawProjects]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('updatedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => statusFilter === 'All' || p.status === statusFilter)
      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, statusFilter, searchQuery]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const key = sortKey as keyof ProjectCardProps;
      if (a[key] < b[key]) return 1;
      if (a[key] > b[key]) return -1;
      return 0;
    });
  }, [filteredProjects, sortKey]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(start, start + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

  if (error) {
    return <EmptyState title="Error" description="Failed to load projects. Please try again later." icon={<AlertTriangle size={48} />} />;
  }

  return (
    <div className={cn(common.page, themed.theme)}>
      <header className={common.header}>
        <div>
          <h1 className={common.title}>Projects</h1>
          <p className={common.subtitle}>Manage all your ongoing and completed projects.</p>
        </div>
        <div className={common.actions}>
          <Button variant="secondary" iconBefore={<Download size={16} />}>Export</Button>
          <Button iconBefore={<PlusCircle size={16} />}>New Project</Button>
        </div>
      </header>

      <div className={common.controls}>
        <Input
          iconBefore={<Search size={18} />}
          placeholder="Search by project title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={common.searchInput}
        />
        <div className={common.filters}>
          <Select id="status-filter" options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
          <Select id="sort-key" options={SORT_OPTIONS} value={sortKey} onChange={(e) => setSortKey(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className={common.grid}>
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className={common.skeletonCard} />)}
        </div>
      ) : paginatedProjects.length > 0 ? (
        <main className={common.grid}>
          {paginatedProjects.map(project => <ProjectCard key={project.id} {...project} />)}
        </main>
      ) : (
        <EmptyState
          title="No Projects Found"
          description="It looks like there are no projects matching your criteria."
          icon={<SearchX size={48} />}
        />
      )}

      {paginatedProjects.length > 0 && (
        <footer className={common.footer}>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(sortedProjects.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        </footer>
      )}
    </div>
  );
};

export default Projects;
