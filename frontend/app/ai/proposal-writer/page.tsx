import { Metadata } from 'next';
import ProposalWriter from './ProposalWriter';

export const metadata: Metadata = {
  title: 'AI Proposal Writer for Freelancers | MegiLance Tools',
  description: 'Write winning freelance proposals in seconds with AI. Customize tone of voice, project parameters, and match client skills requirements.',
  keywords: ['proposal writer', 'AI proposal generator', 'freelance bid proposal creator', 'how to write upwork proposal', 'MegiLance tools'],
};

export default function ProposalWriterPage() {
  return <ProposalWriter />;
}
