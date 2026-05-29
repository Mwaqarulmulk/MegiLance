"use client";
// @AI-HINT: Add payout method page - settings route for configuring withdrawal methods
import PayoutMethodWizard from '@/src/components/wizards/PayoutMethodWizard';
import commonStyles from './AddPayoutMethod.common.module.css';
import { useAuth } from '@/hooks/useAuth';

export default function AddPayoutMethodPage() {
  const { user } = useAuth();
  const userId = String(user?.id || '');

  return (
    <div className={commonStyles.pageContainer}>
      <PayoutMethodWizard userId={userId} />
    </div>
  );
}
