// @AI-HINT: Refunds Management - admin approval workflow and client refund requests
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { refundsApi } from '@/lib/api';
import type { RefundRequest } from '@/types/api';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle, FileText, Calendar } from 'lucide-react';
import commonStyles from './Refunds.common.module.css';
import lightStyles from './Refunds.light.module.css';
import darkStyles from './Refunds.dark.module.css';

interface RefundsProps {
  userRole: 'admin' | 'client';
}

const Refunds: React.FC<RefundsProps> = ({ userRole }) => {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Admin action states
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadRefunds();
  }, [filter]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await refundsApi.list(filter === 'all' ? undefined : filter) as { refund_requests: RefundRequest[] };
      setRefunds(response.refund_requests);
    } catch (err: any) {
      setError(err.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      await refundsApi.request({
        payment_id: Number(paymentId),
        amount,
        reason
      });

      setShowRequestForm(false);
      setPaymentId('');
      setAmount(0);
      setReason('');
      loadRefunds();
    } catch (err: any) {
      setError(err.message || 'Failed to request refund');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (refundId: number) => {
    try {
      setActionLoading(true);
      setError(null);

      await refundsApi.approve(refundId, { admin_notes: adminNotes });
      setSelectedRefund(null);
      setAdminNotes('');
      loadRefunds();
    } catch (err: any) {
      setError(err.message || 'Failed to approve refund');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (refundId: number) => {
    try {
      setActionLoading(true);
      setError(null);

      await refundsApi.reject(refundId, adminNotes);
      setSelectedRefund(null);
      setAdminNotes('');
      loadRefunds();
    } catch (err: any) {
      setError(err.message || 'Failed to reject refund');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={18} />;
      case 'approved':
        return <CheckCircle size={18} />;
      case 'rejected':
        return <XCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredRefunds = refunds.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={commonStyles.header}>
        <div>
          <h1 className={cn(commonStyles.title, themeStyles.title)}>Refunds</h1>
          <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
            {userRole === 'admin' ? 'Manage refund requests' : 'View and request refunds'}
          </p>
        </div>
        {userRole === 'client' && (
          <button
            onClick={() => setShowRequestForm(true)}
            className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}
          >
            <DollarSign size={18} />
            Request Refund
          </button>
        )}
      </div>

      {error && (
        <div className={cn(commonStyles.error, themeStyles.error)}>
          {error}
        </div>
      )}

      <div className={commonStyles.filters}>
        <button
          onClick={() => setFilter('all')}
          className={cn(
            commonStyles.filterBtn,
            themeStyles.filterBtn,
            filter === 'all' && commonStyles.filterBtnActive,
            filter === 'all' && themeStyles.filterBtnActive
          )}
        >
          All ({refunds.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={cn(
            commonStyles.filterBtn,
            themeStyles.filterBtn,
            filter === 'pending' && commonStyles.filterBtnActive,
            filter === 'pending' && themeStyles.filterBtnActive
          )}
        >
          Pending ({refunds.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={cn(
            commonStyles.filterBtn,
            themeStyles.filterBtn,
            filter === 'approved' && commonStyles.filterBtnActive,
            filter === 'approved' && themeStyles.filterBtnActive
          )}
        >
          Approved ({refunds.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={cn(
            commonStyles.filterBtn,
            themeStyles.filterBtn,
            filter === 'rejected' && commonStyles.filterBtnActive,
            filter === 'rejected' && themeStyles.filterBtnActive
          )}
        >
          Rejected ({refunds.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {showRequestForm && (
        <div className={cn(commonStyles.modal, themeStyles.modal)}>
          <div className={cn(commonStyles.modalContent, themeStyles.modalContent)}>
            <div className={commonStyles.modalHeader}>
              <h2 className={cn(commonStyles.modalTitle, themeStyles.modalTitle)}>Request Refund</h2>
              <button
                onClick={() => setShowRequestForm(false)}
                className={cn(commonStyles.closeBtn, themeStyles.closeBtn)}
                aria-label="Close refund request form"
              >
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleRequestRefund} className={commonStyles.form}>
              <div className={commonStyles.formGroup}>
                <label className={cn(commonStyles.label, themeStyles.label)}>Payment ID</label>
                <input
                  type="text"
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className={cn(commonStyles.input, themeStyles.input)}
                  required
                  aria-label="Payment ID"
                />
              </div>

              <div className={commonStyles.formGroup}>
                <label className={cn(commonStyles.label, themeStyles.label)}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={cn(commonStyles.input, themeStyles.input)}
                  required
                  aria-label="Refund amount"
                />
              </div>

              <div className={commonStyles.formGroup}>
                <label className={cn(commonStyles.label, themeStyles.label)}>Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={cn(commonStyles.textarea, themeStyles.textarea)}
                  rows={4}
                  required
                  aria-label="Refund reason"
                />
              </div>

              <div className={commonStyles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className={cn(commonStyles.secondaryBtn, themeStyles.secondaryBtn)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(commonStyles.primaryBtn, themeStyles.primaryBtn)}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={cn(commonStyles.loading, themeStyles.loading)}>
          Loading refunds...
        </div>
      ) : filteredRefunds.length > 0 ? (
        <div className={commonStyles.refundsGrid}>
          {filteredRefunds.map(refund => (
            <div
              key={refund.id}
              className={cn(commonStyles.refundCard, themeStyles.refundCard)}
              onClick={() => setSelectedRefund(refund)}
            >
              <div className={commonStyles.refundHeader}>
                <span
                  className={cn(commonStyles.statusBadge, themeStyles.statusBadge)}
                  data-status={refund.status}
                >
                  {getStatusIcon(refund.status)}
                  {refund.status}
                </span>
                <span className={cn(commonStyles.amount, themeStyles.amount)}>
                  {formatCurrency(refund.amount)}
                </span>
              </div>

              <div className={cn(commonStyles.refundDetails, themeStyles.refundDetails)}>
                <div className={commonStyles.detailRow}>
                  <FileText size={16} />
                  <span>Payment #{refund.payment_id}</span>
                </div>
                <div className={commonStyles.detailRow}>
                  <Calendar size={16} />
                  <span>{formatDate(refund.requested_at)}</span>
                </div>
              </div>

              <p className={cn(commonStyles.reason, themeStyles.reason)}>
                {refund.reason}
              </p>

              {refund.admin_notes && (
                <div className={cn(commonStyles.adminNotes, themeStyles.adminNotes)}>
                  <strong>Admin Notes:</strong> {refund.admin_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(commonStyles.empty, themeStyles.empty)}>
          <DollarSign size={48} />
          <p>No refund requests found</p>
        </div>
      )}

      {selectedRefund && userRole === 'admin' && selectedRefund.status === 'pending' && (
        <div className={cn(commonStyles.modal, themeStyles.modal)}>
          <div className={cn(commonStyles.modalContent, themeStyles.modalContent)}>
            <div className={commonStyles.modalHeader}>
              <h2 className={cn(commonStyles.modalTitle, themeStyles.modalTitle)}>Review Refund</h2>
              <button
                onClick={() => setSelectedRefund(null)}
                className={cn(commonStyles.closeBtn, themeStyles.closeBtn)}
                aria-label="Close refund review"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className={cn(commonStyles.reviewDetails, themeStyles.reviewDetails)}>
              <div className={commonStyles.reviewRow}>
                <strong>Amount:</strong>
                <span>{formatCurrency(selectedRefund.amount)}</span>
              </div>
              <div className={commonStyles.reviewRow}>
                <strong>Payment ID:</strong>
                <span>#{selectedRefund.payment_id}</span>
              </div>
              <div className={commonStyles.reviewRow}>
                <strong>Requested:</strong>
                <span>{formatDate(selectedRefund.requested_at)}</span>
              </div>
              <div className={commonStyles.reviewRow}>
                <strong>Reason:</strong>
                <span>{selectedRefund.reason}</span>
              </div>
            </div>

            <div className={commonStyles.formGroup}>
              <label className={cn(commonStyles.label, themeStyles.label)}>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className={cn(commonStyles.textarea, themeStyles.textarea)}
                rows={3}
                placeholder="Add notes about your decision..."
              />
            </div>

            <div className={commonStyles.modalActions}>
              <button
                onClick={() => handleReject(selectedRefund.id)}
                disabled={actionLoading}
                className={cn(commonStyles.rejectBtn, themeStyles.rejectBtn)}
              >
                <XCircle size={18} />
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedRefund.id)}
                disabled={actionLoading}
                className={cn(commonStyles.approveBtn, themeStyles.approveBtn)}
              >
                <CheckCircle size={18} />
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Refunds;
