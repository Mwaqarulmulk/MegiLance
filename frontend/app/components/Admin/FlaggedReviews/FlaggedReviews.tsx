// @AI-HINT: This component provides a fully theme-aware interface for admins to moderate flagged reviews. It uses per-component CSS modules and the cn utility for robust, maintainable styling.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/Button/Button';
import Badge from '@/app/components/Badge/Badge';
import Card from '@/app/components/Card/Card';
import Input from '@/app/components/Input/Input';
import Select from '@/app/components/Select/Select';
import UserAvatar from '@/app/components/UserAvatar/UserAvatar';
import StarRating from '@/app/components/StarRating/StarRating';
import { ThumbsUp, ThumbsDown, Search, MessageSquareQuote, ListFilter } from 'lucide-react';

import baseStyles from './FlaggedReviews.base.module.css';
import lightStyles from './FlaggedReviews.light.module.css';
import darkStyles from './FlaggedReviews.dark.module.css';

interface FlaggedReview {
  id: string;
  reviewer: { name: string; avatarUrl: string; };
  reviewee: { name: string; avatarUrl: string; };
  rating: number;
  content: string;
  reason: string;
  dateFlagged: string;
  status: 'Pending' | 'Kept' | 'Removed';
}

const mockFlaggedReviews: FlaggedReview[] = [
  { id: 'rev_001', reviewer: { name: 'Client X', avatarUrl: '/avatars/client_x.png' }, reviewee: { name: 'Freelancer Y', avatarUrl: '/avatars/freelancer_y.png' }, rating: 1, content: 'This freelancer is a scammer, do not hire!', reason: 'Inappropriate Language', dateFlagged: '2025-08-08', status: 'Pending' },
  { id: 'rev_002', reviewer: { name: 'Freelancer A', avatarUrl: '/avatars/freelancer_a.png' }, reviewee: { name: 'Client B', avatarUrl: '/avatars/client_b.png' }, rating: 2, content: 'The client was unresponsive and changed requirements last minute.', reason: 'Unfair Review', dateFlagged: '2025-08-07', status: 'Pending' },
  { id: 'rev_003', reviewer: { name: 'Client C', avatarUrl: '/avatars/client_c.png' }, reviewee: { name: 'Freelancer D', avatarUrl: '/avatars/freelancer_d.png' }, rating: 5, content: 'Check out my website for great deals! my-spam-site.com', reason: 'Spam', dateFlagged: '2025-08-06', status: 'Removed' },
  { id: 'rev_004', reviewer: { name: 'Client Z', avatarUrl: '/avatars/client_z.png' }, reviewee: { name: 'Freelancer W', avatarUrl: '/avatars/freelancer_w.png' }, rating: 4, content: 'Great work, but communication could be better.', reason: 'Unfair Review', dateFlagged: '2025-08-05', status: 'Kept' },
];

const FlaggedReviews: React.FC = () => {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState(mockFlaggedReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');

  const themeStyles = theme === 'dark' ? darkStyles : lightStyles;

  const handleAction = (id: string, newStatus: 'Kept' | 'Removed') => {
    setReviews(reviews.map(review => (review.id === id ? { ...review, status: newStatus } : review)));
  };

  const filteredReviews = reviews
    .filter(review => statusFilter === 'All' || review.status === statusFilter)
    .filter(review => 
      review.reviewer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getStatusBadgeVariant = (status: FlaggedReview['status']) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Kept': return 'success';
      case 'Removed': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className={cn(baseStyles.container, themeStyles.container)}>
      <header className={baseStyles.header}>
        <h2 className={cn(baseStyles.title, themeStyles.title)}>Flagged Review Queue</h2>
        <p className={cn(baseStyles.description, themeStyles.description)}>
          Showing {filteredReviews.length} of {reviews.length} flagged reviews.
        </p>
      </header>

      <div className={cn(baseStyles.filterToolbar, themeStyles.filterToolbar)}>
        <Input
          id="search-reviews"
          placeholder="Search by reviewer or reviewee..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          iconBefore={<Search size={16} />}
        />
        <Select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Kept', label: 'Kept' },
            { value: 'Removed', label: 'Removed' },
          ]}
        />
      </div>

      <div className={baseStyles.reviewList}>
        {filteredReviews.map(review => (
          <Card key={review.id} className={cn(baseStyles.reviewCard, themeStyles.reviewCard)}>
            <div className={baseStyles.cardHeader}>
              <div className={baseStyles.userInfo}>
                <UserAvatar src={review.reviewer.avatarUrl} name={review.reviewer.name} size={40} />
                <div className={baseStyles.userMeta}>
                  <span className={baseStyles.userName}>{review.reviewer.name}</span>
                  <span className={baseStyles.userRole}>Reviewer</span>
                </div>
              </div>
              <div className={baseStyles.userInfo}>
                <UserAvatar src={review.reviewee.avatarUrl} name={review.reviewee.name} size={40} />
                <div className={baseStyles.userMeta}>
                  <span className={baseStyles.userName}>{review.reviewee.name}</span>
                  <span className={baseStyles.userRole}>Reviewee</span>
                </div>
              </div>
            </div>

            <div className={baseStyles.reviewContent}>
              <MessageSquareQuote className={cn(baseStyles.quoteIcon, themeStyles.quoteIcon)} size={20} />
              <p>{review.content}</p>
            </div>

            <div className={baseStyles.reviewDetails}>
              <StarRating rating={review.rating} />
              <Badge variant="default">Reason: {review.reason}</Badge>
            </div>

            <footer className={baseStyles.cardFooter}>
              <span className={cn(baseStyles.date, themeStyles.date)}>Flagged: {review.dateFlagged}</span>
              {review.status === 'Pending' ? (
                <div className={baseStyles.actions}>
                  <Button variant="success" size="small" onClick={() => handleAction(review.id, 'Kept')}>
                    <ThumbsUp size={14} /> Keep Review
                  </Button>
                  <Button variant="danger" size="small" onClick={() => handleAction(review.id, 'Removed')}>
                    <ThumbsDown size={14} /> Remove Review
                  </Button>
                </div>
              ) : (
                <Badge variant={getStatusBadgeVariant(review.status)}>{review.status}</Badge>
              )}
            </footer>
          </Card>
        ))}
        {filteredReviews.length === 0 && (
          <div className={cn(baseStyles.emptyState, themeStyles.emptyState)}>
            <ListFilter size={48} />
            <h3>No Matching Reviews</h3>
            <p>Adjust your filters or clear the search to see more reviews.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlaggedReviews;
