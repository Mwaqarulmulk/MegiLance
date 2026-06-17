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
  files: { id: string; name: string; size: number }[];
  submittedAt: string;
  comments: { id: string; user: string; text: string; date: string }[];
}

const mockDeliverables: Deliverable[] = [
  {
    id: "d1",
    milestoneTitle: "Frontend Development",
    contractTitle: "E-Commerce Platform Development",
    freelancerName: "John Developer",
    title: "Homepage & Product Listing Pages",
    description:
      "Completed responsive homepage with hero section, product grid, filters, and search functionality.",
    status: "submitted",
    files: [
      { id: "f1", name: "homepage-v2.zip", size: 2450000 },
      { id: "f2", name: "screenshots.pdf", size: 1200000 },
    ],
    submittedAt: "2024-02-15T10:30:00Z",
    comments: [],
  },
];

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

const API_BASE = "/api/v1";

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

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedDeliverable) {
        setSelectedDeliverable(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedDeliverable]);

  const handleApprove = async () => {
    if (!selectedDeliverable) return;
    const id = selectedDeliverable.id;
    setActionLoading("approve");
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE}/deliverables/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      showToast("Failed to approve deliverable. Please try again.", "error");
    }
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "approved" as const } : d,
      ),
    );
    setSelectedDeliverable(null);
    setReviewNotes("");
    setActionLoading(null);
    showToast("Deliverable approved successfully! ✓");
  };

  const handleRequestRevision = async () => {
    if (!selectedDeliverable) return;
    const id = selectedDeliverable.id;
    setActionLoading("revision");
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE}/deliverables/${id}/request-revision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ revision_notes: reviewNotes }),
      });
    } catch (err) {
      showToast("Failed to request revision. Please try again.", "error");
    }
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "revision_requested" as const } : d,
      ),
    );
    setSelectedDeliverable(null);
    setReviewNotes("");
    setActionLoading(null);
    showToast("Revision requested. The freelancer has been notified.");
  };

  const handleReject = async () => {
    if (!selectedDeliverable) return;
    const id = selectedDeliverable.id;
    setActionLoading("reject");
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE}/deliverables/${id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: reviewNotes }),
      });
    } catch (err) {
      showToast("Failed to reject deliverable. Please try again.", "error");
    }
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "rejected" as const } : d,
      ),
    );
    setSelectedDeliverable(null);
    setReviewNotes("");
    setActionLoading(null);
    showToast("Deliverable rejected.", "error");
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
                    {new Date(deliverable.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
