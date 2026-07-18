import { Metadata } from 'next';
import InvoiceGenerator from './InvoiceGenerator';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free AI Invoice Generator & Freelance Billing Templates',
  description: 'Generate freelance invoice templates and freelance billing invoice templates instantly. MegiLance is the ultimate free invoice creator app for self-employed professionals.',
  path: '/ai/invoice-generator',
  keywords: ['freelance invoice template', 'freelance billing invoice template', 'free invoice creator app', 'invoice generator', 'freelance invoice', 'AI invoice generator'],
});

export default function InvoiceGeneratorPage() {
  return <InvoiceGenerator />;
}
