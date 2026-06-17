"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api/core";
import { downloadInvoicePdf } from "@/lib/api/pdf";
import {
  FileText,
  Download,
  Eye,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Trash2,
  X,
} from "lucide-react";

type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

interface Invoice {
  id: string;
  invoiceNumber: string;
  freelancerName: string;
  freelancerEmail: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: { description: string; quantity: number; rate: number }[];
  notes?: string;
}

// Backend (GET /invoices) returns snake_case rows wrapped in { items, total, page }.
// Map a raw row to the shape this page renders, with safe fallbacks so a missing
// field can never crash the page.
interface RawInvoice {
  id: number | string;
  invoice_number?: string;
  freelancer_id?: number;
  freelancer_name?: string;
  freelancer_email?: string;
  client_id?: number;
  client_name?: string;
  client_email?: string;
  project_title?: string;
  amount?: number;
  currency?: string;
  status?: string;
  description?: string;
  due_date?: string;
  notes?: string;
  created_at?: string;
}

const STATUS_MAP: Record<string, InvoiceStatus> = {
  draft: "pending",
  sent: "pending",
  updated: "pending",
  pending: "pending",
  paid: "paid",
  overdue: "overdue",
  cancelled: "cancelled",
};

function normalizeInvoice(raw: RawInvoice): Invoice {
  const amount = Number(raw.amount) || 0;
  const description = raw.description || "";
  return {
    id: String(raw.id),
    invoiceNumber: raw.invoice_number || `INV-${raw.id}`,
    freelancerName: raw.freelancer_name || `Freelancer #${raw.freelancer_id ?? "?"}`,
    freelancerEmail: raw.freelancer_email || "",
    clientName: raw.client_name || "",
    clientEmail: raw.client_email || "",
    projectTitle: raw.project_title || description || "—",
    amount,
    taxRate: 0,
    taxAmount: 0,
    total: amount,
    currency: raw.currency || "USD",
    status: STATUS_MAP[(raw.status || "").toLowerCase()] || "pending",
    issueDate: (raw.created_at || "").split("T")[0] || "—",
    dueDate: raw.due_date || "—",
    items: description ? [{ description, quantity: 1, rate: amount }] : [],
    notes: raw.notes,
  };
}

interface NewInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  paid: {
    label: "Paid",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  overdue: {
    label: "Overdue",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  },
};

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  // ── Fetch invoices on mount ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ items?: RawInvoice[] } | RawInvoice[]>(
          "/invoices",
        );
        const rows = Array.isArray(data) ? data : (data?.items ?? []);
        setInvoices(rows.map(normalizeInvoice));
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load invoices.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Pay invoice ──────────────────────────────────────────────────────────────
  const [payError, setPayError] = useState<string | null>(null);
  const handlePayInvoice = async (invoiceId: string) => {
    setPayingId(invoiceId);
    setPayError(null);
    try {
      await apiFetch(`/invoices/${invoiceId}/pay`, { method: "POST" });
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === invoiceId
            ? {
                ...i,
                status: "paid" as const,
                paidDate: new Date().toISOString().split("T")[0],
              }
            : i,
        ),
      );
    } catch (err) {
      setPayError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setPayingId(null);
    }
  };

  // ── Download invoice PDF ─────────────────────────────────────────────────────
  const [pdfError, setPdfError] = useState<string | null>(null);
  const handleDownloadPdf = async (invoice: Invoice) => {
    setPdfError(null);
    try {
      await downloadInvoicePdf({
        invoice_id: invoice.id,
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.clientName || "Client",
        client_email: invoice.clientEmail,
        freelancer_name: invoice.freelancerName,
        freelancer_email: invoice.freelancerEmail,
        items: invoice.items.length
          ? invoice.items
          : [{ description: invoice.projectTitle, quantity: 1, rate: invoice.amount }],
        subtotal: invoice.amount,
        tax_rate: invoice.taxRate,
        tax_amount: invoice.taxAmount,
        total: invoice.total,
        currency: invoice.currency,
        due_date: invoice.dueDate,
        status: invoice.status,
        notes: invoice.notes || "",
      });
    } catch (err) {
      setPdfError(
        err instanceof Error ? err.message : "PDF download failed. Please try again.",
      );
    }
  };

  // ── Create Invoice modal ─────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState({
    freelancerName: "",
    freelancerEmail: "",
    projectTitle: "",
    dueDate: "",
    notes: "",
    taxRate: 0,
  });
  const [items, setItems] = useState<NewInvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount;

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);

  const removeItem = (index: number) => {
    if (items.length > 1)
      setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof NewInvoiceItem,
    value: string | number,
  ) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );

  const resetForm = () => {
    setForm({
      freelancerName: "",
      freelancerEmail: "",
      projectTitle: "",
      dueDate: "",
      notes: "",
      taxRate: 0,
    });
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setSubmitError(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch("/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancer_name: form.freelancerName,
          freelancer_email: form.freelancerEmail,
          project_title: form.projectTitle,
          due_date: form.dueDate,
          notes: form.notes,
          tax_rate: form.taxRate,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.unitPrice,
          })),
          amount: subtotal,
          tax_amount: taxAmount,
          total,
          role: "client",
          status: "pending",
        }),
      });

      // Optimistic insert
      const created: Invoice = {
        id: `inv${Date.now()}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
        freelancerName: form.freelancerName,
        freelancerEmail: form.freelancerEmail,
        clientName: "",
        clientEmail: "",
        projectTitle: form.projectTitle,
        amount: subtotal,
        taxRate: form.taxRate,
        taxAmount,
        total,
        currency: "USD",
        status: "pending",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: form.dueDate,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.unitPrice,
        })),
        notes: form.notes,
      };
      setInvoices((prev) => [created, ...prev]);
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to create invoice. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived totals ───────────────────────────────────────────────────────────
  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total, 0);

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and pay invoices from freelancers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={14} />
          Create Invoice
        </button>
      </div>

      {/* ── Summary ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            ${totalPending.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            ${totalPaid.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {invoices.length}
          </div>
        </div>
      </div>

      {(pdfError || payError) && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {pdfError || payError}
        </div>
      )}

      {/* ── Invoices Table ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mr-2" />
            Loading invoices…
          </div>
        )}
        {fetchError && !loading && (
          <div className="p-6 text-sm text-red-600 dark:text-red-400 text-center">
            {fetchError}
          </div>
        )}
        {!loading && !fetchError && invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <FileText size={26} className="text-blue-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              No invoices yet
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Invoices from your freelancers will appear here. Create one to get
              started.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus size={14} /> Create Invoice
            </button>
          </div>
        )}
        {!loading && !fetchError && invoices.length > 0 && (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Freelancer
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Project
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
              </th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                  {invoice.freelancerName}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {invoice.projectTitle}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${invoice.total.toLocaleString()}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig[invoice.status].color}`}
                  >
                    {statusConfig[invoice.status].label}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {invoice.dueDate}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(invoice)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      title="Download PDF"
                    >
                      <Download size={14} />
                    </button>
                    {invoice.status === "pending" && (
                      <button
                        onClick={() => handlePayInvoice(invoice.id)}
                        disabled={payingId === invoice.id}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {payingId === invoice.id ? "Paying…" : "Pay Now"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* ── Invoice Detail Modal ───────────────────────────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedInvoice.invoiceNumber}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedInvoice.freelancerName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                >
                  <Download size={14} /> PDF
                </button>
                {selectedInvoice.status === "pending" && (
                  <button
                    onClick={() => handlePayInvoice(selectedInvoice.id)}
                    disabled={payingId === selectedInvoice.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <DollarSign size={14} />{" "}
                    {payingId === selectedInvoice.id ? "Paying…" : "Pay Now"}
                  </button>
                )}
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[selectedInvoice.status].color}`}
                >
                  {statusConfig[selectedInvoice.status].label}
                </span>
                <div className="text-sm text-gray-500">
                  Due: {selectedInvoice.dueDate}
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Rate
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {item.description}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          ${item.rate.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          ${(item.quantity * item.rate).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedInvoice.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Tax ({selectedInvoice.taxRate}%)
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedInvoice.taxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600">
                      ${selectedInvoice.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Invoice Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create Invoice
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Issue an invoice to a freelancer for a project
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-5">
              {/* Freelancer + project */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Freelancer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.freelancerName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, freelancerName: e.target.value }))
                    }
                    placeholder="e.g. John Developer"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Freelancer Email
                  </label>
                  <input
                    type="email"
                    value={form.freelancerEmail}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        freelancerEmail: e.target.value,
                      }))
                    }
                    placeholder="dev@example.com"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.projectTitle}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, projectTitle: e.target.value }))
                    }
                    placeholder="e.g. E-Commerce Platform"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, dueDate: e.target.value }))
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Invoice Items
                  </h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    <Plus size={12} /> Add Row
                  </button>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[3fr_80px_100px_90px_32px] bg-gray-50 dark:bg-gray-700/50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide gap-2">
                    <span>Description</span>
                    <span className="text-center">Qty</span>
                    <span className="text-center">Unit Price</span>
                    <span className="text-right">Amount</span>
                    <span />
                  </div>
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[3fr_80px_100px_90px_32px] px-3 py-2 border-t border-gray-100 dark:border-gray-700 items-center gap-2"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(index, "description", e.target.value)
                        }
                        placeholder="Service description"
                        className="px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      />
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="px-2 py-1.5 text-sm text-center border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="px-2 py-1.5 text-sm text-center border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                        $
                        {(item.quantity * item.unitPrice).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="flex items-center justify-center w-7 h-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax & totals */}
              <div className="flex items-start justify-between gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={form.taxRate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        taxRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-28 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-right space-y-1.5 min-w-[200px]">
                  <div className="flex justify-between gap-8 text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8 text-sm">
                    <span className="text-gray-500">Tax ({form.taxRate}%)</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-8 font-bold border-t border-gray-200 dark:border-gray-700 pt-1.5 text-base">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Additional notes or payment instructions..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <FileText size={14} />
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
