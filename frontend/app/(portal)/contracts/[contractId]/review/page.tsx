// @AI-HINT: Review submission page
import ReviewForm from '@/app/components/Review/ReviewForm/ReviewForm';

export const metadata = {
  title: 'Write a Review - MegiLance',
  description: 'Share your experience',
};

export default function ReviewPage({ 
  params,
  searchParams 
}: { 
  params: { contractId: string };
  searchParams: { revieweeId: string; revieweeName: string; projectTitle: string };
}) {
  return (
    <ReviewForm
      contractId={params.contractId}
      revieweeId={searchParams.revieweeId}
      revieweeName={searchParams.revieweeName}
      projectTitle={searchParams.projectTitle}
    />
  );
}
