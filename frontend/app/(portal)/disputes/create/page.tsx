"use client";
// @AI-HINT: Route page for dispute resolution wizard
import { useSearchParams } from 'next/navigation';
import DisputeWizard from '@/src/components/wizards/DisputeWizard';
import commonStyles from './CreateDispute.common.module.css';
import { useAuth } from '@/hooks/useAuth';

export default function CreateDisputePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const contractId = searchParams.get('contract') || '';
  const projectName = searchParams.get('project') || undefined;
  const otherPartyName = searchParams.get('party') || undefined;
  const userId = String(user?.id || '');

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
