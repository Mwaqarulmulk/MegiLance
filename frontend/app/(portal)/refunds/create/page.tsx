// @AI-HINT: Route page for refund request wizard
import RefundRequestWizard from '@/src/components/wizards/RefundRequestWizard';

export default function RefundRequestPage({
  searchParams
}: {
  searchParams: { paymentId: string; amount: string; userId: string }
}) {
  return (
    <RefundRequestWizard
      paymentId={searchParams.paymentId}
      originalAmount={parseFloat(searchParams.amount)}
      userId={searchParams.userId}
    />
  );
}
