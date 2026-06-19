"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Download,
  Send,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/app/components/SignaturePad";
import { apiFetch, APIError } from "@/lib/api/core";
import { downloadContractPdf } from "@/lib/api/pdf";

interface ContractMilestone {
  id: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface Contract {
  id: string;
  title: string;
  freelancerName: string;
  freelancerTitle: string;
  status:
    | "pending_signature"
    | "active"
    | "paused"
    | "completed"
    | "cancelled"
    | "disputed";
  totalAmount: number;
  currency: string;
  paymentType: string;
  startDate: string;
  endDate: string;
  milestones: ContractMilestone[];
  signedByClient: boolean;
  signedByFreelancer: boolean;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_signature: {
    label: "Pending Signature",
    color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  },
  active: { label: "Active", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  paused: { label: "Paused", color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" },
  completed: { label: "Completed", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
  cancelled: { label: "Cancelled", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
  disputed: { label: "Disputed", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
};

type TabKey = "all" | "active" | "pending_signature" | "completed" | "disputed";

export default function ClientContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadPdf = async (contract: Contract) => {
    setDownloadingId(contract.id);
    try {
      await downloadContractPdf({
        contract_id: String(contract.id),
        title: contract.title,
        client_name: "Client",
        freelancer_name: contract.freelancerName,
        scope: contract.title,
        total_amount: contract.totalAmount,
        currency: contract.currency,
        start_date: contract.startDate,
        end_date: contract.endDate,
        payment_type: contract.paymentType,
        milestones: contract.milestones.map((m) => ({
          title: m.title,
          amount: m.amount,
          dueDate: m.dueDate,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download contract PDF.");
    } finally {
      setDownloadingId(null);
    }
  };
  const [expandedContract, setExpandedContract] = useState<string | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signingContractId, setSigningContractId] = useState<string | null>(null);
  const [signingLoading, setSigningLoading] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [newContractLoading, setNewContractLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [tabCounts, setTabCounts] = useState<Record<TabKey, number>>({
    all: 0,
    active: 0,
    pending_signature: 0,
    completed: 0,
    disputed: 0,
  });
  const [newContractForm, setNewContractForm] = useState({
    title: "",
    freelancerName: "",
    freelancerId: 0,
    totalAmount: "",
    startDate: "",
    endDate: "",
    paymentType: "fixed",
    description: "",
  });
  const [freelancerSearchResults, setFreelancerSearchResults] = useState<{ id: number; name: string; email: string }[]>([]);
  const [freelancerSearchLoading, setFreelancerSearchLoading] = useState(false);
  const [showFreelancerDropdown, setShowFreelancerDropdown] = useState(false);

  const fetchContracts = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const query = status && status !== "all" ? `?status_filter=${status}` : "";
      const data = (await apiFetch(`/contracts${query}`)) as {
        items: Record<string, unknown>[];
        total: number;
      };
      const mapped: Contract[] = (data.items || []).map((c) => ({
        id: String(c.id),
        title: String(c.title || ""),
        freelancerName: String(c.freelancer_name || c.freelancerName || ""),
        freelancerTitle: String(c.freelancer_title || c.freelancerTitle || ""),
        status: (c.status as Contract["status"]) || "active",
        totalAmount: (c.amount || c.total_value || c.totalAmount || 0) as number,
        currency: (c.currency || "USD") as string,
        paymentType: (c.contract_type || c.paymentType || "fixed") as string,
        startDate: String(c.start_date || c.startDate || ""),
        endDate: String(c.end_date || c.endDate || ""),
        milestones: Array.isArray(c.milestones) ? (c.milestones as ContractMilestone[]) : [],
        signedByClient: Boolean(c.signed_by_client ?? c.signedByClient),
        signedByFreelancer: Boolean(c.signed_by_freelancer ?? c.signedByFreelancer),
      }));
      setContracts(mapped);
    } catch (err) {
      if (err instanceof APIError && err.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load contracts. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTabCounts = useCallback(async () => {
    try {
      const all = (await apiFetch("/contracts")) as { items: unknown[] };
      const allItems = all.items || [];
      const counts: Record<TabKey, number> = {
        all: allItems.length,
        active: 0,
        pending_signature: 0,
        completed: 0,
        disputed: 0,
      };
      for (const item of allItems) {
        const s = (item as Record<string, unknown>).status as string;
        if (s in counts) {
          counts[s as TabKey]++;
        }
      }
      setTabCounts(counts);
    } catch {
      // Non-critical — keep previous counts
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchTabCounts();
  }, [fetchContracts, fetchTabCounts]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    fetchContracts(tab);
  };

  const handleCreateContract = async () => {
    if (!newContractForm.title.trim()) return;
    if (!newContractForm.freelancerId) {
      setError("Please select a freelancer for this contract.");
      return;
    }
    if (!newContractForm.totalAmount || parseFloat(newContractForm.totalAmount) <= 0) {
      setError("Please enter a valid contract amount.");
      return;
    }
    setNewContractLoading(true);
    try {
      await apiFetch("/contracts/direct", {
        method: "POST",
        body: JSON.stringify({
          freelancer_id: newContractForm.freelancerId,
          title: newContractForm.title,
          description: newContractForm.description || newContractForm.title,
          rate_type: newContractForm.paymentType === "milestone" ? "fixed" : newContractForm.paymentType,
          rate: parseFloat(newContractForm.totalAmount) || 0,
          start_date: newContractForm.startDate || undefined,
        }),
      });
      setShowNewContractModal(false);
      setNewContractForm({
        title: "",
        freelancerName: "",
        freelancerId: 0,
        totalAmount: "",
        startDate: "",
        endDate: "",
        paymentType: "fixed",
        description: "",
      });
      setFreelancerSearchResults([]);
      fetchContracts(activeTab);
      fetchTabCounts();
    } catch (err) {
      setError(
        err instanceof APIError
          ? err.message
          : "Failed to create contract. Please try again."
      );
    } finally {
      setNewContractLoading(false);
    }
  };

  const searchFreelancers = async (query: string) => {
    if (!query || query.length < 2) {
      setFreelancerSearchResults([]);
      setShowFreelancerDropdown(false);
      return;
    }
    setFreelancerSearchLoading(true);
    try {
      const data = (await apiFetch(`/users/freelancers?search=${encodeURIComponent(query)}&page_size=10`)) as {
        freelancers?: { id: number; name: string; email: string }[];
        items?: { id: number; name: string; email: string }[];
      };
      const results = data.freelancers || data.items || [];
      setFreelancerSearchResults(results);
      setShowFreelancerDropdown(results.length > 0);
    } catch {
      setFreelancerSearchResults([]);
    } finally {
      setFreelancerSearchLoading(false);
    }
  };

  const openSignModal = (contractId: string) => {
    setSigningContractId(contractId);
    setShowSignModal(true);
  };

  const handleSign = async () => {
    if (!signingContractId) return;
    setSigningLoading(true);
    try {
      await apiFetch(`/contracts/${signingContractId}/sign`, { method: "POST" });
      setShowSignModal(false);
      setSigningContractId(null);
      fetchContracts(activeTab);
      fetchTabCounts();
    } catch (err) {
      setError(
        err instanceof APIError
          ? err.message
          : "Failed to sign contract. Please try again."
      );
    } finally {
      setSigningLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contracts
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage your service agreements
          </p>
        </div>
        <button
          onClick={() => setShowNewContractModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={14} />
          New Contract
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Status Subtabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(
          [
            { key: "all" as const, label: "All Contracts" },
            { key: "active" as const, label: "Active" },
            { key: "pending_signature" as const, label: "Pending Signature" },
            { key: "completed" as const, label: "Completed" },
            { key: "disputed" as const, label: "Disputed" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {label}
            <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading contracts...</span>
          </div>
        ) : error && contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
            Could not load contracts.
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-sm">
            No contracts found. Click &quot;New Contract&quot; to create one.
          </div>
        ) : (
          contracts.map((contract) => {
            const config = statusConfig[contract.status] || statusConfig.active;
            const isExpanded = expandedContract === contract.id;
            return (
              <div
                key={contract.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                  onClick={() =>
                    setExpandedContract(isExpanded ? null : contract.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="text-gray-400">
                        {isExpanded ? (
                          <ChevronDown size={18} />
                        ) : (
                          <ChevronRight size={18} />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {contract.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {contract.freelancerName}
                          {contract.freelancerTitle && (
                            <> &bull; {contract.freelancerTitle}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          ${contract.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-4">
                    {/* Signatures */}
                    <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {contract.signedByClient ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-yellow-500" />
                        )}
                        <span className="text-sm">
                          <b>Client:</b>{" "}
                          {contract.signedByClient ? "Signed" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {contract.signedByFreelancer ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-yellow-500" />
                        )}
                        <span className="text-sm">
                          <b>Freelancer:</b>{" "}
                          {contract.signedByFreelancer ? "Signed" : "Pending"}
                        </span>
                      </div>
                      {!contract.signedByClient && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openSignModal(contract.id);
                          }}
                          className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          Sign Contract
                        </button>
                      )}
                    </div>

                    {/* Milestones */}
                    {contract.milestones.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                          Milestones
                        </h4>
                        <div className="space-y-2">
                          {contract.milestones.map((ms) => (
                            <div
                              key={ms.id}
                              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-2 h-2 rounded-full ${ms.status === "paid" ? "bg-green-500" : ms.status === "in_progress" ? "bg-yellow-500" : "bg-gray-300"}`}
                                />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {ms.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  ${ms.amount.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {ms.dueDate}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPdf(contract);
                        }}
                        disabled={downloadingId === contract.id}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60"
                      >
                        <Download size={14} />{" "}
                        {downloadingId === contract.id ? "Preparing…" : "Download PDF"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/client/contracts/${contract.id}`);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 text-xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contract Title *
                </label>
                <input
                  type="text"
                  value={newContractForm.title}
                  onChange={(e) =>
                    setNewContractForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Website Redesign Project"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Freelancer *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newContractForm.freelancerName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewContractForm((prev) => ({
                        ...prev,
                        freelancerName: val,
                        freelancerId: 0,
                      }));
                      searchFreelancers(val);
                    }}
                    onFocus={() => {
                      if (freelancerSearchResults.length > 0) setShowFreelancerDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowFreelancerDropdown(false), 200)}
                    placeholder="Search freelancer by name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {freelancerSearchLoading && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {showFreelancerDropdown && freelancerSearchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {freelancerSearchResults.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setNewContractForm((prev) => ({
                              ...prev,
                              freelancerName: f.name,
                              freelancerId: f.id,
                            }));
                            setShowFreelancerDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">{f.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{f.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {newContractForm.freelancerId > 0 && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Selected: {newContractForm.freelancerName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newContractForm.description}
                  onChange={(e) =>
                    setNewContractForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the scope of work..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Amount (USD)
                </label>
                <input
                  type="number"
                  value={newContractForm.totalAmount}
                  onChange={(e) =>
                    setNewContractForm((prev) => ({
                      ...prev,
                      totalAmount: e.target.value,
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
                  Payment Type
                </label>
                <select
                  value={newContractForm.paymentType}
                  onChange={(e) =>
                    setNewContractForm((prev) => ({
                      ...prev,
                      paymentType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="fixed">Fixed Price</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="milestone">Milestone-based</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowNewContractModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateContract}
                disabled={newContractLoading || !newContractForm.title.trim() || !newContractForm.freelancerId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {newContractLoading && (
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Create Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Sign Contract
            </h2>
            <p className="text-sm text-gray-500">
              Draw your signature below to sign this contract.
            </p>
            <SignaturePad
              onSignature={(_dataUrl) => {
                handleSign();
              }}
            />
            <button
              onClick={() => {
                setShowSignModal(false);
                setSigningContractId(null);
              }}
              disabled={signingLoading}
              className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              {signingLoading ? "Signing..." : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
