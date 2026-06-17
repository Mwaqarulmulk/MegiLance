// @AI-HINT: Admin Wallet page wrapper — lazy-loads the full wallet component
'use client';

import dynamic from 'next/dynamic';
import Loading from '@/app/components/atoms/Loading/Loading';

const AdminWallet = dynamic(() => import('./AdminWallet'), {
  loading: () => <Loading text="Loading wallet..." />,
  ssr: false,
});

export default function AdminWalletPage() {
  return <AdminWallet />;
}
