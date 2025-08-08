'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import commonStyles from './Reviews.common.module.css';
import lightStyles from './Reviews.light.module.css';
import darkStyles from './Reviews.dark.module.css';
import { Button } from '@/components/ui/button';

// @AI-HINT: This is the Reviews page for clients. It has been fully refactored to use
// theme-aware CSS modules with camelCase conventions and modern import paths.

const StarRatingInput = ({ styles }: { styles: any }) => {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);

  return (
    <div className={styles.starRatingInput}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={starValue <= (hover || rating) ? styles.starFilled : styles.starEmpty}
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const Reviews: React.FC = () => {
  const { theme } = useTheme();
  const styles = {
    ...commonStyles,
    ...(theme === 'dark' ? darkStyles : lightStyles),
  };

  const projectsToReview = [
    {
      id: 'p1',
      title: 'E-commerce Platform UI/UX',
      freelancerName: 'Mike R.',
    },
  ];

  return (
    <div className={`${styles.reviews} ${theme === 'dark' ? styles.reviewsDark : styles.reviewsLight}`}>
      <div className={styles.reviewsContainer}>
        <header className={styles.reviewsHeader}>
          <h1>Leave a Review</h1>
          <p>Share your experience to help other clients and recognize great work.</p>
        </header>

        {projectsToReview.map(project => (
          <div key={project.id} className={styles.reviewFormCard}>
            <h2>Review for &quot;{project.title}&quot;</h2>
            <p>How was your experience working with <strong>{project.freelancerName}</strong>?</p>
            <form className={styles.reviewForm}>
              <div className={styles.formGroup}>
                <label>Overall Rating</label>
                <StarRatingInput styles={styles} />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor={`comment-${project.id}`}>Public Feedback</label>
                <textarea
                  id={`comment-${project.id}`}
                  className={styles.textarea}
                  rows={6}
                  placeholder={`Describe your experience... (e.g., communication, quality of work, deadlines)`}
                ></textarea>
              </div>
              <Button type="submit">Submit Review</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
