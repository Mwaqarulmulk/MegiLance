// @AI-HINT: This page allows freelancers to manage and display their portfolio of work.
'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { FiPlusCircle, FiLayout } from 'react-icons/fi';

import Button from '@/app/components/Button/Button';
import PortfolioItemCard, { PortfolioItemCardProps } from '@/app/components/Freelancer/PortfolioItemCard/PortfolioItemCard';
import EmptyState from '@/app/components/EmptyState/EmptyState';
import { useToaster } from '@/app/components/Toast/ToasterProvider';
import { cn } from '@/lib/utils';
import commonStyles from './PortfolioPage.common.module.css';
import lightStyles from './PortfolioPage.light.module.css';
import darkStyles from './PortfolioPage.dark.module.css';

const mockPortfolioItems: Omit<PortfolioItemCardProps, 'onDelete'>[] = [
  {
    id: 1,
    title: 'DeFi Yield Aggregator Dashboard',
    description: 'A comprehensive dashboard for tracking and managing assets across multiple DeFi protocols.',
    imageUrl: '/images/stock/portfolio-1.jpg',
    projectUrl: '#',
  },
  {
    id: 2,
    title: 'NFT Marketplace UI/UX',
    description: 'Designed a user-friendly interface for a next-generation NFT marketplace on the Solana blockchain.',
    imageUrl: '/images/stock/portfolio-2.jpg',
    projectUrl: '#',
  },
  {
    id: 3,
    title: 'DAO Governance Token Launch',
    description: 'Developed the smart contracts and launch strategy for a decentralized autonomous organization.',
    imageUrl: '/images/stock/portfolio-3.jpg',
  },
];

const PortfolioPage: React.FC = () => {
  const [items, setItems] = useState(mockPortfolioItems);
  const { theme } = useTheme();
  const { notify } = useToaster();

  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    notify({ title: 'Project removed', description: 'The item was removed from your portfolio.', variant: 'info', duration: 2000 });
  };

  const handleAdd = () => {
    // Demo add: push a mock item
    const nextId = (items[0]?.id ?? 0) + Math.floor(Math.random() * 1000) + 1;
    const newItem: Omit<PortfolioItemCardProps, 'onDelete'> = {
      id: nextId,
      title: 'New Showcase Project',
      description: 'Describe your achievement, outcomes, and impact. Upload images and links.',
      imageUrl: '/images/stock/portfolio-1.jpg',
      projectUrl: '#',
    };
    setItems([newItem, ...items]);
    notify({ title: 'Project added', description: 'Draft project created. Customize its details.', variant: 'success', duration: 2200 });
  };

  return (
    <div className={cn(styles.container)}>
      <header className={cn(styles.header)}>
        <div className={cn(styles.titleGroup)}>
          <h1 className={cn(styles.title)}>My Portfolio</h1>
          <p className={cn(styles.subtitle)}>Showcase your best work and accomplishments to attract top clients.</p>
        </div>
        <Button variant="primary" size="large" onClick={handleAdd} aria-label="Add new project"><FiPlusCircle /> Add New Project</Button>
      </header>

      <main className={cn(styles.main)}>
        {items.length > 0 ? (
          <div className={cn(styles.grid)}>
            {items.map(item => (
              <PortfolioItemCard key={item.id} {...item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className={cn(styles.emptyState)}>
            <EmptyState
              title="Showcase your best work"
              description="Add a project to start building your reputation and attract top clients."
              icon={<FiLayout aria-hidden="true" />}
              action={
                <Button variant="primary" size="large" onClick={handleAdd} aria-label="Add your first project">
                  <FiPlusCircle /> Add Your First Project
                </Button>
              }
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default PortfolioPage;
