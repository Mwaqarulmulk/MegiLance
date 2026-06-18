// @AI-HINT: Freelancer Contracts component - data table with virtual scrolling, column visibility, selection, export, density toggle, and API integration for managing smart contracts.
"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/atoms/Button";
import { Badge } from "@/app/components/atoms/Badge";
import { Modal } from "@/app/components/organisms/Modal";
import { useToaster } from "@/app/components/molecules/Toast";
import api from "@/lib/api";
import { apiFetch } from "@/lib/api/core";
import { usePersistedState } from "@/app/lib/hooks/usePersistedState";
import { useSelection } from "@/app/lib/hooks/useSelection";
import { useColumnVisibility } from "@/app/lib/hooks/useColumnVisibility";
const exportCSV = (header: string[], rows: string[][], name: string) => {
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
};
const exportData = (
  format: string,
  header: string[],
  rows: string[][],
  name: string,
  opts?: any,
) => {
  exportCSV(header, rows, name);
};
import {
  DataToolbar,
  DensityToggle,
  ColumnVisibilityMenu,
  SavedViewsMenu,
  SelectionBar,
  PaginationBar,
  TableSkeleton,
  VirtualTableBody,
  SortOption,
  Density,
} from "@/app/components/DataDisplay";
import { PageTransition } from "@/app/components/Animations/PageTransition";
import { ScrollReveal } from "@/app/components/Animations/ScrollReveal";

import commonStyles from "./Contracts.common.module.css";
import lightStyles from "./Contracts.light.module.css";
import darkStyles from "./Contracts.dark.module.css";

interface ContractData {
  id: string;
  projectTitle: string;
  clientName: string;
  value: number;
  status: "Active" | "Completed" | "Disputed" | "Pending";
  contractAddress: string;
}

const getStatusBadgeVariant = (
  status: string,
): "success" | "warning" | "danger" | "neutral" | "primary" => {
  switch (status) {
    case "Active":
      return "primary";
    case "Completed":
      return "success";
    case "Disputed":
      return "danger";
    case "Pending":
      return "warning";
    default:
      return "neutral";
  }
};

const Contracts = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => {
    const themeStyles = resolvedTheme === "light" ? lightStyles : darkStyles;
    return { ...commonStyles, ...themeStyles };
  }, [resolvedTheme]);
  const toaster = useToaster();

  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch contracts from API with retry logic
  const doFetch = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);

    try {
      const data = await api.contracts.list();

      const items = (data as any)?.items || (Array.isArray(data) ? data : []);

      // Validate contract data structure
      const mapped: ContractData[] = items
        .map((c: any) => ({
          id: c?.id ?? c?.contract_id ?? 0,
          projectTitle:
            c?.job_title || c?.project_title || c?.title || "Untitled",
          clientName: c?.client_name || c?.client || "—",
          value:
            typeof c?.amount === "number"
              ? c.amount
              : typeof c?.contract_amount === "number"
                ? c.contract_amount
                : typeof c?.value === "number"
                  ? c.value
                  : 0,
          status: c?.status || "Active",
          contractAddress: c?.contract_address || c?.escrow_address || "—",
        }))
        .filter((c: ContractData) => Number(c.id) > 0);

      setContracts(mapped);
    } catch (err: any) {
      // Retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        setRetryCount((prev) => prev + 1);
        setTimeout(() => doFetch(), delay);
        return;
      }

      setFetchError(
        err?.message || "Failed to load contracts. Please try again.",
      );
      setContracts([]);
    } finally {
      setFetchLoading(false);
    }
  }, [retryCount]);

  useEffect(() => {
    let cancelled = false;
    if (!cancelled) {
      doFetch();
    }
    return () => {
      cancelled = true;
    };
  }, [doFetch]);

  const [query, setQuery] = usePersistedState<string>(
    "freelancer:contracts:q",
    "",
  );
  const [sortKey, setSortKey] = usePersistedState<
    "projectTitle" | "clientName" | "value" | "status"
  >("freelancer:contracts:sortKey", "projectTitle");
  const [sortDir, setSortDir] = usePersistedState<"asc" | "desc">(
    "freelancer:contracts:sortDir",
    "asc",
  );
  const [page, setPage] = usePersistedState<number>(
    "freelancer:contracts:page",
    1,
  );
  const [pageSize, setPageSize] = usePersistedState<number>(
    "freelancer:contracts:pageSize",
    10,
  );
  const [density, setDensity] = usePersistedState<Density>(
    "freelancer:contracts:density",
    "comfortable",
  );
  const [statusFilters, setStatusFilters] = usePersistedState<string[]>(
    "freelancer:contracts:statusFilters",
    [],
  );
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"extend" | "dispute" | null>(
    null,
  );
  const [actionTargetId, setActionTargetId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Contract modal
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [newContractLoading, setNewContractLoading] = useState(false);
  const [newContractForm, setNewContractForm] = useState({
    projectTitle: "",
    clientName: "",
    value: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowHeight = density === "compact" ? 40 : 48;

  // Strongly-typed helper to satisfy aria-sort lints with literal values only
  const ariaSortFor = (
    col: typeof sortKey,
  ): "ascending" | "descending" | "none" => {
    if (sortKey === col) return sortDir === "asc" ? "ascending" : "descending";
    return "none";
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter((c) => {
      const qMatch =
        !q ||
        c.projectTitle.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q);
      const statusMatch =
        statusFilters.length === 0 || statusFilters.includes(c.status);
      return qMatch && statusMatch;
    });
  }, [query, statusFilters, contracts]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let av: string | number = (a as any)[sortKey] ?? "";
      let bv: string | number = (b as any)[sortKey] ?? "";
      // Numeric compare for value
      if (sortKey === "value") {
        const na = Number(av);
        const nb = Number(bv);
        if (na < nb) return sortDir === "asc" ? -1 : 1;
        if (na > nb) return sortDir === "asc" ? 1 : -1;
        return 0;
      }
      const sa = String(av).toLowerCase();
      const sb = String(bv).toLowerCase();
      if (sa < sb) return sortDir === "asc" ? -1 : 1;
      if (sa > sb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (pageSafe - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageSafe, pageSize]);

  // Column visibility
  const allColumns = [
    "projectTitle",
    "clientName",
    "value",
    "status",
    "contract",
    "actions",
  ] as const;
  const {
    visible,
    toggle: toggleCol,
    setAll: setAllCols,
  } = useColumnVisibility(
    "freelancer:contracts",
    allColumns as unknown as string[],
  );
  const show = (key: (typeof allColumns)[number]) => visible.includes(key);

  // Selection
  const allFilteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const {
    selected,
    isSelected,
    toggle: toggleRow,
    clear,
    selectMany,
    deselectMany,
    count,
  } = useSelection<string>(allFilteredIds, {
    storageKey: "freelancer:contracts:selected",
  });
  const pageIds = paged.map((c) => c.id);
  const headerCheckboxChecked =
    pageIds.length > 0 && pageIds.every((id) => isSelected(id));
  const headerCheckboxIndeterminate =
    !headerCheckboxChecked && pageIds.some((id) => isSelected(id));
  const togglePageSelection = () => {
    if (headerCheckboxChecked) deselectMany(pageIds);
    else selectMany(pageIds);
  };

  // Row actions
  const viewContract = (c: ContractData) => {
    router.push(`/freelancer/contracts/${c.id}`);
  };
  const downloadContract = (c: ContractData) => {
    toaster.notify({
      title: "Download",
      description: `Preparing ${c.projectTitle} PDF…`,
      variant: "info",
    });
    window.open(`/api/contracts/${c.id}/pdf`, "_blank");
  };
  const openExtend = (id: string) => {
    setActionType("extend");
    setActionTargetId(id);
    setActionOpen(true);
  };
  const openDispute = (id: string) => {
    setActionType("dispute");
    setActionTargetId(id);
    setActionOpen(true);
  };
  const onConfirmAction = async () => {
    if (!actionType || !actionTargetId) return;
    setActionLoading(true);

    const contract = contracts.find((c) => c.id === actionTargetId);

    try {
      if (actionType === "extend") {
        // Create scope change request for extension
        const res = await apiFetch<any>("/scope-changes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_id: parseInt(actionTargetId, 10),
            title: `Extension request for ${contract?.projectTitle || "contract"}`,
            description: "Requesting deadline extension for this contract",
            reason: "Additional time needed to complete deliverables",
          }),
        });
        toaster.notify({
          title: "Extension requested",
          description:
            "We have notified the client about your extension request.",
          variant: "success",
        });
      } else if (actionType === "dispute") {
        // Create dispute
        const res = await apiFetch<any>("/disputes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contract_id: parseInt(actionTargetId, 10),
            dispute_type: "scope",
            description: `Dispute raised for contract: ${contract?.projectTitle || "Unknown"}`,
          }),
        });
        toaster.notify({
          title: "Dispute opened",
          description: "A dispute ticket has been created for this contract.",
          variant: "warning",
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Contracts] Action failed:", error);
      }
      toaster.notify({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "error",
      });
    }

    setActionLoading(false);
    setActionOpen(false);
    setActionType(null);
    setActionTargetId(null);
  };
  const onCancelAction = () => {
    setActionOpen(false);
    setActionType(null);
    setActionTargetId(null);
  };

  const handleCreateContract = async () => {
    if (
      !newContractForm.projectTitle.trim() ||
      !newContractForm.clientName.trim()
    )
      return;
    setNewContractLoading(true);
    try {
      await apiFetch("/contracts/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newContractForm.projectTitle.trim(),
          client_name: newContractForm.clientName.trim(),
          amount: parseFloat(newContractForm.value) || 0,
          start_date: newContractForm.startDate || undefined,
          end_date: newContractForm.endDate || undefined,
          description: newContractForm.description,
        }),
      });
      toaster.notify({
        title: "Contract proposal sent",
        description:
          "Your contract was created with status Pending. The client will be asked to accept it.",
        variant: "success",
      });
      setShowNewContractModal(false);
      setNewContractForm({
        projectTitle: "",
        clientName: "",
        value: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      doFetch();
    } catch (err: any) {
      toaster.notify({
        title: "Error",
        description: err?.message || "Failed to create contract.",
        variant: "error",
      });
    } finally {
      setNewContractLoading(false);
    }
  };

  const onExportCSV = () => {
    const header = ["Project", "Client", "Value", "Status", "Contract"];
    const rows = sorted.map((c) => [
      c.projectTitle,
      c.clientName,
      String(c.value),
      c.status,
      c.contractAddress,
    ]);
    exportCSV(header, rows, "contracts");
  };

  const onExport = (format: "csv" | "xlsx" | "pdf") => {
    const header = ["Project", "Client", "Value", "Status", "Contract"];
    const cols: (typeof allColumns)[number][] = [
      "projectTitle",
      "clientName",
      "value",
      "status",
      "contract",
    ];
    const rows = sorted.map((c) => [
      c.projectTitle,
      c.clientName,
      String(c.value),
      c.status,
      c.contractAddress,
    ]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter((i) => i >= 0);
    exportData(format, header, rows, "contracts", { visibleIndices });
  };

  const onExportSelected = () => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter((c) => selectedSet.has(c.id));
    const header = ["Project", "Client", "Value", "Status", "Contract"];
    const rows = selectedRows.map((c) => [
      c.projectTitle,
      c.clientName,
      String(c.value),
      c.status,
      c.contractAddress,
    ]);
    exportCSV(header, rows, "contracts-selected");
  };

  const onExportSelectedFormat = (format: "csv" | "xlsx" | "pdf") => {
    const selectedSet = new Set(selected);
    const selectedRows = filtered.filter((c) => selectedSet.has(c.id));
    const header = ["Project", "Client", "Value", "Status", "Contract"];
    const cols: (typeof allColumns)[number][] = [
      "projectTitle",
      "clientName",
      "value",
      "status",
      "contract",
    ];
    const rows = selectedRows.map((c) => [
      c.projectTitle,
      c.clientName,
      String(c.value),
      c.status,
      c.contractAddress,
    ]);
    const visibleIndices = cols
      .map((key, idx) => (visible.includes(key) ? idx : -1))
      .filter((i) => i >= 0);
    exportData(format, header, rows, "contracts-selected", { visibleIndices });
  };

  const sortOptions: SortOption[] = [
    { value: "projectTitle:asc", label: "Project A–Z" },
    { value: "projectTitle:desc", label: "Project Z–A" },
    { value: "clientName:asc", label: "Client A–Z" },
    { value: "clientName:desc", label: "Client Z–A" },
    { value: "value:asc", label: "Value Low–High" },
    { value: "value:desc", label: "Value High–Low" },
    { value: "status:asc", label: "Status A–Z" },
    { value: "status:desc", label: "Status Z–A" },
  ];

  return (
    <PageTransition>
      <div className={styles.pageContainer}>
        <ScrollReveal>
          <header className={styles.header}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <h1 className={styles.title}>Your Contracts</h1>
                <p className={styles.subtitle}>
                  View and manage all your active and completed contracts with
                  clients.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewContractModal(true)}
                aria-label="Create new contract"
              >
                + New Contract
              </Button>
            </div>
          </header>
        </ScrollReveal>

        {fetchLoading ? (
          <main className={commonStyles.loadingState}>
            <Loader2 className={commonStyles.spinner} size={32} />
            <span>Loading contracts...</span>
          </main>
        ) : fetchError ? (
          <main className={commonStyles.errorState}>
            <p>{fetchError}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </main>
        ) : (
          <main>
            <ScrollReveal delay={0.1}>
              <DataToolbar
                query={query}
                onQueryChange={(v: string) => {
                  setQuery(v);
                  setPage(1);
                }}
                sortValue={`${sortKey}:${sortDir}`}
                onSortChange={(val: string) => {
                  const [k, d] = val.split(":") as [
                    typeof sortKey,
                    typeof sortDir,
                  ];
                  setSortKey(k);
                  setSortDir(d);
                  setPage(1);
                }}
                pageSize={pageSize}
                onPageSizeChange={(sz: number) => {
                  setPageSize(sz);
                  setPage(1);
                }}
                sortOptions={sortOptions}
                onExport={onExport}
                exportLabel="Export"
                aria-label="Contracts filters and actions"
                searchPlaceholder="Search contracts"
                searchTitle="Search contracts"
                sortTitle="Sort contracts by"
                pageSizeTitle="Contracts per page"
                exportFormatTitle="Export contracts as"
              />
              <span className={styles.srOnly} aria-live="polite">
                Filters updated. {query ? `Query: ${query}. ` : ""}Sort:{" "}
                {sortKey} {sortDir}. Page size: {pageSize}.
              </span>

              <div
                className={styles.extrasRow}
                role="group"
                aria-label="Table view options"
              >
                <div
                  className={styles.statusFilters}
                  role="group"
                  aria-label="Filter by status"
                >
                  {["Active", "Completed", "Disputed"].map((s) => {
                    const active = statusFilters.includes(s);
                    return (
                      <Button
                        key={s}
                        size="sm"
                        variant={active ? "primary" : "outline"}
                        aria-pressed={active}
                        title={`${active ? "Remove" : "Add"} filter: ${s}`}
                        onClick={() =>
                          setStatusFilters((prev) =>
                            prev.includes(s)
                              ? prev.filter((x) => x !== s)
                              : [...prev, s],
                          )
                        }
                      >
                        {s}
                      </Button>
                    );
                  })}
                  {statusFilters.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setStatusFilters([])}
                      aria-label="Clear status filters"
                      title="Clear status filters"
                    >
                      Clear
                    </Button>
                  )}
                  <span className={styles.srOnly} aria-live="polite">
                    {statusFilters.length === 0
                      ? "No status filters active"
                      : `Active filters: ${statusFilters.join(", ")}`}
                  </span>
                </div>
                <ColumnVisibilityMenu
                  columns={[
                    { key: "projectTitle", label: "Project" },
                    { key: "clientName", label: "Client" },
                    { key: "value", label: "Value" },
                    { key: "status", label: "Status" },
                    { key: "contract", label: "Contract" },
                    { key: "actions", label: "Actions" },
                  ]}
                  visibleKeys={visible}
                  onToggle={toggleCol}
                  onShowAll={() =>
                    setAllCols(allColumns as unknown as string[])
                  }
                  onHideAll={() => setAllCols([])}
                  aria-label="Contracts columns"
                />
                <DensityToggle value={density} onChange={setDensity} />
                <SavedViewsMenu
                  storageKey="freelancer:contracts:savedViews"
                  buildPayload={() => ({
                    query,
                    sortKey,
                    sortDir,
                    pageSize,
                    density,
                    visible,
                    statusFilters,
                  })}
                  onApply={(p: {
                    query: string;
                    sortKey: typeof sortKey;
                    sortDir: typeof sortDir;
                    pageSize: number;
                    density: typeof density;
                    visible: string[];
                    statusFilters?: string[];
                  }) => {
                    setQuery(p.query ?? "");
                    setSortKey(p.sortKey ?? "projectTitle");
                    setSortDir(p.sortDir ?? "asc");
                    setPageSize(p.pageSize ?? 10);
                    setDensity(p.density ?? "comfortable");
                    setAllCols(
                      (p.visible ?? allColumns) as unknown as string[],
                    );
                    setStatusFilters(p.statusFilters ?? []);
                    setPage(1);
                  }}
                  aria-label="Contracts saved views"
                />
              </div>

              <SelectionBar
                count={count}
                onClear={clear}
                onExport={onExportSelectedFormat}
                onExportCSV={onExportSelected}
              />
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className={styles.tableContainer} ref={tableContainerRef}>
                <table className={styles.table} data-density={density}>
                  <thead>
                    <tr>
                      <th scope="col" className={styles.checkboxCell}>
                        <input
                          type="checkbox"
                          aria-label="Select page rows"
                          checked={headerCheckboxChecked}
                          ref={(el) => {
                            if (el)
                              el.indeterminate = headerCheckboxIndeterminate;
                          }}
                          {...(headerCheckboxIndeterminate
                            ? { "aria-checked": "mixed" }
                            : {})}
                          onChange={togglePageSelection}
                        />
                      </th>
                      {show("projectTitle") && (
                        <th
                          scope="col"
                          {...(sortKey === "projectTitle"
                            ? {
                                "aria-sort":
                                  sortDir === "asc"
                                    ? "ascending"
                                    : "descending",
                              }
                            : {})}
                        >
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={() => {
                              setSortKey("projectTitle");
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                              setPage(1);
                            }}
                            aria-label="Sort by project"
                          >
                            Project{" "}
                            {sortKey === "projectTitle" && (
                              <span
                                aria-hidden="true"
                                className={styles.sortIndicator}
                              >
                                {sortDir === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {show("clientName") && (
                        <th
                          scope="col"
                          {...(sortKey === "clientName"
                            ? {
                                "aria-sort":
                                  sortDir === "asc"
                                    ? "ascending"
                                    : "descending",
                              }
                            : {})}
                        >
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={() => {
                              setSortKey("clientName");
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                              setPage(1);
                            }}
                            aria-label="Sort by client"
                          >
                            Client{" "}
                            {sortKey === "clientName" && (
                              <span
                                aria-hidden="true"
                                className={styles.sortIndicator}
                              >
                                {sortDir === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {show("value") && (
                        <th
                          scope="col"
                          {...(sortKey === "value"
                            ? {
                                "aria-sort":
                                  sortDir === "asc"
                                    ? "ascending"
                                    : "descending",
                              }
                            : {})}
                        >
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={() => {
                              setSortKey("value");
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                              setPage(1);
                            }}
                            aria-label="Sort by value"
                          >
                            Value{" "}
                            {sortKey === "value" && (
                              <span
                                aria-hidden="true"
                                className={styles.sortIndicator}
                              >
                                {sortDir === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {show("status") && (
                        <th
                          scope="col"
                          {...(sortKey === "status"
                            ? {
                                "aria-sort":
                                  sortDir === "asc"
                                    ? "ascending"
                                    : "descending",
                              }
                            : {})}
                        >
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={() => {
                              setSortKey("status");
                              setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                              setPage(1);
                            }}
                            aria-label="Sort by status"
                          >
                            Status{" "}
                            {sortKey === "status" && (
                              <span
                                aria-hidden="true"
                                className={styles.sortIndicator}
                              >
                                {sortDir === "asc" ? "▲" : "▼"}
                              </span>
                            )}
                          </button>
                        </th>
                      )}
                      {show("contract") && <th scope="col">Contract</th>}
                      {show("actions") && <th scope="col">Actions</th>}
                    </tr>
                  </thead>
                  {fetchLoading ? (
                    <tbody>
                      <tr>
                        <td colSpan={1 + allColumns.length}>
                          <TableSkeleton
                            rows={6}
                            cols={6}
                            dense={density === "compact"}
                          />
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <VirtualTableBody
                      items={paged}
                      rowHeight={rowHeight}
                      overscan={6}
                      containerRef={tableContainerRef}
                      renderRow={(contract: any) => (
                        <tr
                          key={contract.id}
                          tabIndex={0}
                          {...(isSelected(contract.id)
                            ? { "aria-selected": "true" }
                            : {})}
                          onKeyDown={(e) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              toggleRow(contract.id);
                            }
                          }}
                        >
                          <td className={styles.checkboxCell}>
                            <input
                              type="checkbox"
                              aria-label={`Select ${contract.projectTitle}`}
                              checked={isSelected(contract.id)}
                              onChange={() => toggleRow(contract.id)}
                            />
                          </td>
                          {show("projectTitle") && (
                            <td>
                              <span className={styles.projectTitle}>
                                {contract.projectTitle}
                              </span>
                            </td>
                          )}
                          {show("clientName") && <td>{contract.clientName}</td>}
                          {show("value") && (
                            <td>
                              <span className={styles.value}>
                                ${contract.value}
                              </span>
                            </td>
                          )}
                          {show("status") && (
                            <td>
                              <Badge
                                variant={getStatusBadgeVariant(contract.status)}
                              >
                                {contract.status}
                              </Badge>
                            </td>
                          )}
                          {show("contract") && (
                            <td>
                              <a
                                href={`/freelancer/contracts/${contract.id}`}
                                className={styles.link}
                              >
                                View Details
                              </a>
                            </td>
                          )}
                          {show("actions") && (
                            <td>
                              <div
                                className={styles.rowActions}
                                role="group"
                                aria-label={`Actions for ${contract.projectTitle}`}
                              >
                                <Link
                                  href={`/freelancer/contracts/${contract.id}`}
                                >
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    aria-label={`View ${contract.projectTitle}`}
                                    title={`View ${contract.projectTitle}`}
                                  >
                                    View
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => downloadContract(contract)}
                                  aria-label={`Download ${contract.projectTitle}`}
                                  title={`Download ${contract.projectTitle}`}
                                >
                                  Download
                                </Button>
                                {contract.status === "Active" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="primary"
                                      onClick={() => openExtend(contract.id)}
                                      aria-label={`Extend ${contract.projectTitle}`}
                                      title={`Extend ${contract.projectTitle}`}
                                    >
                                      Extend
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={() => openDispute(contract.id)}
                                      aria-label={`Dispute ${contract.projectTitle}`}
                                      title={`Dispute ${contract.projectTitle}`}
                                    >
                                      Dispute
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      )}
                    />
                  )}
                </table>
                {sorted.length === 0 && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={styles.emptyState}
                  >
                    {contracts.length === 0
                      ? "No contracts yet. Contracts are created when a client accepts your proposal."
                      : "No contracts match your current filters. Try adjusting your search or status filter."}
                  </div>
                )}
              </div>
            </ScrollReveal>

            <Modal
              isOpen={actionOpen}
              onClose={onCancelAction}
              title={
                actionType === "extend"
                  ? "Request Extension"
                  : actionType === "dispute"
                    ? "Open Dispute"
                    : "Confirm"
              }
            >
              <div className={styles.modalBodyCopy}>
                {actionType === "extend" && (
                  <p>
                    Confirm you want to request an extension for this contract.
                    The client will be notified to approve the new timeline.
                  </p>
                )}
                {actionType === "dispute" && (
                  <p>
                    Confirm you want to open a dispute. Our team will review the
                    case and contact both parties.
                  </p>
                )}
              </div>
              <div className={styles.modalActions}>
                <Button
                  variant="outline"
                  onClick={onCancelAction}
                  aria-label="Cancel action"
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === "dispute" ? "danger" : "primary"}
                  onClick={onConfirmAction}
                  isLoading={actionLoading}
                  aria-label="Confirm action"
                >
                  Confirm
                </Button>
              </div>
            </Modal>

            {sorted.length > 0 && (
              <PaginationBar
                currentPage={pageSafe}
                totalPages={totalPages}
                totalResults={sorted.length}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            )}
            {sorted.length > 0 && (
              <span className={styles.srOnly} aria-live="polite">
                Page {pageSafe} of {totalPages}. {sorted.length} result
                {sorted.length === 1 ? "" : "s"}.
              </span>
            )}
          </main>
        )}

        {/* New Contract Modal */}
        {showNewContractModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  New Contract
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 text-xl leading-none"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={newContractForm.projectTitle}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        projectTitle: e.target.value,
                      }))
                    }
                    placeholder="e.g., E-Commerce Platform Development"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={newContractForm.clientName}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        clientName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contract Value (USD)
                  </label>
                  <input
                    type="number"
                    value={newContractForm.value}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="e.g., 5000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newContractForm.startDate}
                      onChange={(e) =>
                        setNewContractForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newContractForm.endDate}
                      onChange={(e) =>
                        setNewContractForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description / Terms
                  </label>
                  <textarea
                    value={newContractForm.description}
                    onChange={(e) =>
                      setNewContractForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Contract description, scope, and terms..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewContractModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateContract}
                  isLoading={newContractLoading}
                  disabled={
                    !newContractForm.projectTitle.trim() ||
                    !newContractForm.clientName.trim()
                  }
                >
                  Create Contract
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Contracts;
