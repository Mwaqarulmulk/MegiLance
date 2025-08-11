// @AI-HINT: This is a display-only component that renders a star rating out of 5.
'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

import commonStyles from './StarRating.common.module.css';
import lightStyles from './StarRating.light.module.css';
import darkStyles from './StarRating.dark.module.css';

export interface StarRatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  totalStars = 5,
  className,
}) => {
  const { theme } = useTheme();
  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.starRating, className)}>
      {[...Array(totalStars)].map((_, index) => {
        const starIsFilled = index < rating;
        return (
          <Star
            key={index}
            className={cn(
              commonStyles.star,
              themeStyles.star,
              starIsFilled ? cn(commonStyles.filled, themeStyles.filled) : cn(commonStyles.empty, themeStyles.empty)
            )}
            size={16}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
