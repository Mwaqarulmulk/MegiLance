// @AI-HINT: Wallet page with comprehensive balance, transactions, deposits, and withdrawals
import WalletClient from './WalletClient';

export const metadata = {
  title: 'Wallet | MegiLance',
  description: 'Manage your wallet balance, view transactions, and handle deposits and withdrawals.',
};

export default function WalletPage() {
  return <WalletClient />;
}
