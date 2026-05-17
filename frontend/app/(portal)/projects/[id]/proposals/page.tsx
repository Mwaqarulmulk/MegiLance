// @AI-HINT: Client view of proposals for a specific project — shows all bids, accept/reject actions, freelancer profile links
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { proposalsApi, projectsApi } from "@/lib/api";
import Button from "@/app/components/atoms/Button/Button";
import {
  ArrowLeft,
  Star,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

import commonStyles from "./ProposalsList.common.module.css";
import lightStyles from "./ProposalsList.light.module.css";
import darkStyles from "./ProposalsList.dark.module.css";

interface Proposal {
  id: number;
  freelancer_id: number;
  freelancer_name?: string;
  freelancer_avatar?: string;
  freelancer_rating?: number;
  cover_letter?: string;
  bid_amount?: number;
  hourly_rate?: number;
  estimated_hours?: number;
  availability?: string;
  status: string;
  created_at: string;
}

type SortKey = "date_desc" | "date_asc" | "bid_asc" | "bid_desc" | "rating_desc";

function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2, color: "#f59e0b" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(value) ? "#f59e0b" : "none"}
          color={n <= Math.round(value) ? "#f59e0b" : "#d1d5db"}
        />
      ))}
    </span>
  );
}

const STATUS_COLORS: Record<string, string> = {
  pending: "pending",
  submitted: "submitted",
  accepted: "accepted",
  rejected: "rejected",
  withdrawn: "withdrawn",
};

function getStatusClass(status: string, themeStyles: Record<string, string>) {
  const key = STATUS_COLORS[status] || "submitted";
  return cn(commonStyles.statusBadge, (themeStyles as any)[`statusBadge.${key}`]);
}

export default function ProjectProposalsPage() {
  const { id } = useParams();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [accepting, setAccepting] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projectData, proposalsData] = await Promise.all([
        projectsApi.get(id as string).catch(() => null),
        proposalsApi.getByProject(id as string).catch(() => []),
      ]);
      setProject(projectData);
      const items =
        (proposalsData as any)?.items ||
        (proposalsData as any)?.proposals ||
        (Array.isArray(proposalsData) ? proposalsData : []);
      setProposals(items);
    } catch {
      setError("Failed to load proposals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (proposalId: number) => {
    setAccepting(proposalId);
    try {
      await proposalsApi.accept(proposalId);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "accepted" } : p,
        ),
      );
    } catch {
      // silently handle
    } finally {
      setAccepting(null);
    }
  };

  const handleReject = async (proposalId: number) => {
    setRejecting(proposalId);
    try {
      await proposalsApi.reject(proposalId);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "rejected" } : p,
        ),
      );
    } catch {
      // silently handle
    } finally {
      setRejecting(null);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sortedProposals = [...proposals].sort((a, b) => {
    switch (sort) {
      case "bid_asc":
        return (a.bid_amount || a.hourly_rate || 0) - (b.bid_amount || b.hourly_rate || 0);
      case "bid_desc":
        return (b.bid_amount || b.hourly_rate || 0) - (a.bid_amount || a.hourly_rate || 0);
      case "rating_desc":
        return (b.freelancer_rating || 0) - (a.freelancer_rating || 0);
      case "date_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "date_desc":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (!resolvedTheme) return null;

  // --- Loading skeleton ---
  if (loading) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <div className={commonStyles.inner}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(commonStyles.skeletonCard, themeStyles.skeletonCard)}
            >
              {[90, 60, 40].map((w, j) => (
                <div
                  key={j}
                  className={commonStyles.skeletonLine}
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Error ---
  if (error) {
    return (
      <div className={cn(commonStyles.page, themeStyles.page)}>
        <div
          className={cn(commonStyles.errorState, (themeStyles as any).errorState)}
        >
          <p>{error}</p>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft size={16} />
            &nbsp;Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <div className={commonStyles.inner}>
        {/* Back nav */}
        <div style={{ marginBottom: "1rem" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/projects/${id}`)}
          >
            <ArrowLeft size={14} />
            &nbsp;Back to Project
          </Button>
        </div>

        {/* Header */}
        <div className={commonStyles.pageHeader}>
          <div className={commonStyles.headerLeft}>
            <h1 className={cn(commonStyles.pageTitle, themeStyles.pageTitle)}>
              Proposals
            </h1>
            {project && (
              <p className={cn(commonStyles.pageSub, themeStyles.pageSub)}>
                {project.title} &mdash; {proposals.length} proposal
                {proposals.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar */}
        {proposals.length > 1 && (
          <div className={cn(commonStyles.toolbar, (themeStyles as any).toolbar)}>
            <span
              className={cn(
                commonStyles.toolbarLabel,
                (themeStyles as any).toolbarLabel,
              )}
            >
              Sort by:
            </span>
            <select
              className={cn(
                commonStyles.sortSelect,
                themeStyles.sortSelect,
              )}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort proposals"
            >
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="bid_asc">Bid: Low to High</option>
              <option value="bid_desc">Bid: High to Low</option>
              <option value="rating_desc">Highest rated</option>
            </select>
          </div>
        )}

        {/* Proposals */}
        {sortedProposals.length === 0 ? (
          <div
            className={cn(
              commonStyles.emptyState,
              (themeStyles as any).emptyState,
            )}
          >
            No proposals yet. Check back soon!
          </div>
        ) : (
          <div className={commonStyles.proposalList}>
            {sortedProposals.map((proposal) => {
              const name = proposal.freelancer_name || `Freelancer #${proposal.freelancer_id}`;
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const bidDisplay = proposal.bid_amount
                ? `$${proposal.bid_amount}`
                : proposal.hourly_rate
                ? `$${proposal.hourly_rate}/hr`
                : "—";
              const isExpanded = expandedCards.has(proposal.id);
              const statusKey = STATUS_COLORS[proposal.status] || "submitted";

              return (
                <div
                  key={proposal.id}
                  className={cn(
                    commonStyles.proposalCard,
                    themeStyles.proposalCard,
                  )}
                >
                  {/* Top row: avatar + info + bid */}
                  <div className={commonStyles.cardTop}>
                    {proposal.freelancer_avatar ? (
                      <img
                        src={proposal.freelancer_avatar}
                        alt={name}
                        className={commonStyles.freelancerAvatar}
                      />
                    ) : (
                      <div
                        className={cn(
                          commonStyles.freelancerAvatarPlaceholder,
                          themeStyles.freelancerAvatarPlaceholder,
                        )}
                      >
                        {initials}
                      </div>
                    )}

                    <div className={commonStyles.freelancerInfo}>
                      <div
                        className={cn(
                          commonStyles.freelancerName,
                          themeStyles.freelancerName,
                        )}
                      >
                        {name}
                      </div>
                      <div className={commonStyles.freelancerMeta}>
                        {proposal.freelancer_rating &&
                          proposal.freelancer_rating > 0 && (
                            <span
                              className={cn(
                                commonStyles.starsRow,
                                (themeStyles as any).starsRow,
                              )}
                            >
                              <StarRating
                                value={proposal.freelancer_rating}
                                size={13}
                              />
                              <span>
                                {proposal.freelancer_rating.toFixed(1)}
                              </span>
                            </span>
                          )}
                        {proposal.estimated_hours && (
                          <span
                            className={cn(
                              commonStyles.metaItem,
                              themeStyles.metaItem,
                            )}
                          >
                            <Clock size={12} />
                            {proposal.estimated_hours}h est.
                          </span>
                        )}
                        <span
                          className={cn(
                            commonStyles.metaItem,
                            themeStyles.metaItem,
                          )}
                        >
                          <Clock size={12} />
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        commonStyles.bidAmount,
                        themeStyles.bidAmount,
                      )}
                    >
                      {bidDisplay}
                    </div>
                  </div>

                  {/* Cover letter */}
                  {proposal.cover_letter && (
                    <>
                      <p
                        className={cn(
                          commonStyles.coverLetter,
                          themeStyles.coverLetter,
                          isExpanded ? commonStyles.coverLetterExpanded : "",
                        )}
                      >
                        {proposal.cover_letter}
                      </p>
                      {proposal.cover_letter.length > 200 && (
                        <button
                          className={cn(
                            commonStyles.readMoreBtn,
                            themeStyles.readMoreBtn,
                          )}
                          onClick={() => toggleExpand(proposal.id)}
                          aria-label={
                            isExpanded ? "Show less" : "Read more"
                          }
                        >
                          {isExpanded ? (
                            <>
                              Show less <ChevronUp size={12} />
                            </>
                          ) : (
                            <>
                              Read more <ChevronDown size={12} />
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {/* Actions row */}
                  <div
                    className={cn(
                      commonStyles.cardActions,
                      themeStyles.cardActions,
                    )}
                  >
                    {/* Status badge */}
                    <span
                      className={`${commonStyles.statusBadge} ${
                        (themeStyles as any)[`statusBadge.${statusKey}`] || ""
                      }`}
                      style={
                        statusKey === "accepted"
                          ? {
                              background:
                                resolvedTheme === "dark"
                                  ? "rgba(52,211,153,0.12)"
                                  : "#d1fae5",
                              color:
                                resolvedTheme === "dark"
                                  ? "#34d399"
                                  : "#065f46",
                            }
                          : statusKey === "rejected"
                          ? {
                              background:
                                resolvedTheme === "dark"
                                  ? "rgba(248,113,113,0.12)"
                                  : "#fee2e2",
                              color:
                                resolvedTheme === "dark"
                                  ? "#f87171"
                                  : "#991b1b",
                            }
                          : statusKey === "submitted"
                          ? {
                              background:
                                resolvedTheme === "dark"
                                  ? "rgba(107,141,230,0.12)"
                                  : "#dbeafe",
                              color:
                                resolvedTheme === "dark"
                                  ? "#6b8de6"
                                  : "#1e40af",
                            }
                          : {
                              background:
                                resolvedTheme === "dark"
                                  ? "rgba(251,191,36,0.12)"
                                  : "#fef3c7",
                              color:
                                resolvedTheme === "dark"
                                  ? "#fcd34d"
                                  : "#92400e",
                            }
                      }
                    >
                      {proposal.status}
                    </span>

                    <span className={commonStyles.spacer} />

                    {/* View profile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/freelancers/${proposal.freelancer_id}`,
                        )
                      }
                    >
                      <User size={13} />
                      &nbsp;View Profile
                    </Button>

                    {/* Accept/Reject — only for active proposals */}
                    {(proposal.status === "submitted" ||
                      proposal.status === "pending") && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={rejecting === proposal.id}
                          onClick={() => handleReject(proposal.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          isLoading={accepting === proposal.id}
                          onClick={() => handleAccept(proposal.id)}
                        >
                          Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
