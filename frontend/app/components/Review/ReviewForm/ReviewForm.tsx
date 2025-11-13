// @AI-HINT: Review and rating system - multi-criteria rating with verification
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { FaStar, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';

import commonStyles from './ReviewForm.common.module.css';
import lightStyles from './ReviewForm.light.module.css';
import darkStyles from './ReviewForm.dark.module.css';

interface ReviewFormProps {
  contractId: string;
  revieweeId: string;
  revieweeName: string;
  projectTitle: string;
  onSubmit?: () => void;
}

interface ReviewData {
  rating: number;
  criteria: {
    quality: number;
    communication: number;
    timeliness: number;
    professionalism: number;
  };
  comment: string;
  wouldRecommend: boolean;
  isPublic: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  contractId,
  revieweeId,
  revieweeName,
  projectTitle,
  onSubmit,
}) => {
  const { resolvedTheme } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [hoveredCriteria, setHoveredCriteria] = useState<{ [key: string]: number | null }>({});

  const [review, setReview] = useState<ReviewData>({
    rating: 0,
    criteria: {
      quality: 0,
      communication: 0,
      timeliness: 0,
      professionalism: 0,
    },
    comment: '',
    wouldRecommend: true,
    isPublic: true,
  });

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    header: cn(commonStyles.header, themeStyles.header),
    title: cn(commonStyles.title, themeStyles.title),
    subtitle: cn(commonStyles.subtitle, themeStyles.subtitle),
    section: cn(commonStyles.section, themeStyles.section),
    sectionTitle: cn(commonStyles.sectionTitle, themeStyles.sectionTitle),
    ratingStars: cn(commonStyles.ratingStars, themeStyles.ratingStars),
    star: cn(commonStyles.star, themeStyles.star),
    criteriaGrid: cn(commonStyles.criteriaGrid, themeStyles.criteriaGrid),
    criteriaItem: cn(commonStyles.criteriaItem, themeStyles.criteriaItem),
    textarea: cn(commonStyles.textarea, themeStyles.textarea),
    checkbox: cn(commonStyles.checkbox, themeStyles.checkbox),
    actions: cn(commonStyles.actions, themeStyles.actions),
    successMessage: cn(commonStyles.successMessage, themeStyles.successMessage),
    charCount: cn(commonStyles.charCount, themeStyles.charCount),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (review.rating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    if (review.comment.trim().length < 50) {
      alert('Please write at least 50 characters in your review');
      return;
    }

    const allCriteriaRated = Object.values(review.criteria).every(rating => rating > 0);
    if (!allCriteriaRated) {
      alert('Please rate all criteria');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          revieweeId,
          ...review,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        onSubmit?.();
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (
    currentRating: number,
    onRate: (rating: number) => void,
    hoveredValue: number | null,
    onHover: (rating: number | null) => void
  ) => {
    return (
      <div className={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map(rating => (
          <button
            key={rating}
            type="button"
            className={styles.star}
            onMouseEnter={() => onHover(rating)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onRate(rating)}
            aria-label={`Rate ${rating} stars`}
          >
            <FaStar
              className={
                rating <= (hoveredValue || currentRating)
                  ? 'text-yellow-500'
                  : 'text-gray-300'
              }
              size={32}
            />
          </button>
        ))}
        <span className="ml-3 text-lg font-semibold">
          {hoveredValue || currentRating || 0}/5
        </span>
      </div>
    );
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <FaCheckCircle size={64} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
          <p>Thank you for your feedback. Your review helps build trust in our community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Write a Review</h1>
        <p className={styles.subtitle}>
          Review your experience working with <strong>{revieweeName}</strong> on <em>{projectTitle}</em>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Overall Rating</h2>
          {renderStars(
            review.rating,
            (rating) => setReview({ ...review, rating }),
            hoveredRating,
            setHoveredRating
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Detailed Ratings</h2>
          <div className={styles.criteriaGrid}>
            {Object.entries({
              quality: 'Work Quality',
              communication: 'Communication',
              timeliness: 'Timeliness',
              professionalism: 'Professionalism',
            }).map(([key, label]) => (
              <div key={key} className={styles.criteriaItem}>
                <label className="font-semibold mb-2">{label}</label>
                {renderStars(
                  review.criteria[key as keyof typeof review.criteria],
                  (rating) =>
                    setReview({
                      ...review,
                      criteria: { ...review.criteria, [key]: rating },
                    }),
                  hoveredCriteria[key] || null,
                  (value) => setHoveredCriteria({ ...hoveredCriteria, [key]: value })
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Written Review</h2>
          <textarea
            className={styles.textarea}
            rows={8}
            placeholder="Share details about your experience working together. What went well? What could be improved? (Minimum 50 characters)"
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            maxLength={2000}
          />
          <div className={styles.charCount}>
            {review.comment.length}/2000 characters
            {review.comment.length < 50 && ` (${50 - review.comment.length} more needed)`}
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={review.wouldRecommend}
              onChange={(e) => setReview({ ...review, wouldRecommend: e.target.checked })}
            />
            <span>I would recommend this {revieweeName.includes('freelancer') ? 'freelancer' : 'client'} to others</span>
          </label>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={review.isPublic}
              onChange={(e) => setReview({ ...review, isPublic: e.target.checked })}
            />
            <span>Make this review public (visible on their profile)</span>
          </label>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            type="submit"
            isLoading={submitting}
            disabled={submitting}
          >
            <FaPaperPlane className="mr-2" />
            Submit Review
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
