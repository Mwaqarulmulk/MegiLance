"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/core";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import commonStyles from "./Invitations.common.module.css";
import lightStyles from "./Invitations.light.module.css";
import darkStyles from "./Invitations.dark.module.css";

interface Invitation {
  id: number;
  project_id: number;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  skills: string[];
  client_name: string;
  client_avatar: string | null;
  created_at: string;
  fit_score: number;
}

interface SuggestedProject {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  skills_required: string[];
  category: string;
  match_score?: number;
}

export default function InvitationsPage() {
  const toaster = useToaster();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<SuggestedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      const data = (await apiFetch("/ai/invitations")) as {
        invitations?: Invitation[];
        items?: Invitation[];
      };
      setInvitations(data.invitations ?? data.items ?? []);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch invitations:", e);
      setError("Could not load invitations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedProjects = useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const data = (await apiFetch(
        "/matching/recommendations?limit=5",
      )) as
        | { jobs?: SuggestedProject[]; projects?: SuggestedProject[] }
        | SuggestedProject[];
      const items = Array.isArray(data)
        ? data
        : (data.jobs ?? data.projects ?? []);
      setSuggestedProjects(items);
    } catch (e) {
      console.error("Failed to fetch AI suggestions:", e);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
    fetchSuggestedProjects();
  }, [fetchInvitations, fetchSuggestedProjects]);

  const handleRespond = async (invitationId: number, accept: boolean) => {
    setResponding(invitationId);
    try {
      await apiFetch(`/ai/invitations/${invitationId}/respond`, {
        method: "POST",
        body: JSON.stringify({ accept, message: null }),
      });
      setInvitations((prev) =>
        prev.filter((invitation) => invitation.id !== invitationId),
      );
      setError(null);
      toaster.notify({
        title: accept ? "Invitation Accepted" : "Invitation Declined",
        description: accept
          ? "You accepted the project invitation. A pending contract has been created."
          : "You declined the project invitation.",
        variant: accept ? "success" : "info",
      });
    } catch (e) {
      console.error("Response failed:", e);
      const msg = "Your response was not saved. Please try again.";
      setError(msg);
      toaster.notify({
        title: "Action Failed",
        description: msg,
        variant: "danger",
      });
    } finally {
      setResponding(null);
    }
  };

  if (!mounted || loading) {
    return (
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <div className={cn(commonStyles.loadingContainer, themeStyles.loadingContainer)}>
          <div className={commonStyles.emptyIcon}>📬</div>
          <p>Loading your invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={commonStyles.header}>
        <h1 className={cn(commonStyles.title, themeStyles.title)}>
          Project Invitations
        </h1>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          Review invitations sent by clients. Accepting creates a pending contract for both parties to review.
        </p>
      </header>

      {error && (
        <div role="alert" className={cn(commonStyles.errorBanner, themeStyles.errorBanner)}>
          {error}
        </div>
      )}

      {/* ── Invitations list or empty state ── */}
      {invitations.length === 0 ? (
        <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
          <div className={commonStyles.emptyIcon}>📭</div>
          <h3 className={cn(commonStyles.emptyTitle, themeStyles.emptyTitle)}>
            No pending invitations yet
          </h3>
          <p className={cn(commonStyles.emptyDescription, themeStyles.emptyDescription)}>
            Complete your profile and add your skills so our AI can match you
            with relevant projects. Clients posting projects that fit your
            expertise will appear here automatically.
          </p>
          <div className={commonStyles.emptyActions}>
            <Link
              href="/freelancer/projects"
              className={cn(commonStyles.primaryButton, themeStyles.primaryButton)}
            >
              🔍 Find Projects
            </Link>
            <Link
              href="/freelancer/profile"
              className={cn(commonStyles.secondaryButton, themeStyles.secondaryButton)}
            >
              ✏️ Complete Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className={commonStyles.invitationsList}>
          {invitations.map((inv) => {
            const badgeClass =
              inv.fit_score >= 80
                ? themeStyles.badgeHigh
                : inv.fit_score >= 60
                  ? themeStyles.badgeMedium
                  : themeStyles.badgeLow;

            return (
              <div
                key={inv.id}
                className={cn(commonStyles.invitationCard, themeStyles.invitationCard)}
              >
                <div className={commonStyles.cardHeader}>
                  <div>
                    <h3 className={cn(commonStyles.projectTitle, themeStyles.projectTitle)}>
                      {inv.title}
                    </h3>
                    <p className={cn(commonStyles.clientMeta, themeStyles.clientMeta)}>
                      by {inv.client_name} · {inv.category}
                    </p>
                  </div>
                  <span className={cn(commonStyles.matchBadge, badgeClass)}>
                    {Math.round(inv.fit_score)}% Match
                  </span>
                </div>

                <p className={cn(commonStyles.description, themeStyles.description)}>
                  {inv.description}
                </p>

                <div className={commonStyles.skillsRow}>
                  {inv.skills.map((skill) => (
                    <span
                      key={skill}
                      className={cn(commonStyles.skillPill, themeStyles.skillPill)}
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className={cn(commonStyles.cardFooter, themeStyles.cardFooter)}>
                  <div className={cn(commonStyles.budgetInfo, themeStyles.budgetInfo)}>
                    Budget:{" "}
                    <strong>
                      ${inv.budget_min?.toLocaleString() || "0"} – $
                      {inv.budget_max?.toLocaleString() || "0"}
                    </strong>
                  </div>
                  <div className={commonStyles.actionButtonGroup}>
                    <button
                      onClick={() => handleRespond(inv.id, false)}
                      disabled={responding === inv.id}
                      className={cn(commonStyles.actionBtn, themeStyles.declineBtn)}
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespond(inv.id, true)}
                      disabled={responding === inv.id}
                      className={cn(commonStyles.actionBtn, themeStyles.acceptBtn)}
                    >
                      {responding === inv.id ? "Processing..." : "Accept"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── AI-Suggested Projects section ── */}
      <div>
        <div className={commonStyles.sectionHeader}>
          <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
            🤖 AI-Suggested Projects
          </h2>
          <Link
            href="/freelancer/projects"
            className={cn(commonStyles.sectionLink, themeStyles.sectionLink)}
          >
            View all →
          </Link>
        </div>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle, "mb-5 text-sm")}>
          Based on your profile and skills, you may be a great fit for these
          projects.
        </p>

        {suggestionsLoading ? (
          <div className={cn(commonStyles.loadingContainer, themeStyles.loadingContainer, "py-10")}>
            <div className="text-2xl mb-2">🔍</div>
            <p>Finding best matches for you...</p>
          </div>
        ) : suggestedProjects.length > 0 ? (
          <div className={commonStyles.suggestedList}>
            {suggestedProjects.map((proj) => (
              <div
                key={proj.id}
                className={cn(commonStyles.suggestedCard, themeStyles.suggestedCard)}
              >
                <div className={commonStyles.suggestedContent}>
                  <h3 className={cn(commonStyles.suggestedTitle, themeStyles.suggestedTitle)}>
                    {proj.title}
                  </h3>
                  <p className={cn(commonStyles.suggestedDescription, themeStyles.suggestedDescription)}>
                    {proj.description?.slice(0, 120)}
                    {(proj.description?.length ?? 0) > 120 ? "..." : ""}
                  </p>
                  <div className={commonStyles.suggestedSkills}>
                    {(proj.skills_required || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className={cn(commonStyles.suggestedSkillPill, themeStyles.suggestedSkillPill)}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={commonStyles.suggestedMeta}>
                  {proj.match_score != null && (
                    <div className={cn(commonStyles.suggestedMatchScore, themeStyles.suggestedMatchScore)}>
                      {Math.round(proj.match_score)}% match
                    </div>
                  )}
                  <div className={cn(commonStyles.suggestedBudget, themeStyles.suggestedBudget)}>
                    ${proj.budget_min?.toLocaleString() ?? "?"} – $
                    {proj.budget_max?.toLocaleString() ?? "?"}
                  </div>
                  <Link
                    href={`/freelancer/projects/${proj.id}`}
                    className={cn(commonStyles.viewButton, themeStyles.viewButton)}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState, "p-8")}>
            <p className={cn(commonStyles.emptyDescription, themeStyles.emptyDescription, "mb-4")}>
              No AI suggestions available yet.{" "}
              <Link
                href="/freelancer/profile"
                className={cn(commonStyles.sectionLink, themeStyles.sectionLink)}
              >
                Complete your profile
              </Link>{" "}
              to get personalised project matches.
            </p>
            <Link
              href="/freelancer/projects"
              className={cn(commonStyles.primaryButton, themeStyles.primaryButton)}
            >
              Browse All Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
