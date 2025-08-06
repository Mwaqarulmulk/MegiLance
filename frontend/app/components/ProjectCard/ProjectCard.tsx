// @AI-HINT: This is the ProjectCard component for displaying project summaries in lists and dashboards. All styles are per-component only. See ProjectCard.common.css, ProjectCard.light.css, and ProjectCard.dark.css for theming.
import React from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Card from '../Card/Card';
import Button from '../Button/Button';
import commonStyles from './ProjectCard.common.module.css';
import lightStyles from './ProjectCard.light.module.css';
import darkStyles from './ProjectCard.dark.module.css';

// @AI-HINT: This is the ProjectCard component for displaying project summaries. It's fully theme-aware and uses CSS modules.

export interface ProjectCardProps {
  title: string;
  clientName: string;
  budget: string;
  postedTime: string;
  tags: string[];
  onView?: () => void;
  className?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ title, clientName, budget, postedTime, tags, onView, className }) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <Card className={cn(commonStyles.projectCard, className)}>
      <div className={commonStyles.header}>
        <h3 className={cn(commonStyles.title, themeStyles.title)}>{title}</h3>
        <span className={cn(commonStyles.postedTime, themeStyles.postedTime)}>{postedTime}</span>
      </div>
      <div className={cn(commonStyles.infoRow, themeStyles.infoRow)}>
        <span className={commonStyles.client}>Client: {clientName}</span>
        <span className={cn(commonStyles.budget, themeStyles.budget)}>{budget}</span>
      </div>
      <div className={commonStyles.tagsRow}>
        {tags.map((tag) => (
          <span key={tag} className={cn(commonStyles.tag, themeStyles.tag)}>{tag}</span>
        ))}
      </div>
      <Button variant="secondary" size="small" onClick={onView} className="w-full mt-2">View Details</Button>
    </Card>
  );
};

export default ProjectCard;
