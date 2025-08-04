// @AI-HINT: This page allows freelancers to manage and display their portfolio of work.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import PortfolioItemCard, { PortfolioItemCardProps } from '@/app/components/Freelancer/PortfolioItemCard/PortfolioItemCard';
import './PortfolioPage.common.css';
import './PortfolioPage.light.css';
import './PortfolioPage.dark.css';

const mockPortfolioItems: Omit<PortfolioItemCardProps, 'onDelete'>[] = [
  {
    id: 1,
    title: 'DeFi Yield Aggregator Dashboard',
    description: 'A comprehensive dashboard for tracking and managing assets across multiple DeFi protocols.',
    imageUrl: '/images/portfolio/defi-dashboard.jpg',
    projectUrl: '#',
  },
  {
    id: 2,
    title: 'NFT Marketplace UI/UX',
    description: 'Designed a user-friendly interface for a next-generation NFT marketplace on the Solana blockchain.',
    imageUrl: '/images/portfolio/nft-marketplace.jpg',
    projectUrl: '#',
  },
  {
    id: 3,
    title: 'DAO Governance Token Launch',
    description: 'Developed the smart contracts and launch strategy for a decentralized autonomous organization.',
    imageUrl: '/images/portfolio/dao-launch.jpg',
  },
];

const PortfolioPage: React.FC = () => {
  const { theme } = useTheme();
  const [items, setItems] = useState(mockPortfolioItems);

  const handleDelete = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className={`PortfolioPage-container PortfolioPage-container--${theme}`}>
      <header className="PortfolioPage-header">
        <div>
          <h1 className="PortfolioPage-title">Your Portfolio</h1>
          <p className="PortfolioPage-subtitle">Showcase your best work to attract clients.</p>
        </div>
        <Button theme={theme} variant="primary">Add New Item</Button>
      </header>

      <main className="PortfolioPage-main">
        {items.length > 0 ? (
          <div className="PortfolioPage-grid">
            {items.map(item => (
              <PortfolioItemCard key={item.id} {...item} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className={`PortfolioPage-empty-state PortfolioPage-empty-state--${theme}`}>
            <h2 className="PortfolioPage-empty-title">Your portfolio is empty</h2>
            <p>Add your first portfolio item to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PortfolioPage;
