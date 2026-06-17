'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/core';
import {
  FileText, Download, Eye, Plus, Search,
  FileSignature, Shield, ScrollText, Award, X, Upload,
  AlertCircle, CheckCircle, Loader2,
} from 'lucide-react';
import { SignaturePad } from '@/app/components/SignaturePad';

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'nda' | 'agreement' | 'proposal' | 'invoice' | 'receipt' | 'tax';
  status: 'draft' | 'active' | 'signed' | 'expired' | 'archived';
  relatedProject: string;
  otherParty: string;
  createdAt: string;
  signedAt?: string;
  expiresAt?: string;
  url?: string; // document URL for preview / download
}

const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: 'Service Agreement - E-Commerce Project',
    type: 'contract',
    status: 'signed',
    relatedProject: 'E-Commerce Platform',
    otherParty: 'John Developer',
    createdAt: '2024-01-10',
    signedAt: '2024-01-12',
    url: 'https://example.com/docs/service-agreement-ecommerce.pdf',
  },
  {
    id: 'doc2',
    title: 'NDA - Mobile App Project',
    type: 'nda',
    status: 'active',
    relatedProject: 'Mobile App',
    otherParty: 'Jane Designer',
    createdAt: '2024-01-20',
    url: 'https://example.com/docs/nda-mobile-app.pdf',
  },
  {
    id: 'doc3',
    title: 'Proposal - AI Chatbot Integration',
    type: 'proposal',
    status: 'active',
    relatedProject: 'AI Chatbot',
    otherParty: 'AI Specialist',
    createdAt: '2024-02-01',
    url: 'https://example.com/docs/proposal-ai-chatbot.pdf',
  },
  {
    id: 'doc4',
    title: 'Invoice INV-2024-001',
    type: 'invoice',
    status: 'active',
    relatedProject: 'E-Commerce Platform',
    otherParty: 'John Developer',
    createdAt: '2024-02-01',
    url: 'https://example.com/docs/invoice-2024-001.pdf',
  },
  {
    id: 'doc5',
    title: 'W-9 Tax Form',
    type: 'tax',
    status: 'signed',
    relatedProject: 'N/A',
    otherParty: 'IRS',
    createdAt: '2024-01-01',
    signedAt: '2024-01-01',
    url: 'https://example.com/docs/w9-tax-form.pdf',
  },
];

const typeConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  contract: { label: 'Contract', icon: FileSignature, color: 'text-blue-600' },
  nda: { label: 'NDA', icon: Shield, color: 'text-purple-600' },
  agreement: { label: 'Agreement', icon: ScrollText, color: 'text-green-600' },
  proposal: { label: 'Proposal', icon: FileText, color: 'text-orange-600' },
  invoice: { label: 'Invoice', icon: FileText, color: 'text-yellow-600' },
  receipt: { label: 'Receipt', icon: FileText, color: 'text-emerald-600' },
  tax: { label: 'Tax Form', icon: Award, color: 'text-red-600' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500' },
};

interface NewDocForm {
  name: string;
  type: Document['type'];
  category: string;
  notes: string;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  // ── New Document modal state ─────────────────────────────────────────────────
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [docForm, setDocForm] = useState<NewDocForm>({
    name: '',
    type: 'contract',
    category: '',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);

  // ── Preview modal state ──────────────────────────────────────────────────────
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const resetNewDocForm = () => {
    setDocForm({ name: '', type: 'contract', category: '', notes: '' });
    setSelectedFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx') || file.type === 'text/plain')) {
      setSelectedFile(file);
    }
  };

  const handleNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name.trim()) {
      setSubmitError('Document name is required.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let fileUrl: string | undefined;

      // Upload file if provided
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('document_type', docForm.type);
        const uploadRes = await apiFetch('/uploads/document', {
          method: 'POST',
          body: formData,
        }) as { url?: string; file_url?: string };
        fileUrl = uploadRes.url ?? uploadRes.file_url;
      }

      // Create document record
      await apiFetch('/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docForm.name,
          type: docForm.type,
          category: docForm.category,
          notes: docForm.notes,
          file_url: fileUrl,
          status: 'draft',
        }),
      });

      // Optimistic insert
      const created: Document = {
        id: `doc${Date.now()}`,
        title: docForm.name,
        type: docForm.type,
        status: 'draft',
        relatedProject: docForm.category || 'N/A',
        otherParty: '',
        createdAt: new Date().toISOString().split('T')[0],
        url: fileUrl,
      };
      setDocuments(prev => [created, ...prev]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowNewDocModal(false);
        resetNewDocForm();
      }, 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setPreviewDoc(doc);
  };

  const handleDownloadDocument = (doc: Document) => {
    if (!doc.url) return;
    window.open(doc.url, '_blank', 'noopener,noreferrer');
  };

  const filters = ['all', 'contract', 'nda', 'agreement', 'proposal', 'invoice', 'tax'];
  const inputCls = 'w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const filteredDocs = documents
    .filter(d => activeFilter === 'all' || d.type === activeFilter)
    .filter(d => !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage contracts, agreements, NDAs, and other documents</p>
        </div>
        <button
          onClick={() => setShowNewDocModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          <Plus size={14} />
          New Document
        </button>
      </div>

      {/* ── Search + Filters ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === filter
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {filter === 'all' ? 'All Documents' : typeConfig[filter]?.label || filter}
            </button>
          ))}
        </div>
      </div>

      {/* ── Documents Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const type = typeConfig[doc.type];
          const status = statusConfig[doc.status];
          const Icon = type.icon;
          return (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${type.color}`}>
                  <Icon size={20} />
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{doc.title}</h3>
              <p className="text-xs text-gray-500 mb-3">
                {doc.otherParty ? `${doc.otherParty} • ` : ''}{doc.relatedProject}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Created: {doc.createdAt}</span>
                {doc.signedAt && <span className="text-green-600">Signed: {doc.signedAt}</span>}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                {/* View button – opens preview modal or new tab */}
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                  title="View document"
                >
                  <Eye size={12} /> View
                </button>

                {/* PDF / Download button */}
                <button
                  onClick={() => handleDownloadDocument(doc)}
                  disabled={!doc.url}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title={doc.url ? 'Download PDF' : 'No file available'}
                >
                  <Download size={12} /> PDF
                </button>

                {/* Sign button – only for active contracts */}
                {doc.status === 'active' && doc.type === 'contract' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSignModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileSignature size={12} /> Sign
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 py-16 text-gray-400">
            <FileText size={40} className="opacity-30" />
            <p className="text-sm">No documents found.</p>
          </div>
        )}
      </div>

      {/* ── Document Preview Modal ─────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = typeConfig[previewDoc.type]?.icon ?? FileText;
                  return (
                    <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${typeConfig[previewDoc.type]?.color}`}>
                      <Icon size={18} />
                    </div>
                  );
                })()}
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">{previewDoc.title}</h2>
                  <p className="text-xs text-gray-500">{previewDoc.otherParty} • {previewDoc.relatedProject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {previewDoc.url && (
                  <>
                    <button
                      onClick={() => window.open(previewDoc.url, '_blank')}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Eye size={12} /> Open in tab
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(previewDoc)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={12} /> Download
                    </button>
                  </>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-5">
              {previewDoc.url ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.title}
                  className="w-full h-full min-h-[400px] rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
                  <FileText size={48} className="opacity-30" />
                  <p className="text-sm">No file preview available for this document.</p>
                  <p className="text-xs">
                    Created {previewDoc.createdAt}
                    {previewDoc.signedAt && ` • Signed ${previewDoc.signedAt}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── New Document Modal ─────────────────────────────────────────────── */}
      {showNewDocModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Document</h2>
                <p className="text-sm text-gray-500 mt-0.5">Upload or create a new document record</p>
              </div>
              <button
                onClick={() => { setShowNewDocModal(false); resetNewDocForm(); }}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleNewDocument} className="p-6 space-y-4">
              {/* Document Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Document Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docForm.name}
                  onChange={e => setDocForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Service Agreement - Project X"
                  className={inputCls}
                />
              </div>

              {/* Type + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Document Type
                  </label>
                  <select
                    value={docForm.type}
                    onChange={e => setDocForm(f => ({ ...f, type: e.target.value as Document['type'] }))}
                    className={inputCls}
                  >
                    <option value="contract">Contract</option>
                    <option value="nda">NDA</option>
                    <option value="agreement">Agreement</option>
                    <option value="invoice">Invoice</option>
                    <option value="proposal">Proposal</option>
                    <option value="receipt">Receipt</option>
                    <option value="tax">Tax Form</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    Category / Project
                  </label>
                  <input
                    type="text"
                    value={docForm.category}
                    onChange={e => setDocForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="e.g. E-Commerce Platform"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Upload File
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setFileDragOver(true); }}
                  onDragLeave={() => setFileDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors ${
                    fileDragOver
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      : selectedFile
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                  onClick={() => window.document.getElementById('doc-file-upload')?.click()}
                >
                  <input
                    id="doc-file-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <>
                      <CheckCircle size={24} className="text-green-500" />
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB •{' '}
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); setSelectedFile(null); }}
                          className="text-red-500 hover:text-red-700 underline"
                        >
                          Remove
                        </button>
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <p className="text-sm text-gray-500 text-center">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag & drop
                      </p>
                      <p className="text-xs text-gray-400">PDF, DOCX, or TXT (max 10 MB)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={docForm.notes}
                  onChange={e => setDocForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Additional notes about this document..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Error / Success */}
              {submitError && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-400">
                  <CheckCircle size={16} className="shrink-0" />
                  Document created successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowNewDocModal(false); resetNewDocForm(); }}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <FileText size={14} />
                      Create Document
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
