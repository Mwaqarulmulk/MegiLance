// @AI-HINT: Upwork-style Proposal Comparison Matrix for Clients to evaluate and compare freelancer bids.
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  MessageSquare,
  Award,
  ChevronDown,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProposalItem } from "@/app/types/portal";

export type { ProposalItem };

interface ProposalComparisonMatrixProps {
  proposals: ProposalItem[];
  onAwardProject?: (proposal: ProposalItem) => void;
  onMessageFreelancer?: (proposal: ProposalItem) => void;
}

export default function ProposalComparisonMatrix({
  proposals,
  onAwardProject,
  onMessageFreelancer,
}: ProposalComparisonMatrixProps) {
  const [shortlisted, setShortlisted] = useState<Record<string | number, boolean>>({});

  const toggleShortlist = (id: string | number) => {
    setShortlisted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!proposals || proposals.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
        <FileText size={36} className="mx-auto text-slate-400 mb-2" />
        <h4 className="font-bold text-slate-800 dark:text-slate-200">No Proposals Received Yet</h4>
        <p className="text-xs text-slate-500 mt-1">Proposals submitted by freelancers will appear here for side-by-side evaluation.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Proposal Evaluation Matrix</h3>
          <p className="text-xs text-slate-500">Side-by-side bid breakdown, AI fit scores, and 1-click contract awards.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          {proposals.length} Proposals Submitted
        </span>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {proposals.map((prop) => (
          <motion.div
            key={prop.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative",
              shortlisted[prop.id]
                ? "border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/50"
                : "border-slate-200 dark:border-slate-800"
            )}
          >
            {/* Header / Freelancer Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                    {prop.freelancer_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {prop.freelancer_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{prop.headline}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleShortlist(prop.id)}
                  title="Shortlist proposal"
                  className={cn(
                    "p-1.5 rounded-lg border text-xs transition-all",
                    shortlisted[prop.id]
                      ? "bg-amber-100 text-amber-600 border-amber-300 dark:bg-amber-950 dark:text-amber-400"
                      : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                  )}
                >
                  ★
                </button>
              </div>

              {/* Bid Amount & Delivery */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Proposed Bid</div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${prop.bid_amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Est. Delivery</div>
                  <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {prop.delivery_days} Days
                  </div>
                </div>
              </div>

              {/* AI Match Fit */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
                  <Zap size={14} className="text-indigo-500 fill-indigo-500" /> AI Fit Match
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {prop.ai_fit_score}%
                </span>
              </div>

              {/* Cover Letter Excerpt */}
              <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                &quot;{prop.cover_letter}&quot;
              </div>

              {/* Milestones Proposed */}
              {prop.milestones_proposed && prop.milestones_proposed.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Milestone Schedule ({prop.milestones_proposed.length}):
                  </span>
                  <div className="space-y-1 text-[11px]">
                    {prop.milestones_proposed.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded bg-slate-100/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      >
                        <span className="truncate max-w-[170px]">{m.title}</span>
                        <span className="font-bold text-slate-900 dark:text-white">${m.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onMessageFreelancer && onMessageFreelancer(prop)}
                className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1"
              >
                <MessageSquare size={13} /> Chat
              </button>
              <button
                onClick={() => onAwardProject && onAwardProject(prop)}
                className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Award size={13} /> Award & Fund Escrow
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
