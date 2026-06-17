// @AI-HINT: User page to view dispute details — enhanced with timeline, participant cards, evidence previews, resolution notes
'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft,
  Loader2,
  FileText,
  Info,
  Upload,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Image,
  File,
  X,
} from 'lucide-react';

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

interface DisputeParticipant {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

interface Dispute {
  id: number;
  contract_id: number;
  raised_by: number;
  raised_by_user?: DisputeParticipant;
  against_user?: DisputeParticipant;
  dispute_type: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolution?: string;
  resolved_at?: string;
  evidence?: DisputeEvidence[];
  timeline?: { status: string; timestamp: string; note?: string }[];
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

const STATUS_STEPS = ['open', 'in_review', 'escalated', 'resolved', 'closed'];

function getStatusIndex(status: string): number {
  const idx = STATUS_STEPS.indexOf(status.toLowerCase());
  return idx >= 0 ? idx : 0;
}

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
  const [previewFile, setPreviewFile] = useState<DisputeEvidence | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getFileIcon = (filename?: string) => {
    if (!filename) return <File size={20} />;
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <Image size={20} />;
    return <FileText size={20} />;
  };

  const isImageFile = (filename?: string) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
  };

  const timelineSteps = useMemo(() => {
    if (!dispute) return [];
    const currentIdx = getStatusIndex(dispute.status);
    return STATUS_STEPS.map((step, idx) => ({
      status: step,
      label: formatDisputeType(step),
      completed: idx <= currentIdx,
      current: idx === currentIdx,
      timestamp: dispute.timeline?.find(t => t.status === step)?.timestamp,
      note: dispute.timeline?.find(t => t.status === step)?.note,
    }));
  }, [dispute]);

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

      {/* Status Timeline */}
      <div className={cn(styles.section, styles.timelineSection)}>
        <h2 className={styles.sectionTitle}>Status Progress</h2>
        <div className={styles.timeline}>
          {timelineSteps.map((step, idx) => (
            <div
              key={step.status}
              className={cn(
                styles.timelineStep,
                step.completed && styles.timelineStepCompleted,
                step.current && styles.timelineStepCurrent,
              )}
            >
              <div className={cn(styles.timelineDot, step.completed && styles.timelineDotCompleted)}>
                {step.completed ? <CheckCircle size={16} /> : <span>{idx + 1}</span>}
              </div>
              <div className={styles.timelineContent}>
                <span className={styles.timelineLabel}>{step.label}</span>
                {step.timestamp && (
                  <span className={styles.timelineTime}>
                    <Clock size={12} /> {new Date(step.timestamp).toLocaleString()}
                  </span>
                )}
                {step.note && <span className={styles.timelineNote}>{step.note}</span>}
              </div>
              {idx < timelineSteps.length - 1 && (
                <div className={cn(styles.timelineConnector, step.completed && styles.timelineConnectorCompleted)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Participant Info Cards */}
      <div className={styles.participantsGrid}>
        <div className={cn(styles.section, styles.participantCard)}>
          <div className={styles.participantHeader}>
            <User size={18} />
            <h3>Raised By</h3>
          </div>
          {dispute.raised_by_user ? (
            <div className={styles.participantInfo}>
              {dispute.raised_by_user.avatar && (
                <img src={dispute.raised_by_user.avatar} alt="" className={styles.participantAvatar} />
              )}
              <div>
                <strong>{dispute.raised_by_user.name || 'Unknown User'}</strong>
                <span>{dispute.raised_by_user.email}</span>
                {dispute.raised_by_user.role && (
                  <Badge variant="primary">{dispute.raised_by_user.role}</Badge>
                )}
              </div>
            </div>
          ) : (
            <p className={styles.participantPlaceholder}>User #{dispute.raised_by}</p>
          )}
        </div>

        <div className={cn(styles.section, styles.participantCard)}>
          <div className={styles.participantHeader}>
            <AlertTriangle size={18} />
            <h3>Against</h3>
          </div>
          {dispute.against_user ? (
            <div className={styles.participantInfo}>
              {dispute.against_user.avatar && (
                <img src={dispute.against_user.avatar} alt="" className={styles.participantAvatar} />
              )}
              <div>
                <strong>{dispute.against_user.name || 'Unknown User'}</strong>
                <span>{dispute.against_user.email}</span>
                {dispute.against_user.role && (
                  <Badge variant="warning">{dispute.against_user.role}</Badge>
                )}
              </div>
            </div>
          ) : (
            <p className={styles.participantPlaceholder}>Not specified</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Description</h2>
        <p className={styles.description}>{dispute.description}</p>
      </div>

      {/* Evidence Upload Section */}
      <div className={styles.section}>
        <div className={commonStyles.disputeHeader}>
          <h2 className={cn(styles.sectionTitle, commonStyles.disputeTitle)}>
            Evidence ({dispute.evidence?.length || 0})
          </h2>
          {!isResolved && (
            <div className={commonStyles.fileInputWrapper}>
              <input
                type="file"
                id="evidence-upload"
                ref={fileInputRef}
                className={commonStyles.hiddenInput}
                onChange={handleUploadEvidence}
                disabled={uploading}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.csv"
              />
              <label htmlFor="evidence-upload">
                <Button
                  variant="outline"
                  size="sm"
                  as="span"
                  isLoading={uploading}
                >
                  <Upload size={16} /> Upload Evidence
                </Button>
              </label>
            </div>
          )}
        </div>

        {dispute.evidence && dispute.evidence.length > 0 ? (
          <div className={styles.evidenceGrid}>
            {dispute.evidence.map((item: DisputeEvidence, index: number) => (
              <div key={index} className={styles.evidenceCard}>
                <div className={styles.evidencePreview}>
                  {isImageFile(item.filename) ? (
                    <img
                      src={item.url}
                      alt={item.filename || `Evidence ${index + 1}`}
                      className={styles.evidenceThumb}
                    />
                  ) : (
                    <div className={styles.evidenceFileIcon}>
                      {getFileIcon(item.filename)}
                    </div>
                  )}
                </div>
                <div className={styles.evidenceMeta}>
                  <span className={styles.evidenceName}>{item.filename || `Evidence ${index + 1}`}</span>
                  {item.uploaded_at && (
                    <span className={styles.evidenceDate}>
                      {new Date(item.uploaded_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className={styles.evidenceActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewFile(item)}
                  >
                    <Eye size={14} /> Preview
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyEvidence}>
            <FileText size={32} style={{ opacity: 0.3 }} />
            <p>No evidence uploaded yet.</p>
            {!isResolved && (
              <p className={styles.evidenceHint}>Upload files to support your dispute claim.</p>
            )}
          </div>
        )}
      </div>

      {/* Resolution Notes Section */}
      <div className={cn(styles.section, isResolved ? styles.resolutionSection : styles.resolutionPending)}>
        <h2 className={styles.sectionTitle}>
          {isResolved ? 'Resolution Notes' : 'Resolution Status'}
        </h2>
        {isResolved ? (
          <div className={styles.resolutionDetails}>
            <div className={styles.resolutionMeta}>
              <div>
                <strong>Resolved At:</strong>
                <span>{dispute.resolved_at ? new Date(dispute.resolved_at).toLocaleString() : 'N/A'}</span>
              </div>
              <div>
                <strong>Final Status:</strong>
                <Badge variant={getStatusBadgeVariant(dispute.status) as any}>
                  {dispute.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            {dispute.resolution ? (
              <div className={styles.resolutionNote}>
                <strong>Resolution Details:</strong>
                <p className={styles.description}>{dispute.resolution}</p>
              </div>
            ) : (
              <p className={styles.noResolution}>No resolution notes provided.</p>
            )}
          </div>
        ) : (
          <div className={styles.resolutionPendingContent}>
            <Info size={18} />
            <div>
              <strong>This dispute is still under review.</strong>
              <p>Our support team is actively working on your case. You will be notified once a resolution has been reached.</p>
            </div>
          </div>
        )}
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className={styles.previewOverlay} onClick={() => setPreviewFile(null)}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.previewHeader}>
              <h3>{previewFile.filename || 'Evidence Preview'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                <X size={18} />
              </Button>
            </div>
            <div className={styles.previewContent}>
              {isImageFile(previewFile.filename) ? (
                <img src={previewFile.url} alt={previewFile.filename || 'Evidence'} className={styles.previewImage} />
              ) : (
                <iframe src={previewFile.url} className={styles.previewIframe} title="Evidence preview" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDisputeDetailsPage;
