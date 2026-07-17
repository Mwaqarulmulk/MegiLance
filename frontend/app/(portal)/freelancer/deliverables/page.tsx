"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Plus,
  Download,
  Eye,
  MessageSquare,
  Send,
  ChevronDown,
} from "lucide-react";
import { RichTextEditor } from "@/app/components/Editor";
import { apiFetch } from "@/lib/api/core";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import { contractsApi, milestonesApi } from "@/lib/api/projects";

interface DeliverableFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

interface Deliverable {
  id: string;
  milestoneId: string;
  contractId: string;
  milestoneTitle: string;
  contractTitle: string;
  title: string;
  description: string;
  submissionNotes: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "revision_requested"
    | "resubmitted";
  files: DeliverableFile[];
  rejectionReason?: string;
  revisionCount: number;
  maxRevisions: number;
  submittedAt?: string;
  reviewedAt?: string;
  comments: { id: string; user: string; text: string; date: string }[];
}

const mockDeliverables: Deliverable[] = [];

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300", icon: FileText },
  submitted: {
    label: "Submitted",
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    icon: Eye,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    icon: AlertCircle,
  },
  revision_requested: {
    label: "Revision Requested",
    color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    icon: AlertCircle,
  },
  resubmitted: {
    label: "Resubmitted",
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    icon: Send,
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function DeliverablesPage() {
  const toaster = useToaster();
  const [deliverables, setDeliverables] =
    useState<Deliverable[]>(mockDeliverables);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submitForm, setSubmitForm] = useState({
    milestoneId: "",
    title: "",
    description: "",
    submissionNotes: "",
    files: [] as File[],
  });
  const [revisionNotes, setRevisionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingDeliverables, setLoadingDeliverables] = useState(true);
  const [milestoneOptions, setMilestoneOptions] = useState<
    { id: string; contractId: string; title: string; contract: string }[]
  >([]);

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
              milestoneId: String(d.milestone_id || d.milestoneId || ''),
              contractId: String(d.contract_id || d.contractId || ''),
              milestoneTitle: d.milestone_title || d.milestoneTitle || '',
              contractTitle: d.contract_title || d.contractTitle || '',
              title: d.title || 'Untitled',
              description: d.description || '',
              submissionNotes: d.submission_notes || d.submissionNotes || '',
              status: d.status || 'submitted',
              files: (d.files || []).map((f: any) => ({
                id: String(f.id),
                name: f.name || f.filename || '',
                size: f.size || 0,
                type: f.type || 'application/octet-stream',
                url: f.url || f.file_url || '',
              })),
              rejectionReason: d.rejection_reason || d.rejectionReason,
              revisionCount: d.revision_count || d.revisionCount || 0,
              maxRevisions: d.max_revisions || d.maxRevisions || 3,
              submittedAt: d.submitted_at || d.submittedAt || d.created_at,
              reviewedAt: d.reviewed_at || d.reviewedAt,
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
        // Keep empty array on error
      } finally {
        setLoadingDeliverables(false);
      }
    };
    fetchDeliverables();
  }, []);

  // Load real milestones for the submit form. Existing deliverables alone
  // cannot provide options for a first submission.
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await contractsApi.list();
        const contracts = Array.isArray(response)
          ? response
          : (response as any)?.items || (response as any)?.contracts || [];
        const groups = await Promise.all(
          contracts.map(async (contract: any) => {
            const milestonesResponse = await milestonesApi.list(contract.id);
            const milestones = Array.isArray(milestonesResponse)
              ? milestonesResponse
              : (milestonesResponse as any)?.items || [];
            return milestones.map((milestone: any) => ({
              id: String(milestone.id),
              contractId: String(contract.id),
              title: milestone.title || "Untitled milestone",
              contract: contract.title || contract.name || `Contract #${contract.id}`,
            }));
          }),
        );
        setMilestoneOptions(groups.flat());
      } catch {
        setMilestoneOptions([]);
      }
    };
    fetchMilestones();
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSubmitForm((prev) => ({
          ...prev,
          files: [...prev.files, ...Array.from(e.target.files!)],
        }));
      }
    },
    [],
  );

  const removeFile = (index: number) => {
    setSubmitForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const closeModals = useCallback(() => {
    setShowSubmitForm(false);
    setSelectedDeliverable(null);
    setRevisionNotes("");
    setRejectionReason("");
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModals();
    };
    if (showSubmitForm || selectedDeliverable) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showSubmitForm, selectedDeliverable, closeModals]);

  // The backend exposes a single POST /deliverables/review endpoint that takes
  // { deliverable_id, action } and returns the new status. Route through
  // apiFetch so the auth token + API base are applied (raw fetch to
  // /api/v1/... had no credentials and hit non-existent per-action routes).
  const reviewDeliverable = async (
    action: "approve" | "reject" | "request_revision",
    extra?: { reviewer_notes?: string; rejection_reason?: string },
  ) => {
    if (!selectedDeliverable) return;
    setActionLoading(true);
    try {
      const res = await apiFetch<{ status?: Deliverable["status"] }>(
        "/deliverables/review",
        {
          method: "POST",
          body: JSON.stringify({
            deliverable_id: String(selectedDeliverable.id),
            action,
            ...extra,
          }),
        },
      );
      const newStatus = (res?.status ||
        (action === "approve"
          ? "approved"
          : action === "reject"
            ? "rejected"
            : "revision_requested")) as Deliverable["status"];
      const targetId = selectedDeliverable.id;
      setDeliverables((prev) =>
        prev.map((d) => (d.id === targetId ? { ...d, status: newStatus } : d)),
      );
      setSelectedDeliverable((cur) =>
        cur && cur.id === targetId ? { ...cur, status: newStatus } : cur,
      );
      return res;
    } catch (err) {
      console.error(err);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    const ok = await reviewDeliverable("approve");
    if (ok) closeModals();
  };

  const handleRequestRevision = async () => {
    const ok = await reviewDeliverable("request_revision", {
      reviewer_notes: revisionNotes,
    });
    if (ok) {
      setRevisionNotes("");
      closeModals();
    }
  };

  const handleReject = async () => {
    const ok = await reviewDeliverable("reject", {
      rejection_reason: rejectionReason,
    });
    if (ok) {
      setRejectionReason("");
      closeModals();
    }
  };

  const handleAddComment = async () => {
    if (!selectedDeliverable || !newComment.trim()) return;
    setActionLoading(true);
    try {
      const res = await apiFetch<{ comment_id?: string; created_at?: string }>(
        "/deliverables/comment",
        {
          method: "POST",
          body: JSON.stringify({
            deliverable_id: String(selectedDeliverable.id),
            comment: newComment.trim(),
          }),
        },
      );
      const comment = {
        id: res?.comment_id || `c${Date.now()}`,
        user: "You",
        text: newComment.trim(),
        date: res?.created_at || new Date().toISOString(),
      };
      const targetId = selectedDeliverable.id;
      setDeliverables((prev) =>
        prev.map((d) =>
          d.id === targetId ? { ...d, comments: [...d.comments, comment] } : d,
        ),
      );
      setSelectedDeliverable((cur) =>
        cur && cur.id === targetId
          ? { ...cur, comments: [...cur.comments, comment] }
          : cur,
      );
      setNewComment("");
    } catch (err) {
      console.error(err);
      alert("Failed to add comment. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files?.length) {
        setSubmitForm((prev) => ({
          ...prev,
          files: [...prev.files, ...Array.from(e.dataTransfer.files)],
        }));
      }
    },
    [],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async () => {
    const selectedMilestone = milestoneOptions.find(
      (milestone) => milestone.id === submitForm.milestoneId,
    );
    if (!selectedMilestone?.id || !selectedMilestone.contractId) {
      toaster.notify({
        title: "Select a milestone first",
        description: "Choose the contract milestone this deliverable belongs to.",
        variant: "warning",
      });
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiFetch<{
        deliverable_id?: string;
        submitted_at?: string;
      }>("/deliverables/submit", {
        method: "POST",
        body: JSON.stringify({
          milestone_id: selectedMilestone.id,
          contract_id: selectedMilestone.contractId,
          title: submitForm.title.trim(),
          description: submitForm.description,
          submission_notes: submitForm.submissionNotes.trim(),
          files: submitForm.files.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        }),
      });

      const newDeliverable: Deliverable = {
        id: response?.deliverable_id || `d-${Date.now()}`,
        milestoneId: selectedMilestone.id,
        contractId: selectedMilestone.contractId,
        milestoneTitle: selectedMilestone.title,
        contractTitle: selectedMilestone.contract,
        title: submitForm.title.trim(),
        description: submitForm.description,
        submissionNotes: submitForm.submissionNotes,
        status: "submitted",
        files: submitForm.files.map((file, index) => ({
          id: `f-${Date.now()}-${index}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: "",
        })),
        revisionCount: 0,
        maxRevisions: 3,
        submittedAt: response?.submitted_at || new Date().toISOString(),
        comments: [],
      };

      setDeliverables((prev) => [newDeliverable, ...prev]);
      setShowSubmitForm(false);
      setSubmitForm({
        milestoneId: "",
        title: "",
        description: "",
        submissionNotes: "",
        files: [],
      });
      toaster.notify({
        title: "Deliverable submitted",
        description: "Your client can now review the submitted work.",
        variant: "success",
      });
    } catch (error) {
      toaster.notify({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "danger",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deliverables
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Submit and manage milestone deliverables
          </p>
        </div>
        <button
          onClick={() => setShowSubmitForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Upload size={14} />
          Submit Deliverable
        </button>
      </div>

      {/* Deliverables List */}
      <div className="space-y-4">
        {deliverables.map((deliverable) => {
          const config = statusConfig[deliverable.status];
          return (
            <div
              key={deliverable.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDeliverable(deliverable)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.color}`}
                    >
                      <config.icon size={10} className="inline mr-1" />
                      {config.label}
                    </span>
                    {deliverable.revisionCount > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Revision {deliverable.revisionCount}/
                        {deliverable.maxRevisions}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {deliverable.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {deliverable.contractTitle} → {deliverable.milestoneTitle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                    {deliverable.description}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {deliverable.files.length} file
                    {deliverable.files.length !== 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {deliverable.submittedAt &&
                      new Date(deliverable.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Files Preview */}
              <div className="flex flex-wrap gap-2 mt-3">
                {deliverable.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded text-xs"
                  >
                    <FileText size={12} className="text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <span className="text-gray-400">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                ))}
              </div>

              {/* Rejection Reason */}
              {deliverable.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-xs font-medium text-red-600 mb-1">
                    Rejection Reason
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    {deliverable.rejectionReason}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Submit Deliverable
              </h2>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Milestone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Milestone
                </label>
                <select
                  value={submitForm.milestoneId}
                  onChange={(e) =>
                    setSubmitForm({
                      ...submitForm,
                      milestoneId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select milestone...</option>
                  {milestoneOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} — {m.contract}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={submitForm.title}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, title: e.target.value })
                  }
                  placeholder="e.g., Homepage & Product Pages"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <RichTextEditor
                  content={submitForm.description}
                  onChange={(html) =>
                    setSubmitForm({ ...submitForm, description: html })
                  }
                  placeholder="Describe what you've delivered..."
                  minHeight="120px"
                />
              </div>

              {/* Submission Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes to Client
                </label>
                <textarea
                  value={submitForm.submissionNotes}
                  onChange={(e) =>
                    setSubmitForm({
                      ...submitForm,
                      submissionNotes: e.target.value,
                    })
                  }
                  placeholder="Any additional notes for the client..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Files *
                </label>
                <div
                  className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag & drop files here, or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                {submitForm.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {submitForm.files.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading || !submitForm.milestoneId || !submitForm.title || submitForm.files.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {actionLoading ? "Submitting…" : "Submit Deliverable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModals}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedDeliverable.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedDeliverable.contractTitle}
                  </p>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[selectedDeliverable.status].color}`}
                >
                  {statusConfig[selectedDeliverable.status].label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Submitted:{" "}
                  {selectedDeliverable.submittedAt &&
                    new Date(selectedDeliverable.submittedAt).toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedDeliverable.description}
                </div>
              </div>

              {/* Files */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Files
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
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                  Comments
                </h3>
                <div className="space-y-3">
                  {selectedDeliverable.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {comment.user}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || actionLoading}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedDeliverable.status === "submitted" && (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-40"
                      >
                        Approve Deliverable
                      </button>
                      <button
                        onClick={handleRequestRevision}
                        disabled={actionLoading || !revisionNotes.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-40"
                      >
                        Request Revision
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={revisionNotes}
                        onChange={(e) => setRevisionNotes(e.target.value)}
                        placeholder="Revision notes (required for Request Revision)..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </div>
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason (required for Reject)..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {(selectedDeliverable.status === "revision_requested" ||
                  selectedDeliverable.status === "rejected") && (
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    Resubmit
                  </button>
                )}
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download size={14} className="inline mr-1" />
                  Download All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
