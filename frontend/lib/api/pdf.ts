// @AI-HINT: Client-side PDF download helpers. The backend PDF endpoints stream
// binary (application/pdf), so they CANNOT go through apiFetch (which always
// parses JSON). These use a raw fetch and trigger a browser download.

import { getAuthToken } from "./core";

const API_BASE_URL = "/api/v1";

async function downloadBlob(
  endpoint: string,
  body: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = `PDF generation failed (HTTP ${res.status})`;
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(detail);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export interface InvoicePdfPayload {
  invoice_id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  freelancer_name: string;
  freelancer_email: string;
  items: { description: string; quantity: number; rate: number }[];
  subtotal: number;
  tax_rate?: number;
  tax_amount?: number;
  total: number;
  currency?: string;
  due_date?: string | null;
  status?: string;
  notes?: string;
}

/** Generate and download an invoice PDF via POST /pdf/invoice. */
export async function downloadInvoicePdf(
  payload: InvoicePdfPayload,
): Promise<void> {
  await downloadBlob("/pdf/invoice", { ...payload }, `invoice-${payload.invoice_number}.pdf`);
}
