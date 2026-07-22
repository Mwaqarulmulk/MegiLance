// @AI-HINT: Workroom client component - Kanban board, Files, Discussions for project collaboration
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { workroomApi, disputesApi, milestonesApi } from "@/lib/api";
import Button from "@/app/components/atoms/Button/Button";
import commonStyles from "./Workroom.common.module.css";
import lightStyles from "./Workroom.light.module.css";
import darkStyles from "./Workroom.dark.module.css";

type TabType = "kanban" | "files" | "discussions";
type TaskStatus = "todo" | "in_progress" | "review" | "done";

interface Activity {
  id: number;
  activity_type: string;
  entity_type: string;
  entity_id: number;
  description: string;
  user_name: string;
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  assignee_name: string | null;
  due_date: string | null;
  created_at: string;
}

interface WorkroomFile {
  id: number;
  filename: string;
  file_size: number;
  file_type: string;
  uploaded_by_name: string;
  created_at: string;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  author_name: string;
  reply_count: number;
  created_at: string;
  is_resolved: boolean;
}

// Raw API response types for transformation
interface RawTaskData {
  id: number;
  title: string;
  description?: string;
  column_name?: string;
  column?: string;
  priority?: "low" | "medium" | "high";
  assignee_name?: string;
  due_date?: string;
  created_at: string;
}

interface RawFileData {
  id: number;
  original_name?: string;
  filename?: string;
  file_size?: number;
  content_type?: string;
  file_type?: string;
  uploaded_by_name?: string;
  uploader_name?: string;
  created_at: string;
}

interface RawDiscussionData {
  id: number;
  title: string;
  content: string;
  author_name?: string;
  reply_count?: number;
  created_at: string;
  is_resolved?: boolean;
}

interface WorkroomClientProps {
  contractId: string;
}

export default function WorkroomClient({ contractId }: WorkroomClientProps) {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [files, setFiles] = useState<WorkroomFile[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("payment_dispute");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [milestones, setMilestones] = useState<any[]>([]);

  // Task creation modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskColumn, setTaskColumn] = useState<string>("todo");
  const [taskPriority, setTaskPriority] = useState<string>("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState<string | null>(null);

  // File upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Discussion creation modal
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [discussionTitle, setDiscussionTitle] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [discussionSubmitting, setDiscussionSubmitting] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);

  // Activity log
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!contractId) return;
    milestonesApi
      .list(contractId)
      .then((data: any) => {
        setMilestones(data?.items || data || []);
      })
      .catch(() => {});
  }, [contractId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const [boardRes, filesRes, discussionsRes] = await Promise.all([
        workroomApi.getBoard(contractId).catch((e: unknown) => {
          console.error("Board load failed:", e);
          return null;
        }),
        workroomApi.getFiles(contractId).catch((e: unknown) => {
          console.error("Files load failed:", e);
          return null;
        }),
        workroomApi.getDiscussions(contractId).catch((e: unknown) => {
          console.error("Discussions load failed:", e);
          return null;
        }),
      ]);

      // Transform board data — API returns { columns: { todo: [...], in_progress: [...], ... } } or flat task list
      type BoardResponse =
        | { columns?: Record<string, RawTaskData[]> }
        | RawTaskData[];
      const boardData = boardRes as BoardResponse | null;
      if (boardData) {
        const allTasks: Task[] = [];
        if (!Array.isArray(boardData) && boardData.columns) {
          for (const [status, columnTasks] of Object.entries(
            boardData.columns,
          )) {
            if (Array.isArray(columnTasks)) {
              for (const t of columnTasks) {
                allTasks.push({
                  id: t.id,
                  title: t.title,
                  description: t.description || "",
                  status: (t.column_name || t.column || status) as TaskStatus,
                  priority: t.priority || "medium",
                  assignee_name: t.assignee_name || null,
                  due_date: t.due_date || null,
                  created_at: t.created_at,
                });
              }
            }
          }
        } else if (Array.isArray(boardData)) {
          for (const t of boardData) {
            allTasks.push({
              id: t.id,
              title: t.title,
              description: t.description || "",
              status: (t.column_name || t.column || "todo") as TaskStatus,
              priority: t.priority || "medium",
              assignee_name: t.assignee_name || null,
              due_date: t.due_date || null,
              created_at: t.created_at,
            });
          }
        }
        setTasks(allTasks);
      } else {
        setTasks([]);
      }

      // Transform files
      type FilesResponse = { files?: RawFileData[] } | RawFileData[];
      const fileData = filesRes as FilesResponse | null;
      const fileList: RawFileData[] = fileData
        ? !Array.isArray(fileData) && fileData.files
          ? fileData.files
          : Array.isArray(fileData)
            ? fileData
            : []
        : [];
      setFiles(
        fileList.map((f: RawFileData) => ({
          id: f.id,
          filename: f.original_name || f.filename || "",
          file_size: f.file_size || 0,
          file_type: f.content_type || f.file_type || "",
          uploaded_by_name: f.uploaded_by_name || f.uploader_name || "Unknown",
          created_at: f.created_at,
        })),
      );

      // Transform discussions
      type DiscussionsResponse =
        | { discussions?: RawDiscussionData[] }
        | RawDiscussionData[];
      const discData = discussionsRes as DiscussionsResponse | null;
      const discList: RawDiscussionData[] = discData
        ? !Array.isArray(discData) && discData.discussions
          ? discData.discussions
          : Array.isArray(discData)
            ? discData
            : []
        : [];
      setDiscussions(
        discList.map((d: RawDiscussionData) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          author_name: d.author_name || "Unknown",
          reply_count: d.reply_count || 0,
          created_at: d.created_at,
          is_resolved: d.is_resolved || false,
        })),
      );
    } catch (err: unknown) {
      const isAbortError = err instanceof Error && err.name === "AbortError";
      if (!isAbortError) {
        setError("Failed to load workroom data. Please try again.");
        if (process.env.NODE_ENV === "development") {
          console.error("Workroom fetch error:", err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (mounted) {
      fetchData();
    }
  }, [mounted, fetchData]);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      setTaskError("Task title is required");
      return;
    }
    setTaskSubmitting(true);
    setTaskError(null);
    try {
      const newTask = await workroomApi.createTask(contractId, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        column: taskColumn,
        priority: taskPriority,
        due_date: taskDueDate || undefined,
      }) as any;
      if (newTask) {
        setTasks((prev) => [
          ...prev,
          {
            id: newTask.id,
            title: newTask.title,
            description: newTask.description || "",
            status: (newTask.column_name || taskColumn) as TaskStatus,
            priority: (newTask.priority || taskPriority) as "low" | "medium" | "high",
            assignee_name: newTask.assignee_name || null,
            due_date: newTask.due_date || null,
            created_at: newTask.created_at,
          },
        ]);
      }
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskColumn("todo");
      setTaskPriority("medium");
      setTaskDueDate("");
    } catch (err: any) {
      setTaskError(err?.message || "Failed to create task");
    } finally {
      setTaskSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setUploadError(null);
    try {
      const uploaded = await workroomApi.uploadFile(contractId, file) as any;
      if (uploaded) {
        setFiles((prev) => [
          ...prev,
          {
            id: uploaded.id,
            filename: uploaded.original_name || uploaded.filename || file.name,
            file_size: uploaded.file_size || file.size,
            file_type: uploaded.content_type || uploaded.file_type || file.type,
            uploaded_by_name: uploaded.uploaded_by_name || "You",
            created_at: uploaded.created_at || new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadFile = async (fileId: number, filename: string) => {
    try {
      const blob = await workroomApi.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to download file");
    }
  };

  const handleCreateDiscussion = async () => {
    if (!discussionTitle.trim() || !discussionContent.trim()) {
      setDiscussionError("Title and content are required");
      return;
    }
    setDiscussionSubmitting(true);
    setDiscussionError(null);
    try {
      const newDisc = await workroomApi.createDiscussion(contractId, {
        title: discussionTitle.trim(),
        content: discussionContent.trim(),
      }) as any;
      if (newDisc) {
        setDiscussions((prev) => [
          ...prev,
          {
            id: newDisc.id,
            title: newDisc.title,
            content: newDisc.content,
            author_name: newDisc.author_name || "You",
            reply_count: 0,
            created_at: newDisc.created_at,
            is_resolved: false,
          },
        ]);
      }
      setShowDiscussionModal(false);
      setDiscussionTitle("");
      setDiscussionContent("");
    } catch (err: any) {
      setDiscussionError(err?.message || "Failed to create discussion");
    } finally {
      setDiscussionSubmitting(false);
    }
  };

  const loadActivity = async () => {
    setLoadingActivity(true);
    try {
      const data = await workroomApi.getActivity(contractId) as any;
      setActivities(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Failed to load activity:", err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleInviteMember = async () => {
    setInviteStatus(null);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setInviteStatus("Workroom link copied");
    } catch {
      setInviteStatus("Copy failed — use the browser address bar to share this workroom.");
    }
  };

  const handleSubmitDispute = async () => {
    if (disputeDescription.trim().length < 50) {
      setDisputeError(
        "Please provide a description of at least 50 characters.",
      );
      return;
    }
    setDisputeSubmitting(true);
    setDisputeError(null);
    try {
      await disputesApi.create({
        contract_id: parseInt(contractId, 10),
        dispute_type: disputeReason,
        description: disputeDescription.trim(),
      });
      setDisputeSuccess(true);
      setShowDisputeForm(false);
      setDisputeDescription("");
      setDisputeReason("payment_dispute");
    } catch (err: any) {
      setDisputeError(
        err?.message || "Failed to submit dispute. Please try again.",
      );
    } finally {
      setDisputeSubmitting(false);
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newStatus: TaskStatus) => {
    if (draggedTask && draggedTask.status !== newStatus) {
      const oldTasks = [...tasks];
      setTasks((prev) =>
        prev.map((t) =>
          t.id === draggedTask.id ? { ...t, status: newStatus } : t,
        ),
      );
      const targetIndex = tasks.filter((t) => t.status === newStatus).length;
      workroomApi.moveTask(draggedTask.id, newStatus, targetIndex).catch(() => {
        setTasks(oldTasks); // Rollback on failure
      });
    }
    setDraggedTask(null);
  };

  if (!mounted || !resolvedTheme) {
    return (
      <div className={commonStyles.loadingContainer}>
        <div className={commonStyles.loadingSpinner}></div>
      </div>
    );
  }

  const themeStyles = resolvedTheme === "light" ? lightStyles : darkStyles;

  if (error) {
    return (
      <main className={cn(commonStyles.page, themeStyles.page)}>
        <div className={commonStyles.loadingContainer}>
          <p className={cn(commonStyles.errorText, themeStyles.errorText)}>
            {error}
          </p>
          <Button variant="primary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  const columns: { key: TaskStatus; label: string }[] = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "review", label: "In Review" },
    { key: "done", label: "Done" },
  ];

  return (
    <main className={cn(commonStyles.page, themeStyles.page)}>
      {/* Header */}
      <header className={cn(commonStyles.header, themeStyles.header)}>
        <div className={commonStyles.headerContent}>
          <h1 className={themeStyles.pageTitle}>Project Workroom</h1>
          <span className={themeStyles.contractId}>Contract #{contractId}</span>
        </div>
        <div className={commonStyles.headerActions}>
          <Button variant="secondary" size="sm" onClick={handleInviteMember}>
            Invite Member
          </Button>
          {inviteStatus && (
            <span className={commonStyles.inviteStatus} role="status" aria-live="polite">
              {inviteStatus}
            </span>
          )}
          <Button variant="primary" size="sm" onClick={() => { setShowActivityLog(true); loadActivity(); }}>
            Activity Log
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setShowDisputeForm(true);
              setDisputeError(null);
              setDisputeSuccess(false);
            }}
          >
            ⚠ Open Dispute
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className={commonStyles.tabContainer}>
        <div className={cn(commonStyles.tabs, themeStyles.tabs)}>
          <button
            className={cn(
              commonStyles.tab,
              themeStyles.tab,
              activeTab === "kanban" && commonStyles.activeTab,
              activeTab === "kanban" && themeStyles.activeTab,
            )}
            onClick={() => setActiveTab("kanban")}
          >
            📋 Kanban Board
          </button>
          <button
            className={cn(
              commonStyles.tab,
              themeStyles.tab,
              activeTab === "files" && commonStyles.activeTab,
              activeTab === "files" && themeStyles.activeTab,
            )}
            onClick={() => setActiveTab("files")}
          >
            📁 Files ({files.length})
          </button>
          <button
            className={cn(
              commonStyles.tab,
              themeStyles.tab,
              activeTab === "discussions" && commonStyles.activeTab,
              activeTab === "discussions" && themeStyles.activeTab,
            )}
            onClick={() => setActiveTab("discussions")}
          >
            💬 Discussions ({discussions.length})
          </button>
        </div>
      </div>

      {/* Content + optional Milestone sidebar */}
      <div className={commonStyles.contentWrapper}>
        <section className={commonStyles.content}>
          {loading ? (
            <div className={commonStyles.loadingContainer}>
              <div className={commonStyles.loadingSpinner}></div>
            </div>
          ) : (
            <>
              {/* Kanban Board */}
              {activeTab === "kanban" && (
                <div className={commonStyles.kanbanContainer}>
                  <div className={commonStyles.kanbanHeader}>
                    <Button variant="primary" size="sm" onClick={() => setShowTaskModal(true)}>
                      + Add Task
                    </Button>
                  </div>
                  <div className={commonStyles.kanbanBoard}>
                    {columns.map((col) => (
                      <div
                        key={col.key}
                        className={cn(
                          commonStyles.kanbanColumn,
                          themeStyles.kanbanColumn,
                        )}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(col.key)}
                      >
                        <div className={commonStyles.columnHeader}>
                          <span
                            className={cn(
                              commonStyles.columnDot,
                              commonStyles[`columnDot_${col.key}`],
                            )}
                          ></span>
                          <h3 className={themeStyles.columnTitle}>
                            {col.label}
                          </h3>
                          <span className={themeStyles.columnCount}>
                            {tasksByStatus[col.key].length}
                          </span>
                        </div>
                        <div className={commonStyles.taskList}>
                          {tasksByStatus[col.key].map((task) => (
                            <article
                              key={task.id}
                              className={cn(
                                commonStyles.taskCard,
                                themeStyles.taskCard,
                                draggedTask?.id === task.id &&
                                  commonStyles.dragging,
                              )}
                              draggable
                              onDragStart={() => handleDragStart(task)}
                            >
                              <div className={commonStyles.taskPriority}>
                                <span
                                  className={cn(
                                    commonStyles.priorityDot,
                                    commonStyles[`priority_${task.priority}`],
                                  )}
                                ></span>
                              </div>
                              <h4 className={themeStyles.taskTitle}>
                                {task.title}
                              </h4>
                              <p className={themeStyles.taskDesc}>
                                {task.description}
                              </p>
                              <div className={commonStyles.taskMeta}>
                                {task.assignee_name && (
                                  <span className={themeStyles.assignee}>
                                    {task.assignee_name}
                                  </span>
                                )}
                                {task.due_date && (
                                  <span className={themeStyles.dueDate}>
                                    📅 {formatDate(task.due_date)}
                                  </span>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {activeTab === "files" && (
                <div className={commonStyles.filesContainer}>
                  <div className={commonStyles.filesHeader}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={uploadingFile}
                    >
                      📤 Upload File
                    </Button>
                    {uploadError && (
                      <span className="text-sm text-red-500 ml-2">{uploadError}</span>
                    )}
                  </div>
                  <div className={commonStyles.fileList}>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          commonStyles.fileCard,
                          themeStyles.fileCard,
                        )}
                      >
                        <div className={commonStyles.fileIcon}>
                          {file.file_type.includes("pdf")
                            ? "📄"
                            : file.file_type.includes("image")
                              ? "🖼️"
                              : file.file_type.includes("figma")
                                ? "🎨"
                                : "📁"}
                        </div>
                        <div className={commonStyles.fileInfo}>
                          <h4 className={themeStyles.fileName}>
                            {file.filename}
                          </h4>
                          <p className={themeStyles.fileMeta}>
                            {formatFileSize(file.file_size)} • Uploaded by{" "}
                            {file.uploaded_by_name} •{" "}
                            {formatDate(file.created_at)}
                          </p>
                        </div>
                        <div className={commonStyles.fileActions}>
                          <Button variant="ghost" size="sm" onClick={() => handleDownloadFile(file.id, file.filename)}>
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discussions */}
              {activeTab === "discussions" && (
                <div className={commonStyles.discussionsContainer}>
                  <div className={commonStyles.discussionsHeader}>
                    <Button variant="primary" size="sm" onClick={() => setShowDiscussionModal(true)}>
                      + New Discussion
                    </Button>
                  </div>
                  <div className={commonStyles.discussionList}>
                    {discussions.map((disc) => (
                      <article
                        key={disc.id}
                        className={cn(
                          commonStyles.discussionCard,
                          themeStyles.discussionCard,
                        )}
                      >
                        <div className={commonStyles.discussionMeta}>
                          {disc.is_resolved && (
                            <span
                              className={cn(
                                commonStyles.resolvedBadge,
                                themeStyles.resolvedBadge,
                              )}
                            >
                              ✓ Resolved
                            </span>
                          )}
                          <span className={themeStyles.replyCount}>
                            {disc.reply_count} replies
                          </span>
                        </div>
                        <h3
                          className={cn(
                            commonStyles.discussionTitle,
                            themeStyles.discussionTitle,
                          )}
                        >
                          {disc.title}
                        </h3>
                        <p className={themeStyles.discussionContent}>
                          {disc.content}
                        </p>
                        <div className={commonStyles.discussionFooter}>
                          <span className={themeStyles.discussionAuthor}>
                            {disc.author_name} • {formatDate(disc.created_at)}
                          </span>
                          <Button variant="ghost" size="sm">
                            View Thread
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Milestones sidebar */}
        {milestones.length > 0 && (
          <aside
            className={cn(
              commonStyles.milestoneSidebar,
              themeStyles.milestoneSidebar,
            )}
          >
            <h4
              className={cn(
                commonStyles.milestoneTitle,
                themeStyles.milestoneTitle,
              )}
            >
              📋 Milestones
            </h4>
            {milestones.map((m: any) => (
              <div
                key={m.id}
                className={cn(
                  commonStyles.milestoneItem,
                  themeStyles.milestoneItem,
                )}
              >
                <div className={commonStyles.milestoneName}>{m.title}</div>
                <div
                  className={cn(
                    commonStyles.milestoneTag,
                    m.status === "approved"
                      ? commonStyles.tagSuccess
                      : m.status === "submitted"
                        ? commonStyles.tagWarning
                        : commonStyles.tagDefault,
                  )}
                >
                  {m.status || "pending"}
                </div>
                {m.amount != null && (
                  <div className={commonStyles.milestoneAmt}>
                    ${Number(m.amount).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </aside>
        )}
      </div>

      {/* ── Dispute Form Modal ── */}
      {showDisputeForm && (
        <div
          className={commonStyles.disputeOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDisputeForm(false);
          }}
        >
          <div
            className={cn(commonStyles.disputeModal, themeStyles.disputeModal)}
          >
            {/* Modal Header */}
            <div
              className={cn(
                commonStyles.disputeModalHeader,
                themeStyles.disputeModalHeader,
              )}
            >
              <h2
                id="dispute-modal-title"
                className={cn(
                  commonStyles.disputeModalTitle,
                  themeStyles.disputeModalTitle,
                )}
              >
                ⚠ Open a Dispute
              </h2>
              <button
                className={cn(
                  commonStyles.disputeCloseBtn,
                  themeStyles.disputeCloseBtn,
                )}
                onClick={() => setShowDisputeForm(false)}
                aria-label="Close dispute form"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className={commonStyles.disputeModalBody}>
              {/* Reason select */}
              <div>
                <label
                  htmlFor="dispute-reason"
                  className={cn(
                    commonStyles.disputeLabel,
                    themeStyles.disputeLabel,
                  )}
                >
                  Reason
                </label>
                <select
                  id="dispute-reason"
                  className={cn(
                    commonStyles.disputeSelect,
                    themeStyles.disputeSelect,
                  )}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                >
                  <option value="payment_dispute">Payment Dispute</option>
                  <option value="work_quality">Work Quality</option>
                  <option value="non_delivery">Non-Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description textarea */}
              <div>
                <label
                  htmlFor="dispute-description"
                  className={cn(
                    commonStyles.disputeLabel,
                    themeStyles.disputeLabel,
                  )}
                >
                  Description
                  <span style={{ fontWeight: 400, opacity: 0.6 }}>
                    {" "}
                    (min. 50 characters)
                  </span>
                </label>
                <textarea
                  id="dispute-description"
                  className={cn(
                    commonStyles.disputeTextarea,
                    themeStyles.disputeTextarea,
                  )}
                  placeholder="Describe the issue in detail..."
                  value={disputeDescription}
                  onChange={(e) => {
                    setDisputeDescription(e.target.value);
                    if (disputeError) setDisputeError(null);
                  }}
                  rows={5}
                  aria-describedby="dispute-char-count"
                />
                <div
                  id="dispute-char-count"
                  className={cn(
                    commonStyles.disputeCharCount,
                    disputeDescription.length < 50
                      ? themeStyles.disputeCharCountError
                      : "",
                  )}
                >
                  {disputeDescription.length} / 50 min
                </div>
              </div>

              {/* Error message */}
              {disputeError && (
                <div
                  className={cn(
                    commonStyles.disputeError,
                    themeStyles.disputeError,
                  )}
                  role="alert"
                >
                  {disputeError}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className={cn(
                commonStyles.disputeModalFooter,
                themeStyles.disputeModalFooter,
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDisputeForm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={disputeSubmitting}
                onClick={handleSubmitDispute}
              >
                Submit Dispute
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Task Creation Modal ── */}
      {showTaskModal && (
        <div
          className={commonStyles.disputeOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTaskModal(false); }}
        >
          <div className={cn(commonStyles.disputeModal, themeStyles.disputeModal)}>
            <div className={cn(commonStyles.disputeModalHeader, themeStyles.disputeModalHeader)}>
              <h2 id="task-modal-title" className={cn(commonStyles.disputeModalTitle, themeStyles.disputeModalTitle)}>
                + Create New Task
              </h2>
              <button className={cn(commonStyles.disputeCloseBtn, themeStyles.disputeCloseBtn)} onClick={() => setShowTaskModal(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={commonStyles.disputeModalBody}>
              <div>
                <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Title *</label>
                <input
                  type="text"
                  className={cn(commonStyles.disputeSelect, themeStyles.disputeSelect)}
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => { setTaskTitle(e.target.value); if (taskError) setTaskError(null); }}
                />
              </div>
              <div>
                <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Description</label>
                <textarea
                  className={cn(commonStyles.disputeTextarea, themeStyles.disputeTextarea)}
                  placeholder="Task description (optional)"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Column</label>
                  <select
                    className={cn(commonStyles.disputeSelect, themeStyles.disputeSelect)}
                    value={taskColumn}
                    onChange={(e) => setTaskColumn(e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Priority</label>
                  <select
                    className={cn(commonStyles.disputeSelect, themeStyles.disputeSelect)}
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Due Date</label>
                <input
                  type="date"
                  className={cn(commonStyles.disputeSelect, themeStyles.disputeSelect)}
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              {taskError && (
                <div className={cn(commonStyles.disputeError, themeStyles.disputeError)} role="alert">{taskError}</div>
              )}
            </div>
            <div className={cn(commonStyles.disputeModalFooter, themeStyles.disputeModalFooter)}>
              <Button variant="ghost" size="sm" onClick={() => setShowTaskModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" isLoading={taskSubmitting} onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Discussion Creation Modal ── */}
      {showDiscussionModal && (
        <div
          className={commonStyles.disputeOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="discussion-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDiscussionModal(false); }}
        >
          <div className={cn(commonStyles.disputeModal, themeStyles.disputeModal)}>
            <div className={cn(commonStyles.disputeModalHeader, themeStyles.disputeModalHeader)}>
              <h2 id="discussion-modal-title" className={cn(commonStyles.disputeModalTitle, themeStyles.disputeModalTitle)}>
                + New Discussion
              </h2>
              <button className={cn(commonStyles.disputeCloseBtn, themeStyles.disputeCloseBtn)} onClick={() => setShowDiscussionModal(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={commonStyles.disputeModalBody}>
              <div>
                <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Title *</label>
                <input
                  type="text"
                  className={cn(commonStyles.disputeSelect, themeStyles.disputeSelect)}
                  placeholder="Discussion title"
                  value={discussionTitle}
                  onChange={(e) => { setDiscussionTitle(e.target.value); if (discussionError) setDiscussionError(null); }}
                />
              </div>
              <div>
                <label className={cn(commonStyles.disputeLabel, themeStyles.disputeLabel)}>Content *</label>
                <textarea
                  className={cn(commonStyles.disputeTextarea, themeStyles.disputeTextarea)}
                  placeholder="Describe the topic..."
                  value={discussionContent}
                  onChange={(e) => { setDiscussionContent(e.target.value); if (discussionError) setDiscussionError(null); }}
                  rows={5}
                />
              </div>
              {discussionError && (
                <div className={cn(commonStyles.disputeError, themeStyles.disputeError)} role="alert">{discussionError}</div>
              )}
            </div>
            <div className={cn(commonStyles.disputeModalFooter, themeStyles.disputeModalFooter)}>
              <Button variant="ghost" size="sm" onClick={() => setShowDiscussionModal(false)}>Cancel</Button>
              <Button variant="primary" size="sm" isLoading={discussionSubmitting} onClick={handleCreateDiscussion}>Create Discussion</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Activity Log Panel ── */}
      {showActivityLog && (
        <div
          className={commonStyles.disputeOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setShowActivityLog(false); }}
        >
          <div className={cn(commonStyles.disputeModal, themeStyles.disputeModal)} style={{ maxHeight: "80vh" }}>
            <div className={cn(commonStyles.disputeModalHeader, themeStyles.disputeModalHeader)}>
              <h2 id="activity-modal-title" className={cn(commonStyles.disputeModalTitle, themeStyles.disputeModalTitle)}>
                Activity Log
              </h2>
              <button className={cn(commonStyles.disputeCloseBtn, themeStyles.disputeCloseBtn)} onClick={() => setShowActivityLog(false)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className={commonStyles.disputeModalBody} style={{ overflowY: "auto", maxHeight: "calc(80vh - 120px)" }}>
              {loadingActivity ? (
                <div className={commonStyles.loadingContainer}>
                  <div className={commonStyles.loadingSpinner}></div>
                </div>
              ) : activities.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No activity recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={cn(
                        "border rounded-lg p-3 text-sm",
                        themeStyles.fileCard
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">{activity.user_name}</span>
                          <span className="ml-2 text-slate-500">{activity.activity_type.replace(/_/g, " ")}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="mt-1 text-slate-600 dark:text-slate-400">{activity.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={cn(commonStyles.disputeModalFooter, themeStyles.disputeModalFooter)}>
              <Button variant="ghost" size="sm" onClick={() => setShowActivityLog(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute success toast */}
      {disputeSuccess && (
        <div
          className={cn(
            commonStyles.disputeSuccess,
            themeStyles.disputeSuccess,
          )}
          role="status"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 400,
            maxWidth: "320px",
          }}
        >
          ✓ Dispute submitted successfully. Our team will review it.
        </div>
      )}
    </main>
  );
}
