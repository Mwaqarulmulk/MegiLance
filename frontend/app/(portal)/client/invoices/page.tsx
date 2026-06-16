'use client';

import { useState } from 'react';
import {
  FileText, Download, Eye, Plus, Clock, CheckCircle, AlertCircle,
  Send, Printer, DollarSign
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  freelancerName: string;
  projectTitle: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  items: { description: string; quantity: number; rate: number }[];
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    invoiceNumber: 'INV-2024-001',
    freelancerName: 'John Developer',
    projectTitle: 'E-Commerce Platform Development',
    amount: 5000,
    taxRate: 10,
    taxAmount: 500,
    total: 5500,
    status: 'pending',
    issueDate: '2024-02-01',
    dueDate: '2024-03-01',
    items: [
      { description: 'Frontend Development - Phase 1', quantity: 1, rate: 3000 },
      { description: 'UI/UX Review & Optimization', quantity: 10, rate: 200 },
    ],
  },
  {
    id: 'inv2',
    invoiceNumber: 'INV-2024-002',
    freelancerName: 'Jane Designer',
    projectTitle: 'Brand Identity Design',
    amount: 2500,
    taxRate: 10,
    taxAmount: 250,
    total: 2750,
    status: 'paid',
    issueDate: '2024-01-15',
    dueDate: '2024-02-15',
    paidDate: '2024-02-10',
    items: [
      { description: 'Logo Design', quantity: 1, rate: 1500 },
      { description: 'Brand Guidelines', quantity: 1, rate: 1000 },
    ],
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
};

export default function ClientInvoicesPage() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-500 text-sm mt-1">View and pay invoices from freelancers</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Pending</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">${totalPending.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Paid</div>
          <div className="text-2xl font-bold text-green-600 mt-1">${totalPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-500">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{invoices.length}</div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Freelancer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">{invoice.freelancerName}</td>
                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.projectTitle}</td>
                <td className="px-5 py-4 text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">${invoice.total.toLocaleString()}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusConfig[invoice.status].color}`}>
                    {statusConfig[invoice.status].label}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{invoice.dueDate}</td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setSelectedInvoice(invoice)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download PDF">
                      <Download size={14} />
                    </button>
                    {invoice.status === 'pending' && (
                      <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                        Pay Now
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-500">{selectedInvoice.freelancerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                  <Download size={14} /> PDF
                </button>
                {selectedInvoice.status === 'pending' && (
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                    <DollarSign size={14} /> Pay Now
                  </button>
                )}
                <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusConfig[selectedInvoice.status].color}`}>
                  {statusConfig[selectedInvoice.status].label}
                </span>
                <div className="text-sm text-gray-500">Due: {selectedInvoice.dueDate}</div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Rate</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.description}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">${item.rate.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">${(item.quantity * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${selectedInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax ({selectedInvoice.taxRate}%)</span>
                    <span className="text-gray-900 dark:text-white">${selectedInvoice.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600">${selectedInvoice.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
