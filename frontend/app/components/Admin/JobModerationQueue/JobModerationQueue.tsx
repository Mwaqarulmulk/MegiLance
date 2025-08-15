// @AI-HINT: This component provides a fully theme-aware queue for admins to moderate job postings. It uses per-component CSS modules and the cn utility for robust, maintainable styling.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import Card from '@/app/components/Card/Card';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import { Check, X, Search, ListFilter, Building2, CalendarDays, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

import baseStyles from './JobModerationQueue.base.module.css';
import lightStyles from './JobModerationQueue.light.module.css';
import darkStyles from './JobModerationQueue.dark.module.css';

interface Job {
  id: string;
  title: string;
  description: string;
  client: { name: string; avatarUrl: string; };
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  riskLevel: 'Low' | 'Medium' | 'High';
}

const mockJobs: Job[] = [
  { id: 'job_001', title: 'Build a DeFi Staking Platform', description: 'Seeking an expert blockchain developer to build a secure and scalable DeFi staking platform on Ethereum. Must have experience with Solidity, Web3.js, and yield farming protocols.', client: { name: 'CryptoCorp', avatarUrl: '/avatars/crypto_corp.png' }, dateSubmitted: '2025-08-08', status: 'Pending', riskLevel: 'High' },
  { id: 'job_002', title: 'Design a new company logo', description: 'We are a new artisanal coffee brand looking for a creative graphic designer to create a memorable and modern logo. Please provide a portfolio of previous branding work.', client: { name: 'Artisan Goods', avatarUrl: '/avatars/artisan_goods.png' }, dateSubmitted: '2025-08-09', status: 'Pending', riskLevel: 'Low' },
  { id: 'job_003', title: 'Develop a social media marketing campaign', description: 'Our B2B SaaS startup needs a marketing guru to develop and execute a 3-month social media campaign targeting enterprise clients on LinkedIn and Twitter.', client: { name: 'Growth Inc.', avatarUrl: '/avatars/growth_inc.png' }, dateSubmitted: '2025-08-07', status: 'Pending', riskLevel: 'Medium' },
  { id: 'job_004', title: 'Write technical documentation for API', description: 'We need a technical writer to produce clear, concise, and comprehensive documentation for our new REST API. Experience with Swagger/OpenAPI is a must.', client: { name: 'TechSolutions', avatarUrl: '/avatars/tech_solutions.png' }, dateSubmitted: '2025-08-06', status: 'Approved', riskLevel: 'Low' },
];

interface JobCardProps {
  job: Job;
  onModerate: (id: string, newStatus: 'Approved' | 'Rejected') => void;
  themeStyles: { [key: string]: string };
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onModerate, themeStyles, isExpanded, onToggleExpand }) => {
  const riskBadgeVariant = { 
    High: 'danger' as const, 
    Medium: 'warning' as const, 
    Low: 'success' as const 
  }[job.riskLevel];

  return (
    <Card className={cn(baseStyles.jobCard, themeStyles.jobCard)}>
      <div className={baseStyles.cardHeader}>
        <h3 className={cn(baseStyles.jobTitle, themeStyles.jobTitle)}>{job.title}</h3>
        <Badge variant={riskBadgeVariant}>{job.riskLevel} Risk</Badge>
      </div>

      <div className={baseStyles.cardMeta}>
        <div className={cn(baseStyles.metaItem, themeStyles.metaItem)}>
          <Building2 size={14} />
          <UserAvatar src={job.client.avatarUrl} name={job.client.name} size={24} />
          <span>{job.client.name}</span>
        </div>
        <div className={cn(baseStyles.metaItem, themeStyles.metaItem)}>
          <CalendarDays size={14} />
          <span>{job.dateSubmitted}</span>
        </div>
      </div>

      <div className={cn(baseStyles.description, isExpanded ? baseStyles.expanded : '')}>
        <p>{job.description}</p>
      </div>
      <button onClick={onToggleExpand} className={cn(baseStyles.expandButton, themeStyles.expandButton)}>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>

      <div className={baseStyles.cardActions}>
        <Button variant="success" onClick={() => onModerate(job.id, 'Approved')}><Check size={16} /> Approve</Button>
        <Button variant="danger" onClick={() => onModerate(job.id, 'Rejected')}><X size={16} /> Reject</Button>
      </div>
    </Card>
  );
};

const JobModerationQueue: React.FC = () => {
  const { theme } = useTheme();
  const [jobs, setJobs] = useState(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleModerate = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setJobs(jobs.map(job => (job.id === id ? { ...job, status: newStatus } : job)));
  };

  const toggleExpand = (id: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredAndSortedJobs = jobs
    .filter(job => job.status === 'Pending')
    .filter(job => riskFilter === 'All' || job.riskLevel === riskFilter)
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'date-desc') return new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime();
      if (sortOrder === 'date-asc') return new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime();
      const riskOrder = { High: 3, Medium: 2, Low: 1 };
      if (sortOrder === 'risk-desc') return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      if (sortOrder === 'risk-asc') return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      return 0;
    });

  return (
    <div className={cn(baseStyles.container, themeStyles.container)}>
      <header className={baseStyles.header}>
        <h2 className={cn(baseStyles.title, themeStyles.title)}>Job Moderation Queue</h2>
        <p className={cn(baseStyles.description, themeStyles.description)}>
          {filteredAndSortedJobs.length} jobs awaiting moderation.
        </p>
      </header>

      <div className={cn(baseStyles.toolbar, themeStyles.toolbar)}>
        <Input
          id="search-jobs"
          placeholder="Search jobs or clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          iconBefore={<Search size={16} />}
        />
        <div className={baseStyles.filters}>
          <Select
            id="risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Risks' },
              { value: 'Low', label: 'Low Risk' },
              { value: 'Medium', label: 'Medium Risk' },
              { value: 'High', label: 'High Risk' },
            ]}
          />
          <Select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            options={[
              { value: 'date-desc', label: 'Newest First' },
              { value: 'date-asc', label: 'Oldest First' },
              { value: 'risk-desc', label: 'Highest Risk First' },
              { value: 'risk-asc', label: 'Lowest Risk First' },
            ]}
          />
        </div>
      </div>

      <div className={baseStyles.jobGrid}>
        {filteredAndSortedJobs.length > 0 ? (
          filteredAndSortedJobs.map(job => (
            <JobCard 
              key={job.id} 
              job={job} 
              onModerate={handleModerate} 
              themeStyles={themeStyles} 
              isExpanded={expandedJobs.has(job.id)}
              onToggleExpand={() => toggleExpand(job.id)}
            />
          ))
        ) : (
          <div className={cn(baseStyles.emptyState, themeStyles.emptyState)}>
            <ListFilter size={48} />
            <h3>No Matching Jobs</h3>
            <p>Adjust your filters or clear the search to find jobs in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobModerationQueue;
