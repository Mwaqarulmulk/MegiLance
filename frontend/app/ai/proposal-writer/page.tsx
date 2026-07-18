import { Metadata } from 'next';
import ProposalWriter from './ProposalWriter';
import { buildMeta } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Best AI for Proposal Writing | Fast Generative Proposal Writer',
  description: 'Write winning bids instantly with the best AI for proposal writing and best generative AI for fast proposal writing. Tailor bid tone and skills match on MegiLance.',
  path: '/ai/proposal-writer',
  keywords: ['best ai for proposal writing', 'best generative ai for fast proposal writing', 'proposal writer', 'AI proposal generator', 'freelance bid proposal creator'],
});

export default function ProposalWriterPage() {
  return <ProposalWriter />;
}
