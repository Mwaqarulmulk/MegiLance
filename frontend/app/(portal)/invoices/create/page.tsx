// @AI-HINT: Route page for invoice creation wizard
import { Metadata } from 'next';
import InvoiceWizard from '@/src/components/wizards/InvoiceWizard';
import commonStyles from './CreateInvoice.common.module.css';

export const metadata: Metadata = {
  title: 'Create Invoice - MegiLance',
  description: 'Create and send a new invoice'
};

export default function CreateInvoicePage() {
  // Get user ID from session (replace with actual auth)
  const userId = 'current-user-id';

  return (
    <div className={commonStyles.pageContainer}>
      <InvoiceWizard userId={userId} />
    </div>
  );
}
