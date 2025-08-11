// @AI-HINT: This is the Reviews page for freelancers to see client feedback. It has been fully refactored for a premium, theme-aware design.
'use client';

import React, { useMemo } from 'react';
import { useTheme } from 'next-themes';

import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import { cn } from '@/lib/utils';
import commonStyles from './ReviewsPage.common.module.css';
import lightStyles from './ReviewsPage.light.module.css';
import darkStyles from './ReviewsPage.dark.module.css';

// Mock data for reviews
const reviewsData = [
  {
    clientName: 'Innovate Inc.',
    projectName: 'AI Chatbot Integration',
    rating: 5,
    comment: 'Exceptional work! Delivered ahead of schedule and the chatbot performance is flawless. Highly recommend.',
    date: '2025-08-10',
  },
  {
    clientName: 'DataDriven Co.',
    projectName: 'Data Analytics Dashboard',
    rating: 5,
    comment: 'A true professional. The dashboard is intuitive, powerful, and has already provided key insights for our team. Excellent communication throughout the project.',
    date: '2025-07-20',
  },
  {
    clientName: 'Shopify Plus Experts',
    projectName: 'E-commerce Platform UI/UX',
    rating: 4,
    comment: 'Great design skills and very responsive to feedback. There were a few minor delays, but the end result was fantastic.',
    date: '2025-07-05',
  },
];

const StarRating: React.FC<{ rating: number; styles: any }> = ({ rating, styles }) => {
  return (
    <div
      className={cn(styles.starRating)}
      role="img"
      aria-label={`${rating} out of 5 stars`}
      title={`${rating} out of 5 stars`}
    >
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={cn(styles.star, index < rating ? '' : styles.empty)}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewsPage: React.FC = () => {
  const { theme } = useTheme();
  const styles = useMemo(() => {
    const themeStyles = theme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [theme]);

  const averageRating = (reviewsData.reduce((acc, r) => acc + r.rating, 0) / reviewsData.length).toFixed(1);

  return (
    <div className={cn(styles.pageWrapper)}>
      <header className={cn(styles.header)}>
        <h1>My Reviews</h1>
        <p>See what clients are saying about your work.</p>
      </header>

      <main className={cn(styles.mainGrid)}>
        <span className={cn(styles.srOnly)} aria-live="polite">
          {`Average rating ${averageRating} out of 5 based on ${reviewsData.length} review${reviewsData.length === 1 ? '' : 's'}.`}
        </span>
        <aside>
          <div className={cn(styles.summaryCard)} role="region" aria-label="Rating summary" title="Rating summary">
            <h2>Overall Rating</h2>
            <div className={cn(styles.summaryRating)}>
              <span className={cn(styles.summaryRatingScore)}>{averageRating}</span>
              <StarRating rating={Math.round(parseFloat(averageRating))} styles={styles} />
            </div>
            <p className={cn(styles.reviewCount)}>Based on {reviewsData.length} reviews</p>
          </div>
        </aside>

        <section className={cn(styles.reviewsList)} role="region" aria-label="Client reviews" title="Client reviews">
          {reviewsData.map((review, index) => (
            <div key={index} className={cn(styles.reviewItem)}>
              <div className={cn(styles.reviewItemHeader)}>
                <UserAvatar name={review.clientName} />
                <div className={cn(styles.reviewItemInfo)}>
                  <span className={cn(styles.clientName)}>{review.clientName}</span>
                  <span className={cn(styles.projectName)}>for {review.projectName}</span>
                </div>
                <div className={cn(styles.reviewItemRating)}>
                  <StarRating rating={review.rating} styles={styles} />
                  <span className={cn(styles.date)}>{review.date}</span>
                </div>
              </div>
              <p className={cn(styles.reviewItemComment)}>{review.comment}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ReviewsPage;

