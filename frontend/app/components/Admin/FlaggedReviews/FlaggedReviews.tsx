// @AI-HINT: This component allows admins to moderate user reviews that have been flagged as inappropriate or spam.
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import commonStyles from './FlaggedReviews.common.module.css';
import lightStyles from './FlaggedReviews.light.module.css';
import darkStyles from './FlaggedReviews.dark.module.css';

interface FlaggedReview {
  id: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  content: string;
  reason: string; // Reason for the flag
  dateFlagged: string;
  status: 'Pending' | 'Kept' | 'Removed';
}

const mockFlaggedReviews: FlaggedReview[] = [
  { id: 'rev_001', reviewer: 'client_x', reviewee: 'freelancer_y', rating: 1, content: 'This freelancer is a scammer, do not hire!', reason: 'Inappropriate language', dateFlagged: '2025-08-08', status: 'Pending' },
  { id: 'rev_002', reviewer: 'freelancer_a', reviewee: 'client_b', rating: 2, content: 'The client was unresponsive and changed requirements last minute.', reason: 'Unfair review', dateFlagged: '2025-08-07', status: 'Pending' },
  { id: 'rev_003', reviewer: 'client_c', reviewee: 'freelancer_d', rating: 5, content: 'Check out my website for great deals! my-spam-site.com', reason: 'Spam', dateFlagged: '2025-08-06', status: 'Removed' },
];

const FlaggedReviews: React.FC = () => {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState(mockFlaggedReviews);

  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const handleAction = (id: string, newStatus: 'Kept' | 'Removed') => {
    setReviews(reviews.map(review => (review.id === id ? { ...review, status: newStatus } : review)));
  };

  const pendingReviews = reviews.filter(review => review.status === 'Pending');

  return (
    <div className={styles.flaggedReviewsContainer}>
      <h2 className={styles.flaggedReviewsTitle}>Flagged Review Queue</h2>
      <div className={styles.flaggedReviewsList}>
        {pendingReviews.length > 0 ? pendingReviews.map(review => (
          <div key={review.id} className={styles.flaggedReviewsItem}>
            <div className={styles.flaggedReviewsItemHeader}>
              <div>
                <strong>{review.reviewer}</strong> reviewed <strong>{review.reviewee}</strong>
                <span className={styles.flaggedReviewsRating}>{' ★'.repeat(review.rating)}{' ☆'.repeat(5 - review.rating)}</span>
              </div>
              <Badge variant="warning">{review.reason}</Badge>
            </div>
            <p className={styles.flaggedReviewsContent}>&ldquo;{review.content}&rdquo;</p>
            <div className={styles.flaggedReviewsActions}>
              <small>Flagged on: {review.dateFlagged}</small>
              <div>
                <Button variant="secondary" size="small" onClick={() => handleAction(review.id, 'Kept')}>Keep Review</Button>
                <Button variant="danger" size="small" onClick={() => handleAction(review.id, 'Removed')}>Remove Review</Button>
              </div>
            </div>
          </div>
        )) : (
          <p className={styles.flaggedReviewsEmpty}>No reviews are currently pending moderation.</p>
        )}
      </div>
    </div>
  );
};

export default FlaggedReviews;
