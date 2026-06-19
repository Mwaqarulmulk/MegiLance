"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Invitation {
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

const BASE_URL = "/api/v1";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [suggestedProjects, setSuggestedProjects] = useState<
    SuggestedProject[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [responding, setResponding] = useState<number | null>(null);

  const fetchInvitations = useCallback(async () => {
    const token = localStorage.getItem("auth_token");

    // Primary: AI invitations endpoint
    try {
      const res = await fetch(`${BASE_URL}/ai/invitations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: Invitation[] =
          data.invitations ?? data.items ?? (Array.isArray(data) ? data : []);
        setInvitations(items);
        setLoading(false);
        return;
      }
    } catch {
      /* fall through */
    }

    // Fallback: REST invitations endpoint (if it exists in future)
    try {
      const res = await fetch(`${BASE_URL}/invitations?status=pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: Invitation[] =
          data.invitations ?? data.items ?? (Array.isArray(data) ? data : []);
        setInvitations(items);
      }
    } catch (e) {
      console.error("Failed to fetch invitations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedProjects = useCallback(async () => {
    setSuggestionsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${BASE_URL}/matching/recommendations?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items: SuggestedProject[] =
          data.jobs ?? data.projects ?? (Array.isArray(data) ? data : []);
        setSuggestedProjects(items);
      }
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

  const handleRespond = async (projectId: number, accept: boolean) => {
    setResponding(projectId);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${BASE_URL}/ai/invitations/${projectId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accept, message: null }),
      });
    } catch (e) {
      console.error("Response failed:", e);
    } finally {
      // Optimistic update: remove regardless of API result
      setInvitations((prev) => prev.filter((i) => i.project_id !== projectId));
      setResponding(null);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
          <p>Loading your invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Project Invitations
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        AI has matched these projects with your skills. Accept to start working.
      </p>

      {/* ── Invitations list or empty state ── */}
      {invitations.length === 0 ? (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 16,
            padding: "40px 32px",
            textAlign: "center",
            marginBottom: 40,
            border: "1px dashed #d1d5db",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            No pending invitations yet
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: 28,
              maxWidth: 420,
              margin: "0 auto 28px",
              lineHeight: 1.6,
            }}
          >
            Complete your profile and add your skills so our AI can match you
            with relevant projects. Clients posting projects that fit your
            expertise will appear here automatically.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/freelancer/projects"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 24px",
                borderRadius: 8,
                background: "#6366f1",
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              🔍 Find Projects
            </Link>
            <Link
              href="/freelancer/profile"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 24px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#374151",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: 15,
              }}
            >
              ✏️ Complete Profile
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {invitations.map((inv) => (
            <div
              key={inv.project_id}
              style={{
                padding: 24,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}
                  >
                    {inv.title}
                  </h3>
                  <p style={{ color: "#6b7280", fontSize: 14 }}>
                    by {inv.client_name} · {inv.category}
                  </p>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    flexShrink: 0,
                    background:
                      inv.fit_score >= 80
                        ? "#dcfce7"
                        : inv.fit_score >= 60
                          ? "#fef3c7"
                          : "#fee2e2",
                    color:
                      inv.fit_score >= 80
                        ? "#166534"
                        : inv.fit_score >= 60
                          ? "#92400e"
                          : "#991b1b",
                  }}
                >
                  {Math.round(inv.fit_score)}% Match
                </span>
              </div>

              <p
                style={{ color: "#374151", lineHeight: 1.6, marginBottom: 16 }}
              >
                {inv.description}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {inv.skills.map((skill) => (
                  <span
                    key={skill}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      background: "#f3f4f6",
                      color: "#374151",
                      fontSize: 13,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 16,
                  borderTop: "1px solid #f3f4f6",
                }}
              >
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Budget:{" "}
                  <strong>
                    ${inv.budget_min?.toLocaleString() || "0"} – $
                    {inv.budget_max?.toLocaleString() || "0"}
                  </strong>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleRespond(inv.project_id, false)}
                    disabled={responding === inv.project_id}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: "white",
                      cursor:
                        responding === inv.project_id
                          ? "not-allowed"
                          : "pointer",
                      fontSize: 14,
                      opacity: responding === inv.project_id ? 0.6 : 1,
                    }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleRespond(inv.project_id, true)}
                    disabled={responding === inv.project_id}
                    style={{
                      padding: "8px 20px",
                      borderRadius: 8,
                      background: "#6366f1",
                      color: "white",
                      border: "none",
                      cursor:
                        responding === inv.project_id
                          ? "not-allowed"
                          : "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                      opacity: responding === inv.project_id ? 0.6 : 1,
                    }}
                  >
                    {responding === inv.project_id ? "Processing..." : "Accept"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── AI-Suggested Projects section ── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            🤖 AI-Suggested Projects
          </h2>
          <Link
            href="/freelancer/projects"
            style={{
              color: "#6366f1",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            View all →
          </Link>
        </div>
        <p style={{ color: "#6b7280", marginBottom: 20, fontSize: 14 }}>
          Based on your profile and skills, you may be a great fit for these
          projects.
        </p>

        {suggestionsLoading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
            Finding best matches for you...
          </div>
        ) : suggestedProjects.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {suggestedProjects.map((proj) => (
              <div
                key={proj.id}
                style={{
                  padding: 20,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}
                  >
                    {proj.title}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: 13,
                      marginBottom: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    {proj.description?.slice(0, 120)}
                    {(proj.description?.length ?? 0) > 120 ? "..." : ""}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(proj.skills_required || []).slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        style={{
                          padding: "3px 8px",
                          borderRadius: 10,
                          background: "#eef2ff",
                          color: "#4f46e5",
                          fontSize: 12,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  {proj.match_score != null && (
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6366f1",
                        marginBottom: 6,
                      }}
                    >
                      {Math.round(proj.match_score)}% match
                    </div>
                  )}
                  <div
                    style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}
                  >
                    ${proj.budget_min?.toLocaleString() ?? "?"} – $
                    {proj.budget_max?.toLocaleString() ?? "?"}
                  </div>
                  <Link
                    href={`/freelancer/projects/${proj.id}`}
                    style={{
                      display: "inline-block",
                      padding: "7px 16px",
                      borderRadius: 8,
                      background: "#6366f1",
                      color: "white",
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              background: "#f9fafb",
              borderRadius: 12,
              border: "1px dashed #d1d5db",
            }}
          >
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              No AI suggestions available yet.{" "}
              <Link
                href="/freelancer/profile"
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                Complete your profile
              </Link>{" "}
              to get personalised project matches.
            </p>
            <Link
              href="/freelancer/projects"
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 8,
                background: "#6366f1",
                color: "white",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              Browse All Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
