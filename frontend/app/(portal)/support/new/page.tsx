// @AI-HINT: Route page for support ticket wizard
import SupportTicketWizard from '@/src/components/wizards/SupportTicketWizard';

export default function SupportTicketPage({
  searchParams
}: {
  searchParams: { userId: string; userEmail: string }
}) {
  return (
    <SupportTicketWizard
      userId={searchParams.userId}
      userEmail={searchParams.userEmail}
    />
  );
}
