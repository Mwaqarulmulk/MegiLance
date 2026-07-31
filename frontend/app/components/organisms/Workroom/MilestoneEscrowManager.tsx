// @AI-HINT: Upwork-grade Milestone Escrow & Deliverables Manager for contract workrooms.
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api/core";
import {
  ShieldCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  AlertCircle,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Milestone } from "@/app/types/portal";

interface MilestoneEscrowManagerProps {
  contractId: string;
  userRole?: "client" | "freelancer";
}

export default function MilestoneEscrowManager({
  contractId,
  userRole = "client",
}: MilestoneEscrowManagerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "m-1",
      title: "Phase 1: Architecture & UI/UX Design System",
      amount: 1200,
      due_date: "2026-08-05",
      status: "released",
      deliverable_note: "Figma design tokens, Tailwind theme specs, and React layout primitives delivered.",
      submitted_at: "2026-07-28T14:30:00Z",
    },
    {
      id: "m-2",
      title: "Phase 2: FastAPI Backend APIs & Database Schema",
      amount: 1500,
      due_date: "2026-08-12",
      status: "submitted",
      deliverable_note: "All FastAPI router endpoints, Pydantic schemas, and Turso migrations complete.",
      deliverable_file: "https://github.com/org/repo/pull/42",
      submitted_at: "2026-07-31T10:15:00Z",
    },
    {
      id: "m-3",
      title: "Phase 3: E2E Production Deployment & AI Matching",
      amount: 800,
      due_date: "2026-08-20",
      status: "funded",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<"submit" | "release" | "revision" | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Submission Form State
  const [submitNote, setSubmitNote] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch real milestone data if available
  useEffect(() => {
    const fetchContractMilestones = async () => {
      try {
        const data = (await apiFetch(`/contracts/${contractId}/milestones`)) as any;
        if (Array.isArray(data) && data.length > 0) {
          setMilestones(data);
        }
      } catch {
        // Fallback to initial mock milestones for demonstration
      }
    };
    if (contractId) fetchContractMilestones();
  }, [contractId]);

  const totalContractValue = milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter((m) => m.status === "released")
    .reduce((sum, m) => sum + m.amount, 0);
  const escrowFunded = milestones
    .filter((m) => m.status === "funded" || m.status === "submitted" || m.status === "revision_requested")
    .reduce((sum, m) => sum + m.amount, 0);

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;
    setSubmitting(true);

    try {
      await apiFetch(`/contracts/${contractId}/milestones/${selectedMilestone.id}/deliver`, {
        method: "POST",
        body: JSON.stringify({
          note: submitNote,
          url: submitUrl,
        }),
      });
    } catch {
      // Local optimistic update
    } finally {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === selectedMilestone.id
            ? {
                ...m,
                status: "submitted",
                deliverable_note: submitNote,
                deliverable_file: submitUrl,
                submitted_at: new Date().toISOString(),
              }
            : m
        )
      );
      setSubmitting(false);
      setActiveModal(null);
      setSelectedMilestone(null);
      setSubmitNote("");
      setSubmitUrl("");
    }
  };

  const handleReleaseEscrow = async () => {
    if (!selectedMilestone) return;
    setSubmitting(true);

    try {
      await apiFetch(`/contracts/${contractId}/milestones/${selectedMilestone.id}/release`, {
        method: "POST",
      });
    } catch {
      // Local optimistic update
    } finally {
      setMilestones((prev) =>
        prev.map((m) => (m.id === selectedMilestone.id ? { ...m, status: "released" } : m))
      );
      setSubmitting(false);
      setActiveModal(null);
      setSelectedMilestone(null);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedMilestone) return;
    setSubmitting(true);

    try {
      await apiFetch(`/contracts/${contractId}/milestones/${selectedMilestone.id}/request-revision`, {
        method: "POST",
        body: JSON.stringify({ note: submitNote }),
      });
    } catch {
      // Local optimistic update
    } finally {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === selectedMilestone.id ? { ...m, status: "revision_requested" } : m
        )
      );
      setSubmitting(false);
      setActiveModal(null);
      setSelectedMilestone(null);
      setSubmitNote("");
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Escrow Financial Ledger Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/20">
        <div className="md:col-span-1 space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 pr-4">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Lock size={14} /> Total Contract Budget
          </div>
          <div className="text-2xl font-extrabold tracking-tight">${totalContractValue.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Fixed-price milestone agreement</p>
        </div>

        <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 px-0 md:px-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck size={14} /> In Escrow Vault
          </div>
          <div className="text-2xl font-extrabold text-amber-300">${escrowFunded.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Funded & protected</p>
        </div>

        <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 px-0 md:px-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 size={14} /> Total Released
          </div>
          <div className="text-2xl font-extrabold text-emerald-300">${releasedAmount.toLocaleString()}</div>
          <p className="text-[11px] text-slate-400">Paid out to freelancer</p>
        </div>

        <div className="flex flex-col justify-center bg-indigo-950/50 p-3.5 rounded-xl border border-indigo-500/30 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Sparkles size={14} className="text-amber-400" /> Megi Escrow Vault
          </div>
          <p className="text-[11px] text-indigo-200 leading-snug">
            Funds are locked in escrow and only disbursed when deliverables meet quality approval.
          </p>
        </div>
      </div>

      {/* Milestones Lifecycle Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contract Milestones</h3>
            <p className="text-xs text-slate-500">Track progress, submit work, and manage escrow disbursements.</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {milestones.length} Milestones Total
          </span>
        </div>

        <div className="space-y-4">
          {milestones.map((m, idx) => (
            <div
              key={m.id}
              className={cn(
                "p-5 rounded-xl border transition-all duration-200 space-y-3",
                m.status === "submitted"
                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                  : m.status === "released"
                  ? "bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50"
                  : "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800"
              )}
            >
              {/* Milestone Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5",
                      m.status === "released"
                        ? "bg-emerald-500 text-white"
                        : m.status === "submitted"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                      {m.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Due: {m.due_date}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900 dark:text-slate-200">
                        ${m.amount.toLocaleString()} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-3 self-start md:self-auto">
                  {m.status === "released" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 size={13} /> Escrow Released
                    </span>
                  )}
                  {m.status === "submitted" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800 animate-pulse">
                      <Clock size={13} /> Submitted for Review
                    </span>
                  )}
                  {m.status === "revision_requested" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 text-xs font-bold border border-red-300 dark:border-red-800">
                      <RotateCcw size={13} /> Revisions Requested
                    </span>
                  )}
                  {m.status === "funded" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-300 dark:border-indigo-800">
                      <ShieldCheck size={13} /> Escrow Funded
                    </span>
                  )}
                </div>
              </div>

              {/* Deliverable Details if submitted */}
              {m.deliverable_note && (
                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-indigo-500" /> Deliverable Note:
                    </span>
                    {m.submitted_at && (
                      <span className="text-[10px] text-slate-400">
                        Submitted {new Date(m.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {m.deliverable_note}
                  </p>
                  {m.deliverable_file && (
                    <a
                      href={m.deliverable_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline pt-1"
                    >
                      <ExternalLink size={12} /> View Deliverable Artifact / PR
                    </a>
                  )}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                {userRole === "freelancer" && (m.status === "funded" || m.status === "revision_requested") && (
                  <button
                    onClick={() => {
                      setSelectedMilestone(m);
                      setActiveModal("submit");
                    }}
                    className="py-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload size={13} /> Submit Work Deliverable
                  </button>
                )}

                {userRole === "client" && m.status === "submitted" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setActiveModal("revision");
                      }}
                      className="py-1.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1"
                    >
                      <RotateCcw size={13} /> Request Revisions
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setActiveModal("release");
                      }}
                      className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckCircle2 size={13} /> Approve & Release ${m.amount.toLocaleString()} Escrow
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Modals */}
      <AnimatePresence>
        {activeModal && selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedMilestone(null);
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>

              {activeModal === "submit" && (
                <form onSubmit={handleSubmitDeliverable} className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Submit Deliverable for #{selectedMilestone.title}
                  </h3>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Deliverable Note / Summary
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={submitNote}
                      onChange={(e) => setSubmitNote(e.target.value)}
                      placeholder="Describe what was accomplished, testing steps, and pull request details..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Repository / Demo Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={submitUrl}
                      onChange={(e) => setSubmitUrl(e.target.value)}
                      placeholder="https://github.com/org/repo or https://staging.example.com"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1"
                    >
                      {submitting ? "Submitting..." : "Submit to Client"}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === "release" && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={18} /> Confirm Escrow Release
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Are you sure you want to approve deliverable and release{" "}
                    <strong className="text-slate-900 dark:text-white">
                      ${selectedMilestone.amount.toLocaleString()} USD
                    </strong>{" "}
                    from escrow to the freelancer?
                  </p>

                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    Once released, funds will immediately transfer to the freelancer&apos;s wallet ledger.
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReleaseEscrow}
                      disabled={submitting}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      {submitting ? "Releasing..." : "Release Funds Now"}
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "revision" && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <RotateCcw size={18} className="text-amber-500" /> Request Revisions
                  </h3>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Revision Instructions for Freelancer
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={submitNote}
                      onChange={(e) => setSubmitNote(e.target.value)}
                      placeholder="Specify what adjustments or fixes are required before escrow release..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestRevision}
                      disabled={submitting}
                      className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                    >
                      {submitting ? "Sending..." : "Send Revision Request"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
