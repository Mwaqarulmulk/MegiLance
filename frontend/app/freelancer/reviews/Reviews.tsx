// @AI-HINT: This is the Reviews page for freelancers to see client feedback. All styles are per-component only.
'use client';

import React from 'react';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import './Reviews.common.css';
import './Reviews.light.css';
import './Reviews.dark.css';

interface ReviewsProps {
  theme?: 'light' | 'dark';
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="StarRating">
      {[...Array(5)].map((_, index) => (
        <span key={index} className={index < rating ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  );
};

const Reviews: React.FC<ReviewsProps> = ({ theme = 'light' }) => {
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
    <div className={`Reviews Reviews--${theme}`}>
      <div className="Reviews-container">
        <header className="Reviews-header">
          <h1>My Reviews</h1>
          <p>See what clients are saying about your work.</p>
        </header>

        <div className={`Reviews-summary-card Reviews-summary-card--${theme}`}>
          <h2>Overall Rating</h2>
          <div className="Summary-rating">
            <span className="Summary-rating-score">{averageRating}</span>
            <StarRating rating={Math.round(parseFloat(averageRating))} />
          </div>
          <p>Based on {reviews.length} reviews</p>
        </div>

        <div className="Reviews-list">
          {reviews.map((review, index) => (
            <div key={index} className={`ReviewItem ReviewItem--${theme}`}>
              <div className="ReviewItem-header">
                <UserAvatar theme={theme} name={review.clientName} />
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
