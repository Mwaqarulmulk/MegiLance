import { Metadata } from 'next';
import InvoiceGenerator from './InvoiceGenerator';

export const metadata: Metadata = {
  title: 'Free AI Invoice Generator | MegiLance Tools',
  description: 'Create professional, branded invoices instantly with our free AI-powered invoice generator. Supports multiple currencies, custom taxes, and client formatting.',
  keywords: ['invoice generator', 'freelance invoice', 'free invoice creator', 'AI invoice generator', 'MegiLance tools'],
};

export default function InvoiceGeneratorPage() {
  return <InvoiceGenerator />;
}
