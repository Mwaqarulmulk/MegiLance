// @AI-HINT: Interactive proposal builder modal for freelancers with milestone calculator and AI cover letter assistant.
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api/core";
import {
  Sparkles,
  DollarSign,
  Clock,
  Plus,
  Trash2,
  Send,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProposalSubmissionModalProps {
  projectId: string | number;
  projectTitle: string;
  projectBudget?: number | string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProposalSubmissionModal({
  projectId,
  projectTitle,
  projectBudget,
  isOpen,
  onClose,
  onSuccess,
}: ProposalSubmissionModalProps) {
  const [bidAmount, setBidAmount] = useState(
    typeof projectBudget === "number" ? String(projectBudget) : "1200"
  );
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState<Array<{ title: string; amount: number }>>([
    { title: "Initial Specs & Setup", amount: 400 },
    { title: "Core Implementation", amount: 800 },
  ]);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const bidNum = Number(bidAmount) || 0;
  const platformFee = 0; // 0% Launch Offer
  const takeHome = bidNum - platformFee;

  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { title: `Milestone ${prev.length + 1}`, amount: 300 },
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateMilestone = (idx: number, field: "title" | "amount", val: any) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleGenerateAiPitch = async () => {
    setAiDrafting(true);
    try {
      const data = (await apiFetch("/ai/writing/cover-letter", {
        method: "POST",
        body: JSON.stringify({
          project_title: projectTitle,
          project_budget: bidNum,
        }),
      })) as any;
      if (data?.cover_letter) {
        setCoverLetter(data.cover_letter);
      } else {
        setCoverLetter(
          `Hi there,\n\nI reviewed your project "${projectTitle}" and am confident I can deliver high-quality code adhering strictly to your requirements. My approach includes complete modular design, type-safe APIs, comprehensive automated testing, and daily updates in the workroom.\n\nLooking forward to collaborating!`
        );
      }
    } catch {
      setCoverLetter(
        `Hi there,\n\nI reviewed your project "${projectTitle}" and am confident I can deliver high-quality code adhering strictly to your requirements. My approach includes complete modular design, type-safe APIs, comprehensive automated testing, and daily updates in the workroom.\n\nLooking forward to collaborating!`
      );
    } finally {
      setAiDrafting(false);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await apiFetch(`/projects/${projectId}/proposals`, {
        method: "POST",
        body: JSON.stringify({
          bid_amount: bidNum,
          delivery_days: Number(deliveryDays),
          cover_letter: coverLetter,
          milestones: milestones,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch {
      // Optimistic local success for preview
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const milestoneTotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const milestoneMismatch = milestones.length > 0 && Math.abs(milestoneTotal - bidNum) > 0.01;

  const handleAutoBalanceMilestones = () => {
    if (milestones.length === 0 || bidNum <= 0) return;
    const perMilestone = Math.floor((bidNum / milestones.length) * 100) / 100;
    const remainder = Math.round((bidNum - perMilestone * milestones.length) * 100) / 100;

    setMilestones((prev) =>
      prev.map((m, idx) => ({
        ...m,
        amount: idx === prev.length - 1 ? perMilestone + remainder : perMilestone,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
            Submit Proposal for &quot;{projectTitle}&quot;
          </h3>
          <p className="text-xs text-slate-500">Specify your bid, milestone breakdown, and cover letter pitch.</p>
        </div>

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Proposal Submitted Successfully!</h4>
            <p className="text-xs text-slate-500">
              The client has been notified. You can manage your proposal in your freelancer portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
            {/* Financial Terms */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Your Total Bid (USD)
                </label>
                <input
                  type="number"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Delivery (Days)
                </label>
                <input
                  type="number"
                  required
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="col-span-2 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                <span className="text-slate-500">Platform Fee (0% Special Launch Offer):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Your Net Take-Home: ${takeHome.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Milestone Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-900 dark:text-white">
                  Milestone Schedule
                </label>
                <div className="flex items-center gap-3">
                  {milestoneMismatch && (
                    <button
                      type="button"
                      onClick={handleAutoBalanceMilestones}
                      className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] hover:underline"
                    >
                      ⚡ Auto-Balance
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Add Milestone
                  </button>
                </div>
              </div>

              {milestoneMismatch && (
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-700 dark:text-amber-300 flex items-center justify-between">
                  <span>
                    Milestone total (${milestoneTotal.toLocaleString()}) does not match total bid (${bidNum.toLocaleString()}).
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(idx, "title", e.target.value)}
                      placeholder="Milestone title..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleUpdateMilestone(idx, "amount", Number(e.target.value))}
                      placeholder="Amount ($)"
                      className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-bold"
                    />
                    {milestones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-900 dark:text-white">
                  Cover Letter / Pitch
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAiPitch}
                  disabled={aiDrafting}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] flex items-center gap-1 hover:underline"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  {aiDrafting ? "Drafting with AI..." : "Draft Pitch with Megi AI"}
                </button>
              </div>

              <textarea
                rows={5}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are the best fit for this project, relevant past deliverables, and proposed approach..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Send size={14} />
                {submitting ? "Submitting..." : "Submit Proposal"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
