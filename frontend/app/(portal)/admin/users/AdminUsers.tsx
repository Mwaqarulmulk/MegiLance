// @AI-HINT: Admin Users page. Full user management with suspend/restore/delete/edit role per user + bulk actions.
"use client";

import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/app/components/Animations/PageTransition";
import { ScrollReveal } from "@/app/components/Animations/ScrollReveal";
import { StaggerContainer } from "@/app/components/Animations/StaggerContainer";
import api from "@/lib/api";
import ErrorBanner from "@/app/components/molecules/ErrorBanner/ErrorBanner";
import common from "./AdminUsers.common.module.css";
import light from "./AdminUsers.light.module.css";
import dark from "./AdminUsers.dark.module.css";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Client" | "Freelancer";
  status: "Active" | "Suspended";
  joined: string;
  headline: string;
  availabilityStatus: string;
}

const ROLES = ["All", "Admin", "Client", "Freelancer"] as const;
const STATUSES = ["All", "Active", "Suspended"] as const;

const AdminUsers: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === "dark" ? dark : light;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{
    kind: "suspend" | "restore" | "delete";
    count: number;
    userId?: string;
    userName?: string;
  } | null>(null);

  const [editModal, setEditModal] = useState<{
    userId: string;
    userName: string;
    currentRole: string;
  } | null>(null);
  const [editRole, setEditRole] = useState("client");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [sortKey, setSortKey] = useState<keyof UserRow>("joined");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  interface RawUserData {
    id: number | string;
    name?: string;
    email?: string;
    user_type?: string;
    role?: string;
    is_active?: boolean;
    joined_at?: string;
    headline?: string;
    availability_status?: string;
  }

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, any> = {
        page,
        page_size: pageSize,
      };
      if (debouncedQuery) filters.search = debouncedQuery;
      if (role !== "All") filters.role = role;
      if (status !== "All") filters.status = status;

      const response = (await api.admin.getUsers(filters)) as {
        users?: RawUserData[];
        items?: RawUserData[];
        total?: number;
      };

      const usersList = response?.users || response?.items || [];
      if (Array.isArray(usersList) && usersList.length > 0) {
        const mappedUsers: UserRow[] = usersList.map((u: RawUserData) => ({
          id: String(u.id),
          name: u.name || "Unknown",
          email: u.email || "",
          role: (u.role || u.user_type || "Client") as UserRow["role"],
          status: u.is_active ? "Active" : ("Suspended" as UserRow["status"]),
          joined: u.joined_at || new Date().toISOString(),
          headline: u.headline || "",
          availabilityStatus: u.availability_status || "",
        }));
        setRows(mappedUsers);
        setTotalUsers(response.total || 0);
      } else {
        setRows([]);
        setTotalUsers(0);
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedQuery, role, status]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQuery, role, status, pageSize]);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const allSelected = rows.length > 0 && rows.every((r) => selected[r.id]);
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  const toggleAll = () => {
    if (allSelected) {
      const copy = { ...selected };
      rows.forEach((r) => { delete copy[r.id]; });
      setSelected(copy);
    } else {
      const copy = { ...selected };
      rows.forEach((r) => { copy[r.id] = true; });
      setSelected(copy);
    }
  };

  const openModal = (kind: "suspend" | "restore" | "delete", userId?: string, userName?: string) => {
    const count = kind === "delete" ? 1 : selectedIds.length;
    if (kind !== "delete" && count === 0) return;
    setModal({ kind, count, userId, userName });
  };

  const applyBulk = async () => {
    if (!modal) return;
    const kind = modal.kind;

    try {
      if (kind === "delete" && modal.userId) {
        await api.admin.deleteUser(Number(modal.userId));
        fetchUsers();
        showToast("User deleted successfully");
      } else {
        const ids = kind === "delete" && modal.userId ? [modal.userId] : selectedIds;
        await Promise.all(
          ids.map((id) => api.admin.toggleUserStatus(Number(id))),
        );
        fetchUsers();
        showToast(
          `${ids.length} user(s) ${kind === "suspend" ? "suspended" : "restored"} successfully!`,
        );
      }
      setSelected({});
      setModal(null);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update users", err);
      }
      showToast("Failed to update some users. Please try again.", "error");
    }
  };

  const openEditRole = (userId: string, userName: string, currentRole: string) => {
    setEditModal({ userId, userName, currentRole });
    setEditRole(currentRole.toLowerCase());
  };

  const applyEditRole = async () => {
    if (!editModal) return;
    try {
      await api.admin.updateUser(Number(editModal.userId), { role: editRole });
      fetchUsers();
      setEditModal(null);
      showToast(`Role updated to ${editRole}`);
    } catch (err) {
      showToast("Failed to update role", "error");
    }
  };

  const onSort = (key: keyof UserRow) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const exportCSV = () => {
    const header = ["ID", "Name", "Email", "Role", "Status", "Joined Date"];
    const rowsCsv = sorted.map((r) => [
      r.id, r.name, r.email, r.role, r.status,
      new Date(r.joined).toLocaleDateString(),
    ]);
    const csv = [header, ...rowsCsv]
      .map((cols) =>
        cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition>
      <main className={cn(common.page, themed.themeWrapper)}>
        <div className={common.container}>
          <ScrollReveal>
            <div className={common.header}>
              <div>
                <h1 className={common.title}>Users</h1>
                <p className={cn(common.subtitle, themed.subtitle)}>
                  Manage all platform users. Filter by role and status, edit roles, suspend, restore, or delete accounts.
                </p>
              </div>
              <div className={common.controls} aria-label="User filters">
                <label className={common.srOnly} htmlFor="q">Search</label>
                <input
                  id="q"
                  className={cn(common.input, themed.input)}
                  type="search"
                  placeholder="Search users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <label className={common.srOnly} htmlFor="role">Role</label>
                <select
                  id="role"
                  className={cn(common.select, themed.select)}
                  value={role}
                  onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <label className={common.srOnly} htmlFor="status">Status</label>
                <select
                  id="status"
                  className={cn(common.select, themed.select)}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={cn(common.button, themed.button)}
                  onClick={() => openModal("suspend")}
                  disabled={selectedIds.length === 0}
                >
                  Suspend
                </button>
                <button
                  type="button"
                  className={cn(common.button, themed.button, "secondary")}
                  onClick={() => openModal("restore")}
                  disabled={selectedIds.length === 0}
                >
                  Restore
                </button>
                <button
                  type="button"
                  className={cn(common.button, themed.button, "secondary")}
                  onClick={exportCSV}
                  disabled={sorted.length === 0}
                >
                  Export CSV
                </button>
                <label className={common.srOnly} htmlFor="pageSize">Rows per page</label>
                <select
                  id="pageSize"
                  className={cn(common.select, themed.select)}
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  aria-label="Rows per page"
                >
                  {[10, 20, 50].map((sz) => (
                    <option key={sz} value={sz}>{sz}/page</option>
                  ))}
                </select>
              </div>
            </div>
          </ScrollReveal>

          {selectedIds.length > 0 && (
            <div className={cn(common.bulkBar, themed.bulkBar)} role="status" aria-live="polite">
              {selectedIds.length} selected
            </div>
          )}

          <StaggerContainer delay={0.1} className={common.tableWrap}>
            {loading && (
              <div className={common.skeletonRow} aria-busy={loading || undefined} />
            )}
            {error && (
              <ErrorBanner title="Failed to load users" message={error} onRetry={fetchUsers} showGoHome={false} />
            )}
            <table className={cn(common.table, themed.table)}>
              <thead>
                <tr>
                  <th scope="col" className={themed.th + " " + common.th}>
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th scope="col" className={themed.th + " " + common.th}
                    aria-sort={sortKey === "name" ? sortDir === "asc" ? "ascending" : "descending" : undefined}
                  >
                    <button type="button" className={common.sortBtn} onClick={() => onSort("name")} aria-label="Sort by name">
                      Name
                      {sortKey === "name" && <span aria-hidden="true" className={common.sortIndicator}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                    </button>
                  </th>
                  <th scope="col" className={themed.th + " " + common.th}
                    aria-sort={sortKey === "email" ? sortDir === "asc" ? "ascending" : "descending" : undefined}
                  >
                    <button type="button" className={common.sortBtn} onClick={() => onSort("email")} aria-label="Sort by email">
                      Email
                      {sortKey === "email" && <span aria-hidden="true" className={common.sortIndicator}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                    </button>
                  </th>
                  <th scope="col" className={themed.th + " " + common.th}
                    aria-sort={sortKey === "role" ? sortDir === "asc" ? "ascending" : "descending" : undefined}
                  >
                    <button type="button" className={common.sortBtn} onClick={() => onSort("role")} aria-label="Sort by role">
                      Role
                      {sortKey === "role" && <span aria-hidden="true" className={common.sortIndicator}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                    </button>
                  </th>
                  <th scope="col" className={themed.th + " " + common.th}
                    aria-sort={sortKey === "status" ? sortDir === "asc" ? "ascending" : "descending" : undefined}
                  >
                    <button type="button" className={common.sortBtn} onClick={() => onSort("status")} aria-label="Sort by status">
                      Status
                      {sortKey === "status" && <span aria-hidden="true" className={common.sortIndicator}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                    </button>
                  </th>
                  <th scope="col" className={themed.th + " " + common.th}
                    aria-sort={sortKey === "joined" ? sortDir === "asc" ? "ascending" : "descending" : undefined}
                  >
                    <button type="button" className={common.sortBtn} onClick={() => onSort("joined")} aria-label="Sort by joined">
                      Joined
                      {sortKey === "joined" && <span aria-hidden="true" className={common.sortIndicator}>{sortDir === "asc" ? "\u25B2" : "\u25BC"}</span>}
                    </button>
                  </th>
                  <th scope="col" className={themed.th + " " + common.th} aria-label="Actions">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((u) => (
                  <tr key={u.id} className={common.row}>
                    <td className={themed.td + " " + common.td}>
                      <input
                        type="checkbox"
                        aria-label={`Select ${u.name}`}
                        checked={!!selected[u.id]}
                        onChange={(e) =>
                          setSelected((prev) => ({ ...prev, [u.id]: e.target.checked }))
                        }
                      />
                    </td>
                    <td className={themed.td + " " + common.td}>{u.name}</td>
                    <td className={themed.td + " " + common.td}>{u.email}</td>
                    <td className={themed.td + " " + common.td}>{u.role}</td>
                    <td className={themed.td + " " + common.td}>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                        u.status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}>
                        {u.status}
                      </span>
                    </td>
                    <td className={themed.td + " " + common.td}>
                      {new Date(u.joined).toLocaleDateString()}
                    </td>
                    <td className={themed.td + " " + common.td}>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          type="button"
                          className={cn(common.button, themed.button, "secondary")}
                          style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                          onClick={() => openEditRole(u.id, u.name, u.role)}
                        >
                          Edit Role
                        </button>
                        <button
                          type="button"
                          className={cn(common.button, themed.button, "secondary")}
                          style={{ fontSize: "0.7rem", padding: "2px 6px" }}
                          onClick={() => openModal(u.status === "Active" ? "suspend" : "restore", u.id, u.name)}
                        >
                          {u.status === "Active" ? "Suspend" : "Restore"}
                        </button>
                        <button
                          type="button"
                          className={cn(common.button, themed.button)}
                          style={{ fontSize: "0.7rem", padding: "2px 6px", background: "#ef4444", borderColor: "#ef4444", color: "#fff" }}
                          onClick={() => openModal("delete", u.id, u.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sorted.length === 0 && !loading && !error && (
              <div role="status" aria-live="polite" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", gap: "0.5rem", textAlign: "center" }}>
                <strong>
                  {debouncedQuery || role !== "All" || status !== "All"
                    ? "No users match your filters."
                    : "No users found."}
                </strong>
                <span style={{ fontSize: "0.88rem", opacity: 0.7 }}>
                  {debouncedQuery || role !== "All" || status !== "All"
                    ? "Try adjusting your search or filter criteria."
                    : "Users will appear here once they register on the platform."}
                </span>
              </div>
            )}
            {totalUsers > 0 && (
              <div className={common.paginationBar} role="navigation" aria-label="Pagination">
                <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">Prev</button>
                <span className={common.paginationInfo} aria-live="polite">Page {page} of {totalPages} &middot; {totalUsers} result(s)</span>
                <button type="button" className={cn(common.button, themed.button)} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">Next</button>
              </div>
            )}
          </StaggerContainer>
        </div>

        {/* Bulk Action / Delete Confirmation Modal */}
        {modal && (
          <div className={common.modalOverlay} role="presentation" onClick={() => setModal(null)}>
            <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className={cn(common.modal, themed.modal)} onClick={(e) => e.stopPropagation()}>
              <div id="modal-title" className={cn(common.modalTitle)}>
                {modal.kind === "suspend" && "Suspend Users"}
                {modal.kind === "restore" && "Restore Users"}
                {modal.kind === "delete" && "Delete User"}
              </div>
              {modal.kind === "delete" ? (
                <p>Are you sure you want to delete <strong>{modal.userName || `User #${modal.userId}`}</strong>? This will deactivate their account and cancel active contracts.</p>
              ) : (
                <p>{modal.count} selected user(s). Are you sure you want to {modal.kind} them?</p>
              )}
              <div className={common.modalActions}>
                <button
                  type="button"
                  className={cn(common.button, themed.button)}
                  style={modal.kind === "delete" ? { background: "#ef4444", borderColor: "#ef4444" } : undefined}
                  onClick={applyBulk}
                >
                  {modal.kind === "delete" ? "Delete" : "Confirm"}
                </button>
                <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editModal && (
          <div className={common.modalOverlay} role="presentation" onClick={() => setEditModal(null)}>
            <div role="dialog" aria-modal="true" aria-labelledby="edit-role-title" className={cn(common.modal, themed.modal)} onClick={(e) => e.stopPropagation()}>
              <div id="edit-role-title" className={cn(common.modalTitle)}>Edit Role</div>
              <p>Change role for <strong>{editModal.userName}</strong></p>
              <div style={{ margin: "1rem 0" }}>
                <label className={common.srOnly} htmlFor="edit-role-select">Role</label>
                <select
                  id="edit-role-select"
                  className={cn(common.select, themed.select)}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={common.modalActions}>
                <button type="button" className={cn(common.button, themed.button)} onClick={applyEditRole}>
                  Save
                </button>
                <button type="button" className={cn(common.button, themed.button, "secondary")} onClick={() => setEditModal(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={cn(
            common.toast,
            toast.type === "error" && common.toastError,
            themed.toast,
            toast.type === "error" && themed.toastError,
          )}>
            {toast.message}
          </div>
        )}
      </main>
    </PageTransition>
  );
};

export default AdminUsers;
