// @AI-HINT: This is the Reviews page for clients to leave and view feedback. All styles are per-component only.
'use client';

import React from 'react';

import Button from '@/app/components/Button/Button';
import './Reviews.common.css';
import './Reviews.light.css';
import './Reviews.dark.css';

interface ReviewsProps {
  theme?: 'light' | 'dark';
}

const StarRatingInput = () => {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  return (
    <div className="StarRatingInput">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={starValue}
            className={starValue <= (hover || rating) ? 'star-filled' : 'star-empty'}
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

const Reviews: React.FC<ReviewsProps> = ({ theme = 'light' }) => {
  // Mock data for projects needing reviews
  const projectsToReview = [
    {
      id: 'p1',
      title: 'E-commerce Platform UI/UX',
      freelancerName: 'Mike R.',
    },
  ];

  return (
    <div className={`Reviews Reviews--${theme}`}>
      <div className="Reviews-container">
        <header className="Reviews-header">
          <h1>Leave a Review</h1>
          <p>Share your experience to help other clients and recognize great work.</p>
        </header>

        {projectsToReview.map(project => (
          <div key={project.id} className={`ReviewForm-card ReviewForm-card--${theme}`}>
            <h2>Review for &quot;{project.title}&quot;</h2>
            <p>How was your experience working with <strong>{project.freelancerName}</strong>?</p>
            <form className="Review-form">
              <div className="Form-group">
                <label>Overall Rating</label>
                <StarRatingInput />
              </div>
              <div className="Form-group">
                <label htmlFor={`comment-${project.id}`}>Public Feedback</label>
                <textarea
                  id={`comment-${project.id}`}
                  className={`Textarea Textarea--${theme}`}
                  rows={6}
                  placeholder={`Describe your experience... (e.g., communication, quality of work, deadlines)`}
                ></textarea>
              </div>
              <Button theme={theme} variant="primary" type="submit">Submit Review</Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
