// @AI-HINT: This is the Reviews page for freelancers to see client feedback. All styles are per-component only.
'use client';

import React from 'react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import commonStyles from './Reviews.common.module.css';
import lightStyles from './Reviews.light.module.css';

// @AI-HINT: This is the Reviews page for freelancers to see client feedback. All styles are per-component only. Now fully theme-switchable using global theme context.

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className={commonStyles.starRating}>
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={index < rating ? commonStyles.starFilled : commonStyles.starEmpty}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const Reviews: React.FC = () => {
  // Mock data for reviews
  const reviews = [
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

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div className={commonStyles.reviews}>
      <div className={commonStyles.container}>
        <header className={commonStyles.header}>
          <h1>My Reviews</h1>
          <p>See what clients are saying about your work.</p>
        </header>

        <div className={commonStyles.summaryCard}>
          <h2>Overall Rating</h2>
          <div className="Summary-rating">
            <span className="Summary-rating-score">{averageRating}</span>
            <StarRating rating={Math.round(parseFloat(averageRating))} />
          </div>
          <p>Based on {reviews.length} reviews</p>
        </div>

        <div className="Reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className="ReviewItem">
              <div className="ReviewItem-header">
                <UserAvatar name={review.clientName} />
                <div className="ReviewItem-info">
                  <strong>{review.clientName}</strong>
                  <span>for {review.projectName}</span>
                </div>
                <div className="ReviewItem-rating">
                  <StarRating rating={review.rating} />
                  <span className="ReviewItem-date">{review.date}</span>
                </div>
              </div>
              <p className="ReviewItem-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
