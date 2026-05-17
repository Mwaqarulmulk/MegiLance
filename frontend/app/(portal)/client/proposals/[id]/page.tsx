// @AI-HINT: Client proposal detail view with actions
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { proposalsApi } from '@/lib/api/projects';
import { portalApi } from '@/lib/api';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';
import Button from '@/app/components/atoms/Button/Button';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { Clock, DollarSign, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import common from './ProposalDetail.common.module.css';
import light from './ProposalDetail.light.module.css';
import dark from './ProposalDetail.dark.module.css';

interface ProposalDetailProps {
  params: {
    id: string;
  };
}

export default function ProposalDetail({ params }: ProposalDetailProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [themeStyles, setThemeStyles] = useState(light);
  const { showToast } = useToaster();
  
  const [proposal, setProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (resolvedTheme === 'dark') setThemeStyles(dark);
    else if (resolvedTheme === 'light') setThemeStyles(light);
  }, [resolvedTheme]);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const response = await portalApi.client.getProposals() as { success?: boolean; data?: any[] };
        if (response?.success && response?.data) {
          const found = response.data.find((p: any) => p.id.toString() === params.id);
          if (found) setProposal(found);
          else showToast('Proposal not found', 'error');
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load proposal', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [params.id]);

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      setActionLoading(action);
      let response: { success?: boolean; error?: { message?: string } } | null = null;
      if (action === 'accept') {
        response = await proposalsApi.accept(proposal.id) as any;
      } else {
        response = await proposalsApi.reject(proposal.id) as any;
      }
      
      if (response && response.success) {
          showToast(`Proposal ${action === 'accept' ? 'accepted' : 'rejected'} successfully`, 'success');
          router.push('/client/proposals');
        } else {
          throw new Error(response?.error?.message || `Failed to ${action} proposal`);
        }
      } catch (err: any) {
        showToast(err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (!resolvedTheme) return null;

  if (loading) {
    return (
      <div className={cn(common.container, themeStyles.container)}>
        <div className={common.loadingState}>
          <p>Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className={cn(common.container, themeStyles.container)}>
        <div className={cn(common.emptyState, themeStyles.emptyState)}>
          <h2>Proposal Not Found</h2>
          <Button variant="primary" onClick={() => router.push('/client/proposals')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={cn(common.container, themeStyles.container)}>
        <div className={common.header}>
          <div className={common.titleGroup}>
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1>Proposal Details</h1>
            <span className={cn(common.badge, themeStyles.badge)}>
              {proposal.status || 'Pending'}
            </span>
          </div>
        </div>

        <div className={cn(common.card, themeStyles.card)}>
          <div className={common.freelancerProfile}>
            <div className={cn(common.avatar, themeStyles.avatar)} />
            <div className={common.freelancerInfo}>
              <h3>{proposal.freelancer_name || 'Freelancer'}</h3>
              <p>Freelancer ID: {proposal.freelancer_id}</p>
            </div>
          </div>
          
          <div className={common.statsGrid}>
            <div className={common.statBox}>
              <span className={cn(common.statLabel, themeStyles.statLabel)}>Bid Amount</span>
              <span className={cn(common.statValue, themeStyles.statValue)}>
                <DollarSign className="w-5 h-5" />
                {proposal.bid_amount}
              </span>
            </div>
            <div className={common.statBox}>
              <span className={cn(common.statLabel, themeStyles.statLabel)}>Delivery Time</span>
              <span className={cn(common.statValue, themeStyles.statValue)}>
                <Clock className="w-5 h-5" />
                {proposal.estimated_duration}
              </span>
            </div>
          </div>
        </div>

        <div className={cn(common.card, themeStyles.card)}>
          <div className={common.section}>
            <h2>Cover Letter</h2>
            <div className={cn(common.coverLetter, themeStyles.coverLetter)}>
              {proposal.cover_letter || 'No cover letter provided.'}
            </div>
          </div>
        </div>

        {proposal.status !== 'accepted' && proposal.status !== 'rejected' && (
          <div className={common.actions}>
            <Button
              variant="success"
              onClick={() => handleAction('accept')}
              isLoading={actionLoading === 'accept'}
              disabled={actionLoading !== null}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Proposal
            </Button>
            <Button
              variant="danger"
              onClick={() => handleAction('reject')}
              isLoading={actionLoading === 'reject'}
              disabled={actionLoading !== null}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Proposal
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
