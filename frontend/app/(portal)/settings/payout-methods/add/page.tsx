// @AI-HINT: Add payout method page - settings route for configuring withdrawal methods
import { Metadata } from 'next';
import PayoutMethodWizard from '@/src/components/wizards/PayoutMethodWizard';
import commonStyles from './AddPayoutMethod.common.module.css';

export const metadata: Metadata = {
  title: 'Add Payout Method - MegiLance',
  description: 'Configure a new payout method for receiving your earnings'
};

export default function AddPayoutMethodPage() {
  // In a real app, get user ID from session/auth
  const userId = 'current-user-id'; // Replace with actual auth

  return (
    <div className={commonStyles.pageContainer}>
      <PayoutMethodWizard userId={userId} />
    </div>
  );
}
