"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Download,
  Eye,
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { apiFetch } from "@/lib/api/core";

interface Deliverable {
  id: string;
  milestoneTitle: string;
  contractTitle: string;
  freelancerName: string;
  title: string;
  description: string;
  status:
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "revision_requested";
  files: { id: string; name: string; size: number; url?: string }[];
  submittedAt: string;
  comments: { id: string; user: string; text: string; date: string }[];
}

const mockDeliverables: Deliverable[] = [];

const statusConfig: Record<string, { label: string; color: string }> = {
  submitted: {
    label: "Awaiting Review",
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  },
  under_review: { label: "Under Review", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  approved: { label: "Approved", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  rejected: { label: "Rejected", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function ClientDeliverablesPage() {
  const [deliverables, setDeliverables] =
    useState<Deliverable[]>(mockDeliverables);
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<
    "approve" | "revision" | "reject" | null
  >(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loadingDeliverables, setLoadingDeliverables] = useState(true);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch real deliverables from API
  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const data = await apiFetch('/deliverables') as any;
        const items = Array.isArray(data) ? data : (data?.deliverables ?? data?.items ?? []);
        if (items.length > 0) {
          setDeliverables(
            items.map((d: any) => ({
              id: String(d.id),
              milestoneTitle: d.milestone_title || d.milestoneTitle || '',
              contractTitle: d.contract_title || d.contractTitle || '',
              freelancerName: d.freelancer_name || d.freelancerName || '',
              title: d.title || 'Untitled',
              description: d.description || '',
              status: d.status || 'submitted',
              files: (d.files || []).map((f: any) => ({
                id: String(f.id),
                name: f.name || f.filename || '',
                size: f.size || 0,
                url: f.url || f.file_url,
              })),
              submittedAt: d.submitted_at || d.submittedAt || d.created_at || '',
              comments: (d.comments || []).map((c: any) => ({
                id: String(c.id),
                user: c.user || c.user_name || 'User',
                text: c.text || c.comment || '',
                date: c.date || c.created_at || '',
              })),
            }))
          );
        }
      } catch {
        // Keep empty array on error - no mock data fallback
      } finally {
        setLoadingDeliverables(false);
      }
    };
    fetchDeliverables();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedDeliverable) {
        setSelectedDeliverable(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedDeliverable]);

  // Single backend endpoint: POST /deliverables/review { deliverable_id, action }.
  const reviewDeliverable = async (
    action: "approve" | "reject" | "request_revision",
    newStatus: Deliverable["status"],
    extra: { reviewer_notes?: string; rejection_reason?: string },
    successMsg: string,
    successType: "success" | "error" = "success",
  ) => {
    if (!selectedDeliverable) return;
    const id = selectedDeliverable.id;
    setActionLoading(action === "request_revision" ? "revision" : action);
    try {
      await apiFetch("/deliverables/review", {
        method: "POST",
        body: JSON.stringify({ deliverable_id: String(id), action, ...extra }),
      });
      setDeliverables((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)),
      );
      setSelectedDeliverable(null);
      setReviewNotes("");
      showToast(successMsg, successType);
    } catch (err) {
      showToast("Action failed. Please try again.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = () =>
    reviewDeliverable("approve", "approved", {}, "Deliverable approved successfully! ✓");

  const handleRequestRevision = () =>
    reviewDeliverable(
      "request_revision",
      "revision_requested",
      { reviewer_notes: reviewNotes },
      "Revision requested. The freelancer has been notified.",
    );

  const handleReject = () =>
    reviewDeliverable(
      "reject",
      "rejected",
      { rejection_reason: reviewNotes },
      "Deliverable rejected.",
      "error",
    );

  // Open or download a submitted file. Files without a URL (demo data) get a
  // clear message rather than a dead button.
  const openFile = (file: { name: string; url?: string }, download = false) => {
    if (!file.url) {
      showToast("This file is not available for download yet.", "error");
      return;
    }
    if (download) {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
    } else {
      window.open(file.url, "_blank", "noopener");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Deliverables
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Review and approve milestone deliverables
        </p>
      </div>

      {loadingDeliverables ? (
        <div className="py-16 text-center text-gray-500">
          <Clock className="w-8 h-8 mx-auto animate-spin mb-3 text-blue-500" />
          <p className="text-sm">Loading deliverables...</p>
        </div>
      ) : deliverables.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Deliverables Yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            When freelancers submit work for your active contract milestones, their deliverables, files, and notes will appear here for your review and approval.
          </p>
          <a
            href="/client/contracts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            View Active Contracts
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((deliverable) => {
            const config = statusConfig[deliverable.status] || { label: deliverable.status, color: "bg-gray-100 text-gray-700" };
            return (
              <div
                key={deliverable.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDeliverable(deliverable)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {deliverable.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {deliverable.freelancerName} • {deliverable.contractTitle} →{" "}
                      {deliverable.milestoneTitle}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {deliverable.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {deliverable.files?.length || 0} files
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {deliverable.submittedAt ? new Date(deliverable.submittedAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedDeliverable && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] p-4"
          style={{ overflowY: "auto" }}
          onClick={() => setSelectedDeliverable(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              top: "50%",
              transform: "translateY(-50%)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDeliverable.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDeliverable.freelancerName}
                </p>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Files */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Submitted Files
                </h3>
                <div className="space-y-2">
                  {selectedDeliverable.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => openFile(file, true)}
                          aria-label={`Download ${file.name}`}
                          title={`Download ${file.name}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openFile(file, false)}
                          aria-label={`View ${file.name}`}
                          title={`View ${file.name}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDeliverable.description}
                </p>
              </div>

              {/* Review Notes */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Review Notes
                </h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add feedback or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleApprove}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ThumbsUp size={14} />
                  {actionLoading === "approve" ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={handleRequestRevision}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Clock size={14} />
                  {actionLoading === "revision"
                    ? "Requesting..."
                    : "Request Revision"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={!!actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ThumbsDown size={14} />
                  {actionLoading === "reject" ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[10000] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
