// @AI-HINT: Admin Projects page. Full project management — create, delete, update status, assign freelancers.
"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Skeleton from "@/app/components/Animations/Skeleton/Skeleton";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import { PageTransition, ScrollReveal } from "@/app/components/Animations";
import api from "@/lib/api";
import common from "./AdminProjects.common.module.css";
import light from "./AdminProjects.light.module.css";
import dark from "./AdminProjects.dark.module.css";

interface ProjectRow {
  id: string;
  name: string;
  client: string;
  budget: string;
  status: "open" | "in_progress" | "completed" | "cancelled" | "paused" | string;
  updated: string;
  category: string;
  skills: string;
}

const STATUSES = ["All", "open", "in_progress", "completed", "cancelled", "paused"] as const;

const statusDotClass = (status: string) => {
  switch (status) {
    case "open": return common.badgeDotPlanned;
    case "in_progress": return common.badgeDotInProgress;
    case "cancelled": return common.badgeDotBlocked;
    case "completed": return common.badgeDotCompleted;
    default: return common.badgeDotPlanned;
  }
};

const AdminProjects: React.FC = () => {
  const router = useRouter();
  const toaster = useToaster();
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === "dark" ? dark : light;

  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sort state
  type SortKey = "name" | "client" | "budget" | "status" | "updated";
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Create project modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: "", description: "", budget: "", category: "", skills: "" });
  const [creating, setCreating] = useState(false);

  // Edit project modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string; title: string; description: string; status: string; category: string }>({
    id: "", title: "", description: "", status: "open", category: "",
  });
  const [editing, setEditing] = useState(false);

  // Delete confirmation
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, any> = { page, page_size: pageSize };
      if (query) filters.search = query;
      if (status !== "All") filters.status = status;

      const response = (await api.admin.getProjects(filters)) as {
        projects?: any[];
        items?: any[];
        total?: number;
      };

      const projectsList = response?.projects || response?.items || [];
      const mapped: ProjectRow[] = (Array.isArray(projectsList) ? projectsList : []).map((p: any) => ({
        id: String(p.id),
        name: p.title || "Untitled",
        client: p.client || `Client #${p.client_id || "?"}`,
        budget: p.budget || "$0 - $0",
        status: p.status || "open",
        updated: p.updated_at || "",
        category: p.category || "",
        skills: p.skills || "",
      }));
      setProjects(mapped);
      setTotalProjects(response?.total || 0);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query, status]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { setPage(1); }, [query, status, pageSize]);

  const filtered = useMemo(() => {
    return projects;
  }, [projects]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let av = "";
      let bv = "";
      switch (sortKey) {
        case "name": av = a.name || ""; bv = b.name || ""; break;
        case "client": av = a.client || ""; bv = b.client || ""; break;
        case "budget": av = a.budget || ""; bv = b.budget || ""; break;
        case "status": av = a.status || ""; bv = b.status || ""; break;
        case "updated": av = a.updated || ""; bv = b.updated || ""; break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));
  const pageSafe = Math.min(Math.max(1, page), totalPages);
  useEffect(() => { setPage(1); }, [sortKey, sortDir, query, status, pageSize]);

  // ── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      toaster?.notify?.({ title: "Error", description: "Project title is required", variant: "error" });
      return;
    }
    setCreating(true);
    try {
      await api.admin.createProject({
        title: createForm.title,
        description: createForm.description,
        budget_min: createForm.budget ? Number(createForm.budget) : undefined,
        category: createForm.category,
        skills: createForm.skills,
      });
      toaster?.notify?.({ title: "Created", description: "Project created successfully", variant: "success" });
      setCreateModalOpen(false);
      setCreateForm({ title: "", description: "", budget: "", category: "", skills: "" });
      fetchProjects();
    } catch {
      toaster?.notify?.({ title: "Error", description: "Failed to create project", variant: "error" });
    } finally {
      setCreating(false);
    }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const openEdit = (p: ProjectRow) => {
    setEditForm({ id: p.id, title: p.name, description: "", status: p.status, category: p.category });
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!editForm.title.trim()) {
      toaster?.notify?.({ title: "Error", description: "Title is required", variant: "error" });
      return;
    }
    setEditing(true);
    try {
      await api.admin.updateProject(Number(editForm.id), {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status,
        category: editForm.category,
      });
      toaster?.notify?.({ title: "Updated", description: "Project updated successfully", variant: "success" });
      setEditModalOpen(false);
      fetchProjects();
    } catch {
      toaster?.notify?.({ title: "Error", description: "Failed to update project", variant: "error" });
    } finally {
      setEditing(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await api.admin.deleteProject(Number(deleteModal.id));
      toaster?.notify?.({ title: "Deleted", description: "Project deleted successfully", variant: "success" });
      setDeleteModal(null);
      fetchProjects();
    } catch {
      toaster?.notify?.({ title: "Error", description: "Failed to delete project", variant: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const exportCSV = () => {
    const header = ["ID", "Name", "Client", "Budget", "Status", "Category", "Updated"];
    const data = sorted.map((p) => [p.id, p.name, p.client, p.budget, p.status, p.category, p.updated]);
    const csv = [header, ...data].map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `projects_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        <ScrollReveal className={common.header}>
          <div>
            <h1 className={common.title}>Projects</h1>
            <p className={cn(common.subtitle, themed.subtitle)}>
              Platform-wide project management. Create, update, delete, and monitor all projects.
            </p>
          </div>
          <div className={common.controls} aria-label="Project filters">
            <label className={common.srOnly} htmlFor="q">Search</label>
            <input id="q" className={cn(common.input, themed.input)} type="search" placeholder="Search projects..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <label className={common.srOnly} htmlFor="status">Status</label>
            <select id="status" className={cn(common.select, themed.select)} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
              {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <button type="button" className={cn(common.button, themed.button)} onClick={() => setCreateModalOpen(true)}>Create Project</button>
          </div>
        </ScrollReveal>

        <ScrollReveal className={common.tableWrap} aria-busy={loading || undefined} delay={0.2}>
          {error && <div className={common.error}>Failed to load projects.</div>}
          <div className={cn(common.toolbar)}>
            <div className={common.controls}>
              <label className={common.srOnly} htmlFor="sort-key">Sort by</label>
              <select id="sort-key" className={cn(common.select, themed.select)} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                <option value="updated">Updated</option>
                <option value="status">Status</option>
                <option value="name">Name</option>
                <option value="client">Client</option>
                <option value="budget">Budget</option>
              </select>
              <label className={common.srOnly} htmlFor="sort-dir">Sort direction</label>
              <select id="sort-dir" className={cn(common.select, themed.select)} value={sortDir} onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
              <label className={common.srOnly} htmlFor="page-size">Rows per page</label>
              <select id="page-size" className={cn(common.select, themed.select)} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div>
              <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={exportCSV} disabled={sorted.length === 0}>Export CSV</button>
            </div>
          </div>
          <table className={cn(common.table, themed.table)}>
            <thead>
              <tr>
                <th scope="col" className={themed.th + " " + common.th}>Name</th>
                <th scope="col" className={themed.th + " " + common.th}>Client</th>
                <th scope="col" className={themed.th + " " + common.th}>Budget</th>
                <th scope="col" className={themed.th + " " + common.th}>Status</th>
                <th scope="col" className={themed.th + " " + common.th}>Updated</th>
                <th scope="col" className={themed.th + " " + common.th} aria-label="Actions">Actions</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className={common.row}>
                    <td className={themed.td + " " + common.td} colSpan={6}>
                      <div className={common.skeletonRow}>
                        <Skeleton height={14} width={"40%"} />
                        <Skeleton height={12} width={"70%"} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id} className={common.row}>
                    <td className={themed.td + " " + common.td}>{p.name}</td>
                    <td className={themed.td + " " + common.td}>{p.client}</td>
                    <td className={themed.td + " " + common.td}>{p.budget}</td>
                    <td className={themed.td + " " + common.td}>
                      <span className={cn(common.badge, themed.badge)}>
                        <span className={cn(common.badgeDot, statusDotClass(p.status))} aria-hidden="true" />
                        {p.status}
                      </span>
                    </td>
                    <td className={themed.td + " " + common.td}>{p.updated ? new Date(p.updated).toLocaleDateString() : "—"}</td>
                    <td className={themed.td + " " + common.td}>
                      <div className={common.rowActions}>
                        <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => openEdit(p)}>Edit</button>
                        <button type="button" className={cn(common.button, themed.button)} style={{ background: "#ef4444", borderColor: "#ef4444", color: "#fff" }} onClick={() => setDeleteModal({ id: p.id, name: p.name })}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
          {sorted.length === 0 && !loading && (
            <div className={cn(common.empty)} role="status" aria-live="polite">No projects match your filters.</div>
          )}
          {totalProjects > 0 && (
            <div className={common.paginationBar} role="navigation" aria-label="Pagination">
              <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1} aria-label="Previous page">Prev</button>
              <span className={common.paginationInfo} aria-live="polite">Page {pageSafe} of {totalPages} &middot; {totalProjects} result(s)</span>
              <button type="button" className={cn(common.button, themed.button)} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe === totalPages} aria-label="Next page">Next</button>
            </div>
          )}
        </ScrollReveal>
      </div>

      {/* Create Project Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setCreateModalOpen(false); }}>
          <div className={cn(common.container, themed.themeWrapper, "max-w-lg w-full mx-4 rounded-xl shadow-xl")} style={{ background: "var(--bg-primary, #fff)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color, #e5e7eb)" }}>
              <h2 className="text-lg font-semibold">Create New Project</h2>
              <button onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title *</label>
                <input type="text" className={cn(common.input, themed.input, "w-full")} placeholder="Enter project title" value={createForm.title} onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className={cn(common.input, themed.input, "w-full")} rows={3} placeholder="Describe the project..." value={createForm.description} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Budget Min ($)</label>
                  <input type="number" className={cn(common.input, themed.input, "w-full")} placeholder="0" value={createForm.budget} onChange={(e) => setCreateForm((f) => ({ ...f, budget: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input type="text" className={cn(common.input, themed.input, "w-full")} placeholder="e.g. Web Development" value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Skills</label>
                <input type="text" className={cn(common.input, themed.input, "w-full")} placeholder="e.g. React, Node.js, TypeScript" value={createForm.skills} onChange={(e) => setCreateForm((f) => ({ ...f, skills: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t" style={{ borderColor: "var(--border-color, #e5e7eb)" }}>
              <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setCreateModalOpen(false)}>Cancel</button>
              <button type="button" className={cn(common.button, themed.button)} onClick={handleCreate} disabled={!createForm.title.trim() || creating}>
                {creating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setEditModalOpen(false); }}>
          <div className={cn(common.container, themed.themeWrapper, "max-w-lg w-full mx-4 rounded-xl shadow-xl")} style={{ background: "var(--bg-primary, #fff)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color, #e5e7eb)" }}>
              <h2 className="text-lg font-semibold">Edit Project #{editForm.id}</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" className={cn(common.input, themed.input, "w-full")} value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className={cn(common.input, themed.input, "w-full")} rows={3} value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select className={cn(common.input, themed.input, "w-full")} value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input type="text" className={cn(common.input, themed.input, "w-full")} value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t" style={{ borderColor: "var(--border-color, #e5e7eb)" }}>
              <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button type="button" className={cn(common.button, themed.button)} onClick={handleEdit} disabled={!editForm.title.trim() || editing}>
                {editing ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={(e) => { if (e.target === e.currentTarget) setDeleteModal(null); }}>
          <div className={cn(common.container, themed.themeWrapper, "max-w-md w-full mx-4 rounded-xl shadow-xl")} style={{ background: "var(--bg-primary, #fff)" }}>
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold" style={{ color: "#ef4444" }}>Delete Project</h2>
              <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>? This will cancel associated contracts and proposals.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setDeleteModal(null)}>Cancel</button>
                <button type="button" className={cn(common.button, themed.button)} style={{ background: "#ef4444", borderColor: "#ef4444" }} onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default AdminProjects;
