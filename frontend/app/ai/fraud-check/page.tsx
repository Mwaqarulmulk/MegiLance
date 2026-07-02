import { Metadata } from 'next';
import FraudCheck from './FraudCheck';

export const metadata: Metadata = {
  title: 'AI Fraud & Scam Checker | MegiLance Tools',
  description: 'Protect yourself from freelance scams and fraudulent clients. Check job descriptions, client messages, and payment links for security risks and red flags.',
  keywords: ['fraud checker', 'scam checker', 'freelance scam check', 'online job safety finder', 'MegiLance tools'],
};

export default function FraudCheckPage() {
  return <FraudCheck />;
}
