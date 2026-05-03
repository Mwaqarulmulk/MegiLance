// @AI-HINT: Workroom page for contract collaboration - Kanban, Files, Discussions
import type { Metadata } from 'next';
import WorkroomClient from './WorkroomClient';

interface PageProps {
  params: Promise<{ contractId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Workroom | Contract #${resolvedParams.contractId} | MegiLance`,
    description: 'Collaborate on your project with Kanban boards, file sharing, and discussions.',
  };
}

export default async function WorkroomPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <WorkroomClient contractId={resolvedParams.contractId} />;
}
