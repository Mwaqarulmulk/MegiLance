// @AI-HINT: Global search page — searches Freelancers, Projects, and Jobs with URL-driven ?q= query and 350ms debounce
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  Briefcase,
  Layers,
  Star,
  MapPin,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import Loading from "@/app/components/atoms/Loading/Loading";
import commonStyles from "./Search.common.module.css";
import lightStyles from "./Search.light.module.css";
import darkStyles from "./Search.dark.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "freelancers" | "projects" | "jobs";

interface FreelancerResult {
  id: string | number;
  name?: string;
  headline?: string;
  hourly_rate?: number;
  location?: string;
  average_rating?: number;
  skills?: string[] | string;
  profile_image_url?: string;
  profile_slug?: string;
}

interface ProjectResult {
  id: string | number;
  title?: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  skills?: string[] | string;
  status?: string;
  created_at?: string;
  category_name?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function parseSkills(skills?: string[] | string): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  query: string;
  type: Tab;
  themeStyles: Record<string, string>;
}

function EmptyState({ query, type, themeStyles }: EmptyStateProps) {
  const icons: Record<Tab, string> = {
    freelancers: "👤",
    projects: "📁",
    jobs: "💼",
  };
  const labels: Record<Tab, string> = {
    freelancers: "freelancers",
    projects: "projects",
    jobs: "jobs",
  };

  return (
    <div className={commonStyles.emptyState}>
      <span className={commonStyles.emptyIcon} aria-hidden="true">
        {icons[type]}
      </span>
      <h3 className={cn(commonStyles.emptyTitle, themeStyles.emptyTitle)}>
        {query ? `No ${labels[type]} found` : `Browse ${labels[type]}`}
      </h3>
      <p
        className={cn(
          commonStyles.emptyDescription,
          themeStyles.emptyDescription,
        )}
      >
        {query
          ? `We couldn't find any ${labels[type]} matching "${query}". Try a different search term.`
          : `Start typing above to search for ${labels[type]}.`}
      </p>
    </div>
  );
}

// ─── Main Search Content (requires Suspense for useSearchParams) ───────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("freelancers");
  const [inputValue, setInputValue] = useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(
    searchParams.get("q") ?? "",
  );

  const [freelancers, setFreelancers] = useState<FreelancerResult[]>([]);
  const [projects, setProjects] = useState<ProjectResult[]>([]);
  const [jobs, setJobs] = useState<ProjectResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Push query to URL (debounced) ──────────────────────────────────────────
  const updateUrl = useCallback(
    (q: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q) {
        params.set("q", q);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  // 350ms debounce: update debouncedQuery + URL on inputValue changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
      updateUrl(inputValue);
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue, updateUrl]);

  // ── Fetch data on tab or query change ─────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "freelancers") {
          const params = new URLSearchParams({ limit: "20" });
          if (debouncedQuery) params.set("search", debouncedQuery);
          const data = (await apiFetch(`/users/freelancers?${params}`)) as {
            freelancers?: FreelancerResult[];
            users?: FreelancerResult[];
          };
          if (controller.signal.aborted) return;
          const raw = data.freelancers ?? data.users ?? [];
          const results = Array.isArray(raw) ? raw : [];
          setFreelancers(results);
          setResultsCount(results.length);
        } else if (activeTab === "projects") {
          const params = new URLSearchParams({ limit: "20" });
          if (debouncedQuery) params.set("search", debouncedQuery);
          const data = (await apiFetch(`/projects?${params}`)) as {
            projects?: ProjectResult[];
            total?: number;
          };
          if (controller.signal.aborted) return;
          const results = data.projects ?? [];
          setProjects(results);
          setResultsCount(data.total ?? results.length);
        } else {
          // Jobs tab: open projects only
          const params = new URLSearchParams({ status: "open", limit: "20" });
          if (debouncedQuery) params.set("search", debouncedQuery);
          const data = (await apiFetch(`/projects?${params}`)) as {
            projects?: ProjectResult[];
            total?: number;
          };
          if (controller.signal.aborted) return;
          const results = data.projects ?? [];
          setJobs(results);
          setResultsCount(data.total ?? results.length);
        }
      } catch {
        if (controller.signal.aborted) return;
        setFreelancers([]);
        setProjects([]);
        setJobs([]);
        setResultsCount(0);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [activeTab, debouncedQuery, mounted]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const themeStyles =
    mounted && resolvedTheme === "dark" ? darkStyles : lightStyles;

  const tabs: { id: Tab; label: string; Icon: LucideIcon }[] = [
    { id: "freelancers", label: "Freelancers", Icon: Users },
    { id: "projects", label: "Projects", Icon: Briefcase },
    { id: "jobs", label: "Jobs", Icon: Layers },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      {/* Page Header */}
      <div className={commonStyles.header}>
        <h1 className={cn(commonStyles.pageTitle, themeStyles.pageTitle)}>
          Search MegiLance
        </h1>
        <p className={cn(commonStyles.pageSubtitle, themeStyles.pageSubtitle)}>
          Find freelancers, projects, and opportunities
        </p>
      </div>

      {/* Search Bar */}
      <div className={commonStyles.searchBar}>
        <Search
          size={20}
          className={cn(commonStyles.searchIcon, themeStyles.searchIcon)}
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search for freelancers, projects, jobs..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={cn(commonStyles.searchInput, themeStyles.searchInput)}
          aria-label="Search query"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </div>

      {/* Tab Bar */}
      <div
        className={cn(commonStyles.tabs, themeStyles.tabs)}
        role="tablist"
        aria-label="Search categories"
      >
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setActiveTab(id)}
            className={cn(
              commonStyles.tab,
              themeStyles.tab,
              activeTab === id && commonStyles.tabActive,
              activeTab === id && themeStyles.tabActive,
            )}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Results Panel */}
      <div className={commonStyles.results} role="tabpanel" aria-live="polite">
        {loading ? (
          <div className={commonStyles.loadingState}>
            <Loading size="md" text="Searching…" />
          </div>
        ) : (
          <>
            <p
              className={cn(
                commonStyles.resultsCount,
                themeStyles.resultsCount,
              )}
            >
              {resultsCount > 0
                ? `${resultsCount} result${resultsCount !== 1 ? "s" : ""}${debouncedQuery ? ` for "${debouncedQuery}"` : ""}`
                : debouncedQuery
                  ? `No results for "${debouncedQuery}"`
                  : "Enter a search term above"}
            </p>

            {/* ── Freelancers ─────────────────────────────────────────────── */}
            {activeTab === "freelancers" &&
              (freelancers.length > 0 ? (
                <div className={commonStyles.grid}>
                  {freelancers.map((f) => {
                    const skills = parseSkills(f.skills);
                    return (
                      <Link
                        key={f.id}
                        href={
                          f.profile_slug
                            ? `/freelancers/${f.profile_slug}`
                            : `/freelancers/${f.id}`
                        }
                        className={cn(commonStyles.card, themeStyles.card)}
                      >
                        <div className={commonStyles.cardHeader}>
                          <div
                            className={cn(
                              commonStyles.cardAvatar,
                              themeStyles.cardAvatar,
                            )}
                          >
                            {f.profile_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={f.profile_image_url}
                                alt={f.name ?? "Freelancer avatar"}
                                width={48}
                                height={48}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              getInitials(f.name)
                            )}
                          </div>
                          <div className={commonStyles.cardInfo}>
                            <p
                              className={cn(
                                commonStyles.cardName,
                                themeStyles.cardName,
                              )}
                            >
                              {f.name ?? "Freelancer"}
                            </p>
                            <p
                              className={cn(
                                commonStyles.cardTitle,
                                themeStyles.cardTitle,
                              )}
                            >
                              {f.headline ?? "Professional Freelancer"}
                            </p>
                          </div>
                        </div>

                        <div className={commonStyles.cardMeta}>
                          {f.hourly_rate != null && (
                            <span
                              className={cn(
                                commonStyles.cardMetaItem,
                                themeStyles.cardMetaItem,
                              )}
                            >
                              <DollarSign size={13} aria-hidden="true" />$
                              {f.hourly_rate}/hr
                            </span>
                          )}
                          {f.location && (
                            <span
                              className={cn(
                                commonStyles.cardMetaItem,
                                themeStyles.cardMetaItem,
                              )}
                            >
                              <MapPin size={13} aria-hidden="true" />
                              {f.location}
                            </span>
                          )}
                          {f.average_rating != null && (
                            <span
                              className={cn(
                                commonStyles.cardMetaItem,
                                themeStyles.cardMetaItem,
                              )}
                            >
                              <Star size={13} aria-hidden="true" />
                              {f.average_rating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        {skills.length > 0 && (
                          <div className={commonStyles.tags}>
                            {skills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className={cn(
                                  commonStyles.tag,
                                  themeStyles.tag,
                                )}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  query={debouncedQuery}
                  type="freelancers"
                  themeStyles={themeStyles}
                />
              ))}

            {/* ── Projects / Jobs ──────────────────────────────────────────── */}
            {(activeTab === "projects" || activeTab === "jobs") &&
              (() => {
                const data = activeTab === "projects" ? projects : jobs;
                return data.length > 0 ? (
                  <div className={commonStyles.grid}>
                    {data.map((p) => {
                      const skills = parseSkills(p.skills);
                      const budgetLabel =
                        p.budget_min != null && p.budget_max != null
                          ? `$${p.budget_min.toLocaleString()} – $${p.budget_max.toLocaleString()}`
                          : p.budget_max != null
                            ? `Up to $${p.budget_max.toLocaleString()}`
                            : p.budget_min != null
                              ? `From $${p.budget_min.toLocaleString()}`
                              : null;

                      return (
                        <Link
                          key={p.id}
                          href={`/projects/${p.id}`}
                          className={cn(commonStyles.card, themeStyles.card)}
                        >
                          <div className={commonStyles.cardInfo}>
                            <p
                              className={cn(
                                commonStyles.cardName,
                                themeStyles.cardName,
                              )}
                            >
                              {p.title ?? "Untitled Project"}
                            </p>
                            {p.category_name && (
                              <p
                                className={cn(
                                  commonStyles.cardTitle,
                                  themeStyles.cardTitle,
                                )}
                              >
                                {p.category_name}
                              </p>
                            )}
                          </div>

                          {p.description && (
                            <p
                              className={cn(
                                commonStyles.cardDescription,
                                themeStyles.cardDescription,
                              )}
                            >
                              {p.description}
                            </p>
                          )}

                          <div className={commonStyles.cardMeta}>
                            {budgetLabel && (
                              <span
                                className={cn(
                                  commonStyles.cardMetaItem,
                                  themeStyles.cardMetaItem,
                                )}
                              >
                                <DollarSign size={13} aria-hidden="true" />
                                {budgetLabel}
                              </span>
                            )}
                            {p.status && (
                              <span
                                className={cn(
                                  commonStyles.tag,
                                  themeStyles.tag,
                                )}
                              >
                                {p.status}
                              </span>
                            )}
                          </div>

                          {skills.length > 0 && (
                            <div className={commonStyles.tags}>
                              {skills.slice(0, 4).map((s) => (
                                <span
                                  key={s}
                                  className={cn(
                                    commonStyles.tag,
                                    themeStyles.tag,
                                  )}
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    query={debouncedQuery}
                    type={activeTab}
                    themeStyles={themeStyles}
                  />
                );
              })()}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page Export (Suspense wrapper for useSearchParams) ───────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "80px 20px",
          }}
        >
          <Loading size="lg" text="Loading search…" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
