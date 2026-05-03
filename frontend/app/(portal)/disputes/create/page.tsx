// @AI-HINT: Route page for dispute resolution wizard
import { Metadata } from 'next';
import DisputeWizard from '@/src/components/wizards/DisputeWizard';
import commonStyles from './CreateDispute.common.module.css';

export const metadata: Metadata = {
  title: 'File Dispute - MegiLance',
  description: 'Submit a dispute for resolution'
};

export default function CreateDisputePage({
  searchParams
}: {
  searchParams: { contract?: string; project?: string; party?: string }
}) {
  const contractId = searchParams.contract || '';
  const projectName = searchParams.project;
  const otherPartyName = searchParams.party;

  // Get user ID from session (replace with actual auth)
  const userId = 'current-user-id';

  if (!contractId) {
    return (
      <div className={commonStyles.loadingWrapper}>
        <h1>Contract ID Required</h1>
        <p>Please select a contract to file a dispute.</p>
      </div>
    );
  }

  return (
    <div className={commonStyles.pageContainer}>
      <DisputeWizard
        contractId={contractId}
        projectName={projectName}
        otherPartyName={otherPartyName}
        userId={userId}
      />
    </div>
  );
}
