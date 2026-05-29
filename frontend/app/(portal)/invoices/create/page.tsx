"use client";
// @AI-HINT: Route page for invoice creation wizard
import InvoiceWizard from '@/src/components/wizards/InvoiceWizard';
import commonStyles from './CreateInvoice.common.module.css';
import { useAuth } from '@/hooks/useAuth';

export default function CreateInvoicePage() {
  const { user } = useAuth();
  const userId = String(user?.id || '');

  return (
    <div className={commonStyles.pageContainer}>
      <InvoiceWizard userId={userId} />
    </div>
  );
}
