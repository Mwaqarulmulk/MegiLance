// @AI-HINT: User page to view dispute details
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Loader2, FileText, Info, Upload } from 'lucide-react';

import Button from '@/app/components/atoms/Button/Button';
import Badge from '@/app/components/atoms/Badge/Badge';
import { useToaster } from '@/app/components/molecules/Toast/ToasterProvider';

import commonStyles from './UserDisputeDetails.common.module.css';
import lightStyles from './UserDisputeDetails.light.module.css';
import darkStyles from './UserDisputeDetails.dark.module.css';

interface DisputeEvidence {
  filename?: string;
  url: string;
  uploaded_at?: string;
}

interface Dispute {
  id: number;
  contract_id: number;
  raised_by: number;
  dispute_type: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution?: string;
  resolved_at?: string;
  evidence?: DisputeEvidence[];
}

function formatDisputeType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'open': return 'danger';
    case 'in_review': return 'warning';
    case 'resolved': return 'success';
    case 'closed': return 'secondary';
    case 'escalated': return 'info';
    default: return 'secondary';
  }
};

const UserDisputeDetailsPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const toaster = useToaster();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const dashboardPath = user?.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard';

  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
    return { ...commonStyles, ...themeStyles };
  }, [resolvedTheme]);

  const fetchDispute = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.disputes.get(Number(params.id)) as Dispute;
      setDispute(data);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch dispute:', err);
      }
      setError('Failed to load dispute details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  const handleUploadEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !dispute) return;

    const file = e.target.files[0];
    setUploading(true);
    try {
      await api.disputes.uploadEvidence(dispute.id, file);
      toaster.notify({ title: 'Success', description: 'Evidence uploaded successfully', variant: 'success' });
      fetchDispute();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload evidence';
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to upload evidence:', err);
      }
      toaster.notify({ title: 'Error', description: errorMessage, variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className={cn(styles.container, styles.loadingState)}>
        <Loader2 className={styles.spinner} />
        <p>Loading dispute details...</p>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className={cn(styles.container, styles.errorState)}>
        <h2>Error Loading Dispute</h2>
        <p>{error || 'Dispute not found'}</p>
        <Button variant="primary" onClick={() => router.push(dashboardPath)}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isResolved = dispute.status === 'resolved' || dispute.status === 'closed';

  return (
    <div className={cn(styles.container)}>
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft size={16} /> Back
      </Button>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{formatDisputeType(dispute.dispute_type)}</h1>
          <div className={styles.meta}>
            <Badge variant={getStatusBadgeVariant(dispute.status) as any}>
              {dispute.status.replace('_', ' ')}
            </Badge>
            <span>Dispute #{dispute.id}</span>
            <span>Contract #{dispute.contract_id}</span>
            <span>Created: {new Date(dispute.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className={styles.statusBanner}>
        <Info className={styles.statusIcon} />
        <div>
          <strong>Status: {dispute.status.replace('_', ' ')}</strong>
          <p>
            {isResolved
              ? 'This dispute has been resolved. Please check the resolution details below.'
              : 'Our support team is reviewing your dispute. You will be notified of any updates.'}
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Description</h2>
        <p className={styles.description}>{dispute.description}</p>
      </div>

      <div className={styles.section}>
        <div className={commonStyles.disputeHeader}>
          <h2 className={cn(styles.sectionTitle, commonStyles.disputeTitle)}>Evidence</h2>
          {!isResolved && (
            <div className={commonStyles.fileInputWrapper}>
              <input
                type="file"
                id="evidence-upload"
                className={commonStyles.hiddenInput}
                onChange={handleUploadEvidence}
                disabled={uploading}
              />
              <label htmlFor="evidence-upload">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  isLoading={uploading}
                >
                  <Upload size={16} /> Add Evidence
                </Button>
              </label>
            </div>
          )}
        </div>

        {dispute.evidence && dispute.evidence.length > 0 ? (
          <div className={styles.evidenceList}>
          {dispute.evidence.map((item: DisputeEvidence, index: number) => (
              <div key={index} className={styles.evidenceItem}>
                <FileText className={styles.evidenceIcon} />
                <span className={styles.evidenceName}>{item.filename || `Evidence ${index + 1}`}</span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open(item.url, '_blank')}
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>No evidence uploaded.</p>
        )}
      </div>

      {isResolved && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Resolution</h2>
          <div className={styles.resolutionDetails}>
            <p><strong>Resolved At:</strong> {dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : 'N/A'}</p>
            <div className="mt-4">
              <strong>Resolution Note:</strong>
              <p className={styles.description}>{dispute.resolution}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDisputeDetailsPage;
