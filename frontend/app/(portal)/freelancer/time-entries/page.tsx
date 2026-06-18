// @AI-HINT: Detailed time entries tracking with reporting and analytics
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/core";
import Button from "@/app/components/atoms/Button/Button";
import Input from "@/app/components/atoms/Input/Input";
import Select from "@/app/components/molecules/Select/Select";
import Textarea from "@/app/components/atoms/Textarea/Textarea";
import {
  PageTransition,
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/app/components/Animations";
import { Clock, Pause, Trash2, Plus } from "lucide-react";
import commonStyles from "./TimeEntries.common.module.css";
import lightStyles from "./TimeEntries.light.module.css";
import darkStyles from "./TimeEntries.dark.module.css";

interface TimeEntry {
  id: string;
  project_id: string;
  project_name: string;
  task_description: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  hourly_rate: number;
  billable: boolean;
  status: "running" | "paused" | "completed" | "approved" | "invoiced";
  notes: string;
  tags: string[];
  created_at: string;
}

interface WeekSummary {
  total_hours: number;
  billable_hours: number;
  total_earnings: number;
  projects_worked: number;
}

interface Project {
  id: string;
  name: string;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#64748b" },
  running: { label: "Running", color: "#22c55e" },
  paused: { label: "Paused", color: "#f59e0b" },
  completed: { label: "Completed", color: "#3b82f6" },
  approved: { label: "Approved", color: "#8b5cf6" },
  invoiced: { label: "Invoiced", color: "#06b6d4" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

// Backend time_entries rows use a different shape (hours/date/description) than
// this UI expects; normalize so the page never crashes on missing fields.
const normalizeEntry = (r: any): TimeEntry => {
  const hours = Number(r?.hours) || 0;
  return {
    id: String(r?.id ?? ""),
    project_id: String(r?.contract_id ?? r?.project_id ?? ""),
    project_name: r?.project_title || r?.project_name || "Project",
    task_description: r?.task_description || r?.description || "—",
    start_time: r?.start_time || r?.date || r?.created_at || new Date().toISOString(),
    end_time: r?.end_time ?? null,
    duration_minutes:
      typeof r?.duration_minutes === "number"
        ? r.duration_minutes
        : Math.round(hours * 60),
    hourly_rate: Number(r?.hourly_rate) || 0,
    billable: r?.billable ?? true,
    status: (r?.status as TimeEntry["status"]) || "completed",
    notes: r?.notes || "",
    tags: Array.isArray(r?.tags) ? r.tags : [],
    created_at: r?.date || r?.created_at || new Date().toISOString(),
  };
};

const normalizeSummary = (s: any): WeekSummary => ({
  total_hours: Number(s?.total_hours) || 0,
  billable_hours: Number(s?.billable_hours ?? s?.total_hours) || 0,
  total_earnings: Number(s?.total_earnings ?? s?.total_amount) || 0,
  projects_worked: Number(s?.projects_worked ?? s?.entry_count) || 0,
});

export default function TimeEntriesPage() {
  const { resolvedTheme } = useTheme();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekSummary, setWeekSummary] = useState<WeekSummary | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "custom"
  >("week");

  // New entry form
  const [newEntry, setNewEntry] = useState({
    project_id: "",
    task_description: "",
    billable: true,
    notes: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedProject, selectedStatus, dateRange]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const loadData = async () => {
    try {
      setLoading(true);

      const entryParams = new URLSearchParams();
      if (selectedProject !== "all") entryParams.append("project_id", selectedProject);
      if (selectedStatus !== "all") entryParams.append("status", selectedStatus);
      entryParams.append("date_range", dateRange);

      const [entriesRes, projectsRes, summaryRes] = await Promise.allSettled([
        apiFetch<any>(`/time-entries?${entryParams}`),
        apiFetch<any>("/portal/freelancer/projects?status=open"),
        apiFetch<any>("/time-entries/summary"),
      ]);

      const entriesData = entriesRes.status === "fulfilled" ? entriesRes.value : null;
      const projectsData = projectsRes.status === "fulfilled" ? projectsRes.value : null;
      const summaryData = summaryRes.status === "fulfilled" ? summaryRes.value : null;

      const rawItems = entriesData?.items || entriesData || [];
      const items = (Array.isArray(rawItems) ? rawItems : []).map(normalizeEntry);
      const rawProjects = projectsData?.items || projectsData || [];
      setEntries(items);
      setProjects(
        (Array.isArray(rawProjects) ? rawProjects : []).map((p: any) => ({
          id: String(p?.id ?? ""),
          name: p?.name || p?.title || "Untitled project",
        })),
      );
      if (summaryData) setWeekSummary(normalizeSummary(summaryData));

      const running = items.find((e: TimeEntry) => e.status === "running");
      if (running) setActiveTimer(running);
    } catch (error) {
      setToast({ message: "Failed to load time entries", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async () => {
    if (!newEntry.project_id || !newEntry.task_description.trim()) return;

    try {
      const response = await apiFetch<any>("/time-entries", {
        method: "POST",
        body: JSON.stringify({
          project_id: newEntry.project_id,
          task_description: newEntry.task_description,
          billable: newEntry.billable,
          notes: newEntry.notes,
          tags: newEntry.tags,
          status: "running",
        }),
      });
      setActiveTimer(response);
      setShowTimer(false);
      setNewEntry({
        project_id: "",
        task_description: "",
        billable: true,
        notes: "",
        tags: [],
      });
      setToast({ message: "Timer started", type: "success" });
      loadData();
    } catch (error) {
      setToast({ message: "Failed to start timer", type: "error" });
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;

    try {
      await apiFetch(`/time-entries/${activeTimer.id}/stop`, { method: "POST" });
      setActiveTimer(null);
      setToast({ message: "Timer stopped", type: "success" });
      loadData();
    } catch (error) {
      setToast({ message: "Failed to stop timer", type: "error" });
    }
  };

  const pauseTimer = async () => {
    if (!activeTimer) return;
    setActiveTimer((prev) => (prev ? { ...prev, status: "paused" } : null));
    setToast({ message: "Timer paused (local only)", type: "success" });
  };

  const resumeTimer = async (id: string) => {
    setActiveTimer((prev) => (prev ? { ...prev, status: "running" } : null));
    setToast({ message: "Timer resumed (local only)", type: "success" });
  };

  const deleteEntry = async (id: string) => {
    try {
      await apiFetch(`/time-entries/${id}`, { method: "DELETE" });
      setDeleteTargetId(null);
      setToast({ message: "Entry deleted", type: "success" });
      loadData();
    } catch (error) {
      setToast({ message: "Failed to delete entry", type: "error" });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newEntry.tags.includes(tagInput.trim())) {
      setNewEntry((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setNewEntry((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const themeStyles = resolvedTheme === "light" ? lightStyles : darkStyles;

  // Group entries by date
  const groupedEntries = entries.reduce(
    (acc, entry) => {
      const dateKey = formatDate(entry.created_at);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(entry);
      return acc;
    },
    {} as Record<string, TimeEntry[]>,
  );

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <ScrollReveal>
          <div className={commonStyles.header}>
            <div className={commonStyles.headerTop}>
              <div>
                <h1 className={cn(commonStyles.title, themeStyles.title)}>
                  Time Tracking
                </h1>
                <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
                  Track your work hours and manage time entries
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowTimer(true)}
                disabled={!!activeTimer}
              >
                <Clock size={16} /> Start Timer
              </Button>
            </div>

            {/* Week Summary */}
            {weekSummary && (
              <StaggerContainer
                className={cn(
                  commonStyles.summaryGrid,
                  themeStyles.summaryGrid,
                )}
              >
                <StaggerItem>
                  <div
                    className={cn(
                      commonStyles.summaryCard,
                      themeStyles.summaryCard,
                    )}
                  >
                    <span className={commonStyles.summaryLabel}>
                      Total Hours
                    </span>
                    <span className={commonStyles.summaryValue}>
                      {weekSummary.total_hours.toFixed(1)}h
                    </span>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div
                    className={cn(
                      commonStyles.summaryCard,
                      themeStyles.summaryCard,
                    )}
                  >
                    <span className={commonStyles.summaryLabel}>
                      Billable Hours
                    </span>
                    <span className={commonStyles.summaryValue}>
                      {weekSummary.billable_hours.toFixed(1)}h
                    </span>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div
                    className={cn(
                      commonStyles.summaryCard,
                      themeStyles.summaryCard,
                    )}
                  >
                    <span className={commonStyles.summaryLabel}>Earnings</span>
                    <span className={commonStyles.summaryValue}>
                      ${weekSummary.total_earnings.toFixed(2)}
                    </span>
                  </div>
                </StaggerItem>
                <StaggerItem>
                  <div
                    className={cn(
                      commonStyles.summaryCard,
                      themeStyles.summaryCard,
                    )}
                  >
                    <span className={commonStyles.summaryLabel}>Projects</span>
                    <span className={commonStyles.summaryValue}>
                      {weekSummary.projects_worked}
                    </span>
                  </div>
                </StaggerItem>
              </StaggerContainer>
            )}

            {/* Active Timer */}
            {activeTimer && (
              <ScrollReveal>
                <div
                  className={cn(
                    commonStyles.activeTimer,
                    themeStyles.activeTimer,
                  )}
                >
                  <div className={commonStyles.timerInfo}>
                    <span className={commonStyles.timerProject}>
                      {activeTimer.project_name}
                    </span>
                    <span
                      className={cn(
                        commonStyles.timerTask,
                        themeStyles.timerTask,
                      )}
                    >
                      {activeTimer.task_description}
                    </span>
                  </div>
                  <div className={commonStyles.timerDuration}>
                    {formatDuration(activeTimer.duration_minutes)}
                  </div>
                  <div className={commonStyles.timerActions}>
                    {activeTimer.status === "running" ? (
                      <button
                        type="button"
                        onClick={pauseTimer}
                        className={cn(
                          commonStyles.timerBtn,
                          commonStyles.pauseBtn,
                          themeStyles.pauseBtn,
                        )}
                      >
                        ⏸️ Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => resumeTimer(activeTimer.id)}
                        className={cn(
                          commonStyles.timerBtn,
                          commonStyles.resumeBtn,
                          themeStyles.resumeBtn,
                        )}
                      >
                        ▶️ Resume
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={stopTimer}
                      className={cn(
                        commonStyles.timerBtn,
                        commonStyles.stopBtn,
                        themeStyles.stopBtn,
                      )}
                    >
                      ⏹️ Stop
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Filters */}
            <ScrollReveal>
              <div className={commonStyles.filters}>
                <Select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(e.target.value as typeof dateRange)
                  }
                  options={[
                    { value: "today", label: "Today" },
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                  ]}
                />

                <Select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  options={[
                    { value: "all", label: "All Projects" },
                    ...projects.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />

                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={[
                    { value: "all", label: "All Status" },
                    ...Object.entries(statusConfig).map(([key, { label }]) => ({
                      value: key,
                      label,
                    })),
                  ]}
                />
              </div>
            </ScrollReveal>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className={cn(commonStyles.loading, themeStyles.loading)}>
            Loading time entries...
          </div>
        ) : Object.keys(groupedEntries).length === 0 ? (
          <div className={cn(commonStyles.emptyState, themeStyles.emptyState)}>
            <span className={commonStyles.emptyIcon}>⏰</span>
            <h3 className={cn(commonStyles.emptyTitle, themeStyles.emptyTitle)}>
              No Time Entries
            </h3>
            <p className={cn(commonStyles.emptyDesc, themeStyles.emptyDesc)}>
              Start tracking your time to see entries here
            </p>
          </div>
        ) : (
          <StaggerContainer className={commonStyles.entriesList}>
            {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => (
              <StaggerItem key={dateKey} className={commonStyles.dateGroup}>
                <h3
                  className={cn(
                    commonStyles.dateHeader,
                    themeStyles.dateHeader,
                  )}
                >
                  {dateKey}
                  <span
                    className={cn(
                      commonStyles.dateDuration,
                      themeStyles.dateDuration,
                    )}
                  >
                    {formatDuration(
                      dayEntries.reduce(
                        (sum, e) => sum + e.duration_minutes,
                        0,
                      ),
                    )}
                  </span>
                </h3>

                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className={cn(
                      commonStyles.entryCard,
                      themeStyles.entryCard,
                    )}
                  >
                    <div className={commonStyles.entryTime}>
                      <span
                        className={cn(
                          commonStyles.timeRange,
                          themeStyles.timeRange,
                        )}
                      >
                        {formatTime(entry.start_time)}
                        {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                      </span>
                      <span
                        className={cn(
                          commonStyles.duration,
                          themeStyles.duration,
                        )}
                      >
                        {formatDuration(entry.duration_minutes)}
                      </span>
                    </div>

                    <div className={commonStyles.entryContent}>
                      <div className={commonStyles.entryHeader}>
                        <span
                          className={cn(
                            commonStyles.projectName,
                            themeStyles.projectName,
                          )}
                        >
                          {entry.project_name}
                        </span>
                        <span
                          className={commonStyles.statusBadge}
                          style={{
                            backgroundColor: statusConfig[entry.status]?.color,
                          }}
                        >
                          {statusConfig[entry.status]?.label}
                        </span>
                      </div>
                      <p
                        className={cn(
                          commonStyles.taskDesc,
                          themeStyles.taskDesc,
                        )}
                      >
                        {entry.task_description}
                      </p>
                      {entry.tags.length > 0 && (
                        <div className={commonStyles.tags}>
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className={cn(commonStyles.tag, themeStyles.tag)}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={commonStyles.entryMeta}>
                      {entry.billable && (
                        <span
                          className={cn(
                            commonStyles.billable,
                            themeStyles.billable,
                          )}
                        >
                          💵 $
                          {(
                            (entry.duration_minutes / 60) *
                            entry.hourly_rate
                          ).toFixed(2)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(entry.id)}
                        className={cn(
                          commonStyles.deleteBtn,
                          themeStyles.deleteBtn,
                        )}
                        aria-label="Delete entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* New Timer Modal */}
        {showTimer && (
          <div
            className={commonStyles.modalOverlay}
            onClick={() => setShowTimer(false)}
          >
            <div
              className={cn(commonStyles.modal, themeStyles.modal)}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  commonStyles.modalHeader,
                  themeStyles.modalHeader,
                )}
              >
                <h2
                  className={cn(
                    commonStyles.modalTitle,
                    themeStyles.modalTitle,
                  )}
                >
                  Start Timer
                </h2>
                <button
                  type="button"
                  onClick={() => setShowTimer(false)}
                  className={cn(
                    commonStyles.closeButton,
                    themeStyles.closeButton,
                  )}
                >
                  ×
                </button>
              </div>

              <div className={commonStyles.modalContent}>
                <div className={commonStyles.formGroup}>
                  <label className={cn(commonStyles.label, themeStyles.label)}>
                    Project *
                  </label>
                  <Select
                    value={newEntry.project_id}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        project_id: e.target.value,
                      }))
                    }
                    options={[
                      {
                        value: "",
                        label:
                          projects.length === 0
                            ? "— No projects found —"
                            : "Select a project",
                      },
                      ...projects.map((p) => ({ value: p.id, label: p.name })),
                    ]}
                  />
                  {projects.length === 0 && (
                    <p className="mt-1.5 text-sm text-amber-600 dark:text-amber-400">
                      No active projects found.{" "}
                      <a
                        href="/freelancer/projects/new"
                        className="underline font-medium hover:opacity-80"
                      >
                        Create a project first
                      </a>{" "}
                      to start tracking time.
                    </p>
                  )}
                </div>

                <div className={commonStyles.formGroup}>
                  <label className={cn(commonStyles.label, themeStyles.label)}>
                    Task Description *
                  </label>
                  <Input
                    value={newEntry.task_description}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        task_description: e.target.value,
                      }))
                    }
                    placeholder="What are you working on?"
                  />
                </div>

                <div className={commonStyles.formGroup}>
                  <label className={cn(commonStyles.label, themeStyles.label)}>
                    Tags
                  </label>
                  <div className={commonStyles.tagInput}>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addTag())
                      }
                      placeholder="Add a tag"
                    />
                    <Button variant="ghost" size="sm" onClick={addTag}>
                      <Plus size={14} /> Add
                    </Button>
                  </div>
                  {newEntry.tags.length > 0 && (
                    <div className={commonStyles.selectedTags}>
                      {newEntry.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            commonStyles.selectedTag,
                            themeStyles.selectedTag,
                          )}
                        >
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={commonStyles.formGroup}>
                  <label className={commonStyles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newEntry.billable}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          billable: e.target.checked,
                        }))
                      }
                    />
                    <span
                      className={cn(
                        commonStyles.checkboxText,
                        themeStyles.checkboxText,
                      )}
                    >
                      Billable time
                    </span>
                  </label>
                </div>

                <div className={commonStyles.formGroup}>
                  <label className={cn(commonStyles.label, themeStyles.label)}>
                    Notes (optional)
                  </label>
                  <Textarea
                    value={newEntry.notes}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div
                className={cn(
                  commonStyles.modalFooter,
                  themeStyles.modalFooter,
                )}
              >
                <Button variant="ghost" onClick={() => setShowTimer(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={startTimer}
                  disabled={
                    !newEntry.project_id || !newEntry.task_description.trim()
                  }
                >
                  <Clock size={16} /> Start Timer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteTargetId && (
          <div
            className={commonStyles.modalOverlay}
            onClick={() => setDeleteTargetId(null)}
          >
            <div
              className={cn(commonStyles.modal, themeStyles.modal)}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className={cn(commonStyles.modalTitle, themeStyles.modalTitle)}
              >
                Delete Time Entry
              </h2>
              <p
                className={cn(
                  commonStyles.confirmText,
                  themeStyles.confirmText,
                )}
              >
                Are you sure you want to delete this time entry? This action
                cannot be undone.
              </p>
              <div
                className={cn(
                  commonStyles.modalFooter,
                  themeStyles.modalFooter,
                )}
              >
                <Button variant="ghost" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteEntry(deleteTargetId)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={cn(
            "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-opacity",
            toast.type === "success" ? "bg-green-600" : "bg-red-600",
          )}
          onClick={() => setToast(null)}
        >
          {toast.message}
        </div>
      )}
    </PageTransition>
  );
}
