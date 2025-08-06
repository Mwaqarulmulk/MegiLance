// @AI-HINT: This component displays a single, theme-aware portfolio item card. It leverages CSS variables defined in per-theme modules and scoped to the component's container, ensuring a consistent and maintainable presentation.
'use client';

import React from 'react';
import Image from 'next/image';

import Button from '@/app/components/Button/Button';
import { cn } from '@/lib/utils';
import commonStyles from './PortfolioItemCard.common.module.css';
import lightStyles from './PortfolioItemCard.light.module.css';
import darkStyles from './PortfolioItemCard.dark.module.css';

export interface PortfolioItemCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  onDelete: (id: number) => void;
}

const PortfolioItemCard: React.FC<PortfolioItemCardProps> = ({ id, title, description, imageUrl, projectUrl, onDelete }) => {
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.imageWrapper}>
        <Image src={imageUrl} alt={title} layout="fill" objectFit="cover" />
      </div>
      <div className={commonStyles.content}>
        <h3 className={commonStyles.title}>{title}</h3>
        <p className={commonStyles.description}>{description}</p>
      </div>
      <div className={commonStyles.footer}>
        {projectUrl && 
          <a href={projectUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">View Project</Button>
          </a>
        }
        <div className={commonStyles.actions}>
          <Button variant="secondary" size="small">Edit</Button>
          <Button variant="danger" size="small" onClick={() => onDelete(id)}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItemCard;
