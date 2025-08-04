// @AI-HINT: This component displays a single item in a freelancer's portfolio, with edit/delete controls.
'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import './PortfolioItemCard.common.css';
import './PortfolioItemCard.light.css';
import './PortfolioItemCard.dark.css';

export interface PortfolioItemCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  onDelete: (id: number) => void;
}

const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ id, title, description, imageUrl, projectUrl, onDelete }) => {
  const { theme } = useTheme();

  return (
    <div className={`PortfolioItemCard-container PortfolioItemCard-container--${theme}`}>
      <div className="PortfolioItemCard-image-wrapper">
        <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" />
      </div>
      <div className="PortfolioItemCard-content">
        <h3 className="PortfolioItemCard-title">{title}</h3>
        <p className="PortfolioItemCard-description">{description}</p>
      </div>
      <div className="PortfolioItemCard-footer">
        {projectUrl && 
          <a href={projectUrl} target="_blank" rel="noopener noreferrer">
            <Button theme={theme} variant="secondary">View Project</Button>
          </a>
        }
        <div className="PortfolioItemCard-actions">
          <Button theme={theme} variant="secondary" size="small">Edit</Button>
          <Button theme={theme} variant="danger" size="small" onClick={() => onDelete(id)}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItemCard;
