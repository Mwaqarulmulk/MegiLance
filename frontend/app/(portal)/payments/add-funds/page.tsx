// @AI-HINT: Add funds page - route for adding money to MegiLance wallet
'use client';

import { useAuth } from '@/hooks/useAuth';
import PaymentWizard from '@/src/components/wizards/PaymentWizard';
import commonStyles from './AddFunds.common.module.css';

export default function AddFundsPage() {
  const { user } = useAuth();
  const userId = user?.id ? String(user.id) : '';

  if (!userId) return null;

  return (
    <div className={commonStyles.pageContainer}>
      <PaymentWizard 
        flowType="addFunds"
        userId={userId}
      />
    </div>
  );
}
