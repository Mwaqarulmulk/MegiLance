// @AI-HINT: Contract detail page — shows contract info, parties, amount, milestones, workroom link, and contract actions.
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { contractsApi, milestonesApi } from "@/lib/api/projects";
import { apiFetch } from "@/lib/api/core";
import { useAuth } from "@/hooks/useAuth";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import Button from "@/app/components/atoms/Button/Button";
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  DollarSign,
  Calendar,
  User,
  Briefcase,
  ExternalLink,
} from "lucide-react";

import commonStyles from "./ContractDetail.common.module.css";
import lightStyles from "./ContractDetail.light.module.css";
import darkStyles from "./ContractDetail.dark.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Milestone {
  id: number;
  title?: string;
  description?: string;
  amount?: number;
  status?: string;
  due_date?: string;
}

interface ContractData {
  id: number;
  title?: string;
  description?: string;
  status?: string;
  budget?: number;
  amount?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  client_id?: number;
  freelancer_id?: number;
  client_name?: string;
  freelancer_name?: string;
  client_email?: string;
  freelancer_email?: string;
  milestones?: Milestone[];
  rate_type?: string;
  rate?: number;
  terms?: string;
  freelancer_acknowledged?: boolean | number;
  [key: string]: unknown;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusClass(
  status: string | undefined,
  themeStyles: Record<string, string>,
): string {
  switch ((status || "").toLowerCase()) {
    case "active":
      return themeStyles.statusActive;
    case "completed":
      return themeStyles.statusCompleted;
    case "pending":
      return themeStyles.statusPending;
    case "cancelled":
      return themeStyles.statusCancelled;
    default:
      return themeStyles.statusDefault;
  }
}

function getMilestoneBadgeClass(
  status: string | undefined,
  themeStyles: Record<string, string>,
): string {
  switch ((status || "").toLowerCase()) {
    case "completed":
    case "approved":
      return themeStyles.milestoneBadgeCompleted;
    case "active":
    case "in_progress":
      return themeStyles.milestoneBadgeActive;
    default:
      return themeStyles.milestoneBadgePending;
  }
}

function StatusIcon({ status }: { status: string | undefined }) {
  switch ((status || "").toLowerCase()) {
    case "active":
      return <CheckCircle2 size={14} />;
    case "completed":
      return <CheckCircle2 size={14} />;
    case "pending":
      return <Clock size={14} />;
    case "cancelled":
      return <XCircle size={14} />;
    default:
      return <AlertCircle size={14} />;
  }
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonLoader({
  themeStyles,
}: {
  themeStyles: Record<string, string>;
}) {
  return (
    <div className={commonStyles.container}>
      <div className={commonStyles.header}>
        <div
          className={cn(
            commonStyles.skeleton,
            commonStyles.skeletonTitle,
            themeStyles.skeleton,
          )}
          style={{ width: 80, height: 36 }}
        />
        <div className={commonStyles.headerMeta}>
          <div
            className={cn(
              commonStyles.skeleton,
              commonStyles.skeletonTitle,
              themeStyles.skeleton,
            )}
          />
          <div
            className={cn(
              commonStyles.skeleton,
              commonStyles.skeletonLine,
              themeStyles.skeleton,
            )}
            style={{ width: "40%" }}
          />
        </div>
      </div>
      <div className={commonStyles.grid}>
        <div
          className={cn(
            commonStyles.skeleton,
            commonStyles.skeletonCard,
            themeStyles.skeleton,
          )}
        />
        <div
          className={cn(
            commonStyles.skeleton,
            commonStyles.skeletonCard,
            themeStyles.skeleton,
          )}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = params.contractId as string;
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const toaster = useToaster();

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // mounted prevents hydration flash (same pattern as WorkroomClient)
  const [mounted, setMounted] = useState(false);

  // ── Action states ──────────────────────────────────────────────────────────
  const [completing, setCompleting] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);

  // ── Escrow state (P1-4) ───────────────────────────────────────────────────
  const [escrowStatus, setEscrowStatus] = useState<any>(null);
  const [fundingEscrow, setFundingEscrow] = useState(false);
  const [releasingEscrow, setReleasingEscrow] = useState(false);

  // ── Dispute modal state ────────────────────────────────────────────────────
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // ── Milestone management state ─────────────────────────────────────────────
  const [apiMilestones, setApiMilestones] = useState<any[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    amount: 0,
    description: "",
  });
  const [addingMilestone, setAddingMilestone] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!contractId) return;
    const fetchContract = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await contractsApi.get(contractId);
        setContract(data as ContractData);
      } catch (err: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load contract:", err);
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load contract details.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [contractId]);

  // Load milestones from API (separate from contract's embedded milestones)
  useEffect(() => {
    if (!contractId) return;
    milestonesApi
      .list(contractId)
      .then((data: any) => {
        setApiMilestones(data?.items || data || []);
      })
      .catch(() => {});
  }, [contractId, contract]);

  // Fetch escrow status (P1-4)
  useEffect(() => {
    if (!contractId) return;
    apiFetch(`/escrow?contract_id=${contractId}`)
      .then((data: any) => setEscrowStatus(data?.items?.[0] || data || null))
      .catch(() => {});
  }, [contractId]);

  // Safe fallback: use light theme until theme is resolved
  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;

  // Prevent hydration flash — render nothing until client has mounted
  if (!mounted) return null;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <SkeletonLoader themeStyles={themeStyles} />
      </div>
    );
  }

  // ── Error / not found state ────────────────────────────────────────────────
  if (error || !contract) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <div className={commonStyles.container}>
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
            <div className={cn(commonStyles.emptyIcon, themeStyles.emptyIcon)}>
              <FileText size={28} />
            </div>
            <h2 className={cn(commonStyles.emptyTitle, themeStyles.emptyTitle)}>
              Contract Not Found
            </h2>
            <p
              className={cn(
                commonStyles.emptySubtitle,
                themeStyles.emptySubtitle,
              )}
            >
              {error ||
                "This contract doesn't exist or you don't have access to it."}
            </p>
            <Button variant="primary" onClick={() => router.push("/contracts")}>
              Back to Contracts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Role detection ─────────────────────────────────────────────────────────
  const isClient = user?.user_type === "client";
  const isFreelancer = user?.user_type === "freelancer";

  // ── Derived values ─────────────────────────────────────────────────────────
  const statusClass = getStatusClass(contract.status, themeStyles);
  const contractMilestones: Milestone[] = contract.milestones || [];
  const totalMilestones = contractMilestones.length;
  const completedMilestones = contractMilestones.filter((m) =>
    ["completed", "approved"].includes((m.status || "").toLowerCase()),
  ).length;

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleCompleteContract = async () => {
    if (
      !confirm(
        "Mark this contract as complete? This will release escrow funds to the freelancer.",
      )
    )
      return;
    setCompleting(true);
    try {
      await contractsApi.complete(contractId);
      const updated = await contractsApi.get(contractId);
      setContract(updated as any);
      toaster.notify({
        title: "Contract marked as complete",
        variant: "success",
      });
    } catch {
      toaster.notify({
        title: "Failed to complete contract",
        variant: "danger",
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    try {
      await apiFetch(`/contracts/${contractId}/acknowledge`, {
        method: "POST",
      });
      const updated = await contractsApi.get(contractId);
      setContract(updated as any);
      toaster.notify({
        title: "Contract acknowledged! You may now begin work.",
        variant: "success",
      });
    } catch {
      toaster.notify({
        title: "Failed to acknowledge contract",
        description: "Please try again. If the problem continues, contact support.",
        variant: "danger",
      });
    } finally {
      setAcknowledging(false);
    }
  };

  const handleFileDispute = async () => {
    if (!disputeReason || !disputeDescription) return;
    setSubmittingDispute(true);
    try {
      await apiFetch("/disputes", {
        method: "POST",
        body: JSON.stringify({
          contract_id: contractId,
          dispute_type: disputeReason,
          description: disputeDescription,
        }),
      });
      setShowDisputeModal(false);
      setDisputeReason("");
      setDisputeDescription("");
      toaster.notify({
        title: "Dispute filed successfully",
        variant: "success",
      });
    } catch {
      toaster.notify({ title: "Failed to file dispute", variant: "danger" });
    } finally {
      setSubmittingDispute(false);
    }
  };

  const refreshMilestones = async () => {
    const refreshed = await milestonesApi.list(contractId);
    setApiMilestones((refreshed as any)?.items || refreshed || []);
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.amount) return;
    setAddingMilestone(true);
    try {
      await milestonesApi.create({
        project_id: (contract as any).project_id ?? contractId,
        contract_id: contractId,
        title: newMilestone.title,
        amount: newMilestone.amount,
        description: newMilestone.description,
      } as any);
      await refreshMilestones();
      setNewMilestone({ title: "", amount: 0, description: "" });
      setShowAddMilestone(false);
    } catch {
      toaster.notify({
        title: "Failed to add milestone",
        description: "The milestone was not saved. Please try again.",
        variant: "danger",
      });
    } finally {
      setAddingMilestone(false);
    }
  };

  const handleSubmitMilestone = async (id: number | string) => {
    const notes = prompt("Describe the work submitted:");
    if (!notes) return;
    try {
      await milestonesApi.submit(id, {
        deliverables: notes,
        submission_notes: notes,
      });
      await refreshMilestones();
    } catch {
      toaster.notify({
        title: "Failed to submit milestone",
        description: "Your submission was not saved. Please try again.",
        variant: "danger",
      });
    }
  };

  const handleApproveMilestone = async (id: number | string) => {
    try {
      await milestonesApi.approve(id, { approval_notes: "Approved" });
      await refreshMilestones();
    } catch {
      toaster.notify({
        title: "Failed to approve milestone",
        description: "The approval was not saved. Please try again.",
        variant: "danger",
      });
    }
  };

  const handleRejectMilestone = async (id: number | string) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    try {
      await milestonesApi.reject(id, reason);
      await refreshMilestones();
    } catch {
      toaster.notify({
        title: "Failed to reject milestone",
        description: "The rejection was not saved. Please try again.",
        variant: "danger",
      });
    }
  };

  // ── Escrow handlers (P1-4) ────────────────────────────────────────────────
  const handleFundEscrow = async () => {
    const contractValue = contract?.amount ?? contract?.budget;
    if (
      !confirm(
        `Fund escrow with $${contractValue?.toLocaleString()}? This will deduct from your wallet.`,
      )
    )
      return;
    setFundingEscrow(true);
    try {
      const escrowData = await apiFetch("/escrow", {
        method: "POST",
        body: JSON.stringify({
          contract_id: contractId,
          amount: contractValue,
          freelancer_id: contract?.freelancer_id,
        }),
      });
      setEscrowStatus(escrowData);
      toaster.notify({
        title: "Escrow funded successfully!",
        variant: "success",
      });
    } catch (e: any) {
      toaster.notify({
        title: e?.message || "Failed to fund escrow",
        variant: "danger",
      });
    } finally {
      setFundingEscrow(false);
    }
  };

  const handleReleaseEscrow = async () => {
    if (
      !confirm("Release escrow funds to the freelancer? This cannot be undone.")
    )
      return;
    setReleasingEscrow(true);
    try {
      await apiFetch(`/escrow/${escrowStatus?.id}/release`, { method: "POST" });
      const updated = await apiFetch(`/escrow?contract_id=${contractId}`);
      setEscrowStatus((updated as any)?.items?.[0] || updated);
      toaster.notify({
        title: "Funds released to freelancer!",
        variant: "success",
      });
    } catch (e: any) {
      toaster.notify({
        title: e?.message || "Failed to release escrow",
        variant: "danger",
      });
    } finally {
      setReleasingEscrow(false);
    }
  };

  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <div className={commonStyles.container}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={commonStyles.header}>
          <div className={commonStyles.backBtn}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/contracts")}
              aria-label="Back to contracts"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </div>

          <div className={commonStyles.headerMeta}>
            <h1
              className={cn(
                commonStyles.contractTitle,
                themeStyles.contractTitle,
              )}
            >
              {contract.title || `Contract #${contract.id}`}
            </h1>
            <div className={commonStyles.metaRow}>
              <span className={cn(commonStyles.statusBadge, statusClass)}>
                <StatusIcon status={contract.status} />
                {contract.status || "Unknown"}
              </span>
              {contract.created_at && (
                <span
                  className={cn(commonStyles.metaChip, themeStyles.metaChip)}
                >
                  <Calendar size={11} />
                  Created {formatDate(contract.created_at)}
                </span>
              )}
              {contract.rate_type && (
                <span
                  className={cn(commonStyles.metaChip, themeStyles.metaChip)}
                >
                  {contract.rate_type === "hourly" ? "Hourly" : "Fixed price"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Action bar ───────────────────────────────────────────────── */}
        {(isClient || isFreelancer) && (
          <div className={cn(commonStyles.actionBar, themeStyles.actionBar)}>
            {/* Mark as Complete — client only, active contracts */}
            {isClient && contract.status === "active" && (
              <Button
                variant="success"
                onClick={handleCompleteContract}
                isLoading={completing}
              >
                ✓ Mark as Complete
              </Button>
            )}

            {/* Write a Review — both parties, completed contracts */}
            {contract.status === "completed" && (
              <Button
                variant="primary"
                onClick={() => router.push(`/contracts/${contractId}/review`)}
              >
                ★ Write a Review
              </Button>
            )}

            {/* Raise Dispute — both parties, active contracts */}
            {(isClient || isFreelancer) && contract.status === "active" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDisputeModal(true)}
              >
                ⚠ Raise Dispute
              </Button>
            )}
          </div>
        )}

        {/* ── Escrow Section (P1-4) — client only ───────────────────── */}
        {isClient && contract && (
          <div
            className={cn(
              commonStyles.escrowSection,
              themeStyles.escrowSection,
            )}
          >
            <h4 className={commonStyles.escrowTitle}>🔒 Escrow</h4>
            <div className={commonStyles.escrowInfo}>
              <span>
                Contract value:{" "}
                <strong>
                  $
                  {(contract.amount ?? contract.budget)?.toLocaleString() ??
                    "—"}
                </strong>
              </span>
              <span
                className={cn(
                  commonStyles.escrowStatus,
                  themeStyles.escrowStatus,
                )}
              >
                {escrowStatus?.status || "Not funded"}
              </span>
            </div>
            {(!escrowStatus || escrowStatus.status === "pending") &&
              contract.status === "active" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleFundEscrow}
                  isLoading={fundingEscrow}
                >
                  💰 Fund Escrow ($
                  {(contract.amount ?? contract.budget)?.toLocaleString() ??
                    "—"}
                  )
                </Button>
              )}
            {escrowStatus?.status === "funded" && (
              <Button
                variant="success"
                size="sm"
                onClick={handleReleaseEscrow}
                isLoading={releasingEscrow}
                disabled={contract.status !== "completed"}
              >
                ✓ Release Funds to Freelancer
              </Button>
            )}
          </div>
        )}

        {/* ── Tab navigation ──────────────────────────────────────────── */}
        <div className={cn(commonStyles.tabs, themeStyles.tabs)}>
          {/* Overview tab — current page */}
          <span
            className={cn(
              commonStyles.tab,
              themeStyles.tab,
              themeStyles.tabActive,
            )}
          >
            <FileText size={15} />
            Overview
          </span>

          {/* Workroom tab — link to workroom sub-page */}
          <Link
            href={`/contracts/${contractId}/workroom`}
            className={cn(commonStyles.tab, themeStyles.tab)}
            aria-label="Open workroom"
          >
            <Briefcase size={15} />
            Workroom
            <ExternalLink size={12} />
          </Link>
        </div>

        {/* ── Freelancer Acknowledge Box ───────────────────────────────── */}
        {isFreelancer &&
          contract.status === "active" &&
          !contract.freelancer_acknowledged && (
            <div
              className={cn(
                commonStyles.acknowledgeBox,
                themeStyles.acknowledgeBox,
              )}
            >
              <p
                className={cn(
                  commonStyles.acknowledgeText,
                  themeStyles.acknowledgeText,
                )}
              >
                Please review and acknowledge the contract terms before starting
                work.
              </p>
              <Button
                variant="primary"
                onClick={handleAcknowledge}
                isLoading={acknowledging}
              >
                ✓ Acknowledge &amp; Start Work
              </Button>
            </div>
          )}

        {/* ── Main content grid ────────────────────────────────────────── */}
        <div className={commonStyles.grid}>
          {/* Left column — details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            {/* Description */}
            {contract.description && (
              <div className={cn(commonStyles.card, themeStyles.card)}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Description
                </h2>
                <p
                  className={cn(
                    commonStyles.description,
                    themeStyles.description,
                  )}
                >
                  {contract.description}
                </p>
              </div>
            )}

            {/* Terms */}
            {contract.terms && (
              <div className={cn(commonStyles.card, themeStyles.card)}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Contract Terms
                </h2>
                <p
                  className={cn(
                    commonStyles.description,
                    themeStyles.description,
                  )}
                >
                  {contract.terms}
                </p>
              </div>
            )}

            {/* Contract Milestones (embedded in contract data) */}
            {totalMilestones > 0 && (
              <div className={cn(commonStyles.card, themeStyles.card)}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Milestones ({completedMilestones}/{totalMilestones})
                </h2>
                <div className={commonStyles.milestoneList}>
                  {contractMilestones.map((m) => {
                    const badgeClass = getMilestoneBadgeClass(
                      m.status,
                      themeStyles,
                    );
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          commonStyles.milestone,
                          themeStyles.milestone,
                        )}
                      >
                        <div className={commonStyles.milestoneIcon}>
                          {["completed", "approved"].includes(
                            (m.status || "").toLowerCase(),
                          ) ? (
                            <CheckCircle2 size={18} color="var(--ml-green)" />
                          ) : (
                            <Clock size={18} color="var(--ml-orange)" />
                          )}
                        </div>
                        <div className={commonStyles.milestoneContent}>
                          <div
                            className={cn(
                              commonStyles.milestoneName,
                              themeStyles.milestoneName,
                            )}
                          >
                            {m.title || m.description || `Milestone #${m.id}`}
                          </div>
                          {m.due_date && (
                            <div
                              className={cn(
                                commonStyles.milestoneAmount,
                                themeStyles.milestoneAmount,
                              )}
                            >
                              Due {formatDate(m.due_date)}
                            </div>
                          )}
                        </div>
                        {m.amount != null && (
                          <span
                            className={cn(
                              commonStyles.milestoneAmount,
                              themeStyles.milestoneAmount,
                            )}
                          >
                            ${m.amount.toLocaleString()}
                          </span>
                        )}
                        <span
                          className={cn(
                            commonStyles.milestoneBadge,
                            badgeClass,
                          )}
                        >
                          {m.status || "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Milestone Management (API milestones) ────────────────── */}
            <div className={cn(commonStyles.card, themeStyles.card)}>
              <div className={commonStyles.sectionHeader}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Milestone Tracking
                </h2>
                {isClient && contract.status === "active" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddMilestone(true)}
                  >
                    + Add Milestone
                  </Button>
                )}
              </div>

              {apiMilestones.length === 0 ? (
                <p
                  className={cn(commonStyles.emptyText, themeStyles.emptyText)}
                >
                  No milestones yet.
                </p>
              ) : (
                <div className={commonStyles.milestoneList}>
                  {apiMilestones.map((m: any) => (
                    <div
                      key={m.id}
                      className={cn(
                        commonStyles.milestoneCard,
                        themeStyles.milestoneCard,
                      )}
                    >
                      <div
                        className={cn(
                          commonStyles.milestoneName,
                          themeStyles.milestoneName,
                        )}
                      >
                        {m.title}
                      </div>
                      <div
                        className={cn(
                          commonStyles.milestoneAmount,
                          themeStyles.milestoneAmount,
                        )}
                      >
                        ${m.amount?.toLocaleString()}
                      </div>
                      <span
                        className={cn(
                          commonStyles.milestoneBadge,
                          getMilestoneBadgeClass(m.status, themeStyles),
                        )}
                      >
                        {m.status}
                      </span>
                      <div className={commonStyles.milestoneActions}>
                        {isFreelancer && m.status === "pending" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleSubmitMilestone(m.id)}
                          >
                            Submit Work
                          </Button>
                        )}
                        {isClient && m.status === "submitted" && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveMilestone(m.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectMilestone(m.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Milestone Form */}
              {showAddMilestone && (
                <div
                  className={cn(
                    commonStyles.milestoneForm,
                    themeStyles.milestoneForm,
                  )}
                >
                  <input
                    placeholder="Milestone title"
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone((p) => ({
                        ...p,
                        title: e.target.value,
                      }))
                    }
                    className={cn(
                      commonStyles.milestoneInput,
                      themeStyles.milestoneInput,
                    )}
                  />
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={newMilestone.amount || ""}
                    onChange={(e) =>
                      setNewMilestone((p) => ({
                        ...p,
                        amount: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className={cn(
                      commonStyles.milestoneInput,
                      themeStyles.milestoneInput,
                    )}
                  />
                  <textarea
                    placeholder="Description"
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className={cn(
                      commonStyles.milestoneTextarea,
                      themeStyles.milestoneTextarea,
                    )}
                    rows={2}
                  />
                  <div className={commonStyles.milestoneFormActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddMilestone}
                      isLoading={addingMilestone}
                    >
                      Add Milestone
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddMilestone(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column — sidebar */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-lg)",
            }}
          >
            {/* Amount / dates */}
            <div className={cn(commonStyles.card, themeStyles.card)}>
              <h2 className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}>
                Contract Details
              </h2>

              <div className={commonStyles.statsRow}>
                <div className={cn(commonStyles.statBox, themeStyles.statBox)}>
                  <div
                    className={cn(
                      commonStyles.statValue,
                      themeStyles.statValue,
                    )}
                  >
                    <DollarSign
                      size={16}
                      style={{ display: "inline", verticalAlign: "middle" }}
                    />
                    {contract.budget != null
                      ? contract.budget.toLocaleString()
                      : contract.rate != null
                        ? `${contract.rate}${contract.rate_type === "hourly" ? "/hr" : ""}`
                        : "—"}
                  </div>
                  <div
                    className={cn(
                      commonStyles.statLabel,
                      themeStyles.statLabel,
                    )}
                  >
                    {contract.rate_type === "hourly" ? "Rate" : "Budget"}
                  </div>
                </div>

                <div className={cn(commonStyles.statBox, themeStyles.statBox)}>
                  <div
                    className={cn(
                      commonStyles.statValue,
                      themeStyles.statValue,
                    )}
                  >
                    {totalMilestones > 0
                      ? `${completedMilestones}/${totalMilestones}`
                      : apiMilestones.length > 0
                        ? `${apiMilestones.filter((m: any) => ["completed", "approved"].includes((m.status || "").toLowerCase())).length}/${apiMilestones.length}`
                        : "—"}
                  </div>
                  <div
                    className={cn(
                      commonStyles.statLabel,
                      themeStyles.statLabel,
                    )}
                  >
                    Milestones
                  </div>
                </div>
              </div>

              <div
                className={commonStyles.sectionDivider}
                style={{
                  background:
                    resolvedTheme === "dark"
                      ? "var(--border-dark)"
                      : "var(--border-light)",
                }}
              />

              {contract.start_date && (
                <div
                  className={cn(commonStyles.metaChip, themeStyles.metaChip)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    marginBottom: "var(--spacing-xs)",
                    width: "100%",
                  }}
                >
                  <span>Start date</span>
                  <strong>{formatDate(contract.start_date)}</strong>
                </div>
              )}
              {contract.end_date && (
                <div
                  className={cn(commonStyles.metaChip, themeStyles.metaChip)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--spacing-sm) var(--spacing-md)",
                    width: "100%",
                  }}
                >
                  <span>End date</span>
                  <strong>{formatDate(contract.end_date)}</strong>
                </div>
              )}
            </div>

            {/* Client info */}
            {(contract.client_name || contract.client_id) && (
              <div className={cn(commonStyles.card, themeStyles.card)}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Client
                </h2>
                <div
                  className={cn(commonStyles.partyCard, themeStyles.partyCard)}
                >
                  <div
                    className={cn(
                      commonStyles.partyAvatar,
                      themeStyles.partyAvatar,
                    )}
                  >
                    {getInitials(contract.client_name)}
                  </div>
                  <div className={commonStyles.partyInfo}>
                    <div
                      className={cn(
                        commonStyles.partyLabel,
                        themeStyles.partyLabel,
                      )}
                    >
                      <User size={10} style={{ display: "inline" }} /> Client
                    </div>
                    <div
                      className={cn(
                        commonStyles.partyName,
                        themeStyles.partyName,
                      )}
                    >
                      {contract.client_name || `Client #${contract.client_id}`}
                    </div>
                    {contract.client_email && (
                      <div
                        className={cn(
                          commonStyles.partyLabel,
                          themeStyles.partyLabel,
                        )}
                        style={{ textTransform: "none" }}
                      >
                        {contract.client_email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Freelancer info */}
            {(contract.freelancer_name || contract.freelancer_id) && (
              <div className={cn(commonStyles.card, themeStyles.card)}>
                <h2
                  className={cn(commonStyles.cardTitle, themeStyles.cardTitle)}
                >
                  Freelancer
                </h2>
                <div
                  className={cn(commonStyles.partyCard, themeStyles.partyCard)}
                >
                  <div
                    className={cn(
                      commonStyles.partyAvatar,
                      themeStyles.partyAvatar,
                    )}
                  >
                    {getInitials(contract.freelancer_name)}
                  </div>
                  <div className={commonStyles.partyInfo}>
                    <div
                      className={cn(
                        commonStyles.partyLabel,
                        themeStyles.partyLabel,
                      )}
                    >
                      <Briefcase size={10} style={{ display: "inline" }} />{" "}
                      Freelancer
                    </div>
                    <div
                      className={cn(
                        commonStyles.partyName,
                        themeStyles.partyName,
                      )}
                    >
                      {contract.freelancer_name ||
                        `Freelancer #${contract.freelancer_id}`}
                    </div>
                    {contract.freelancer_email && (
                      <div
                        className={cn(
                          commonStyles.partyLabel,
                          themeStyles.partyLabel,
                        )}
                        style={{ textTransform: "none" }}
                      >
                        {contract.freelancer_email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick action */}
            <Link
              href={`/contracts/${contractId}/workroom`}
              style={{ textDecoration: "none" }}
            >
              <Button variant="primary" fullWidth>
                <Briefcase size={16} />
                Open Workroom
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Dispute Modal ────────────────────────────────────────────── */}
        {showDisputeModal && (
          <div
            className={commonStyles.disputeOverlay}
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDisputeModal(false);
            }}
          >
            <div
              className={cn(
                commonStyles.disputeModal,
                themeStyles.disputeModal,
              )}
            >
              <div
                className={cn(
                  commonStyles.disputeModalHeader,
                  themeStyles.disputeModalHeader,
                )}
              >
                <h2
                  className={cn(
                    commonStyles.disputeModalTitle,
                    themeStyles.disputeModalTitle,
                  )}
                >
                  ⚠ Raise a Dispute
                </h2>
                <button
                  className={cn(
                    commonStyles.modalClose,
                    themeStyles.modalClose,
                  )}
                  onClick={() => setShowDisputeModal(false)}
                  aria-label="Close dispute modal"
                >
                  ×
                </button>
              </div>

              <div className={commonStyles.disputeModalBody}>
                <div className={commonStyles.formGroup}>
                  <label
                    className={cn(
                      commonStyles.formLabel,
                      themeStyles.formLabel,
                    )}
                  >
                    Reason for Dispute
                  </label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className={cn(
                      commonStyles.formSelect,
                      themeStyles.formSelect,
                    )}
                  >
                    <option value="">Select a reason...</option>
                    <option value="quality">Quality Issues</option>
                    <option value="incomplete">Incomplete Work</option>
                    <option value="missed_deadline">Missed Deadline</option>
                    <option value="communication">Communication Issues</option>
                    <option value="payment">Payment Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={commonStyles.formGroup}>
                  <label
                    className={cn(
                      commonStyles.formLabel,
                      themeStyles.formLabel,
                    )}
                  >
                    Description
                  </label>
                  <textarea
                    value={disputeDescription}
                    onChange={(e) => setDisputeDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    rows={4}
                    className={cn(
                      commonStyles.formTextarea,
                      themeStyles.formTextarea,
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  commonStyles.disputeModalFooter,
                  themeStyles.disputeModalFooter,
                )}
              >
                <Button
                  variant="secondary"
                  onClick={() => setShowDisputeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleFileDispute}
                  isLoading={submittingDispute}
                >
                  File Dispute
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
