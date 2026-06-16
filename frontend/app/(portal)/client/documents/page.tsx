'use client';

import { useState } from 'react';
import {
  FileText, Download, Eye, Plus, Search, Filter,
  FileSignature, Shield, ScrollText, Award, Calendar
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
}

const mockDocuments: Document[] = [
  { id: 'doc1', title: 'Service Agreement - E-Commerce Project', type: 'contract', status: 'signed', relatedProject: 'E-Commerce Platform', otherParty: 'John Developer', createdAt: '2024-01-10', signedAt: '2024-01-12' },
  { id: 'doc2', title: 'NDA - Mobile App Project', type: 'nda', status: 'active', relatedProject: 'Mobile App', otherParty: 'Jane Designer', createdAt: '2024-01-20' },
  { id: 'doc3', title: 'Proposal - AI Chatbot Integration', type: 'proposal', status: 'active', relatedProject: 'AI Chatbot', otherParty: 'AI Specialist', createdAt: '2024-02-01' },
  { id: 'doc4', title: 'Invoice INV-2024-001', type: 'invoice', status: 'active', relatedProject: 'E-Commerce Platform', otherParty: 'John Developer', createdAt: '2024-02-01' },
  { id: 'doc5', title: 'W-9 Tax Form', type: 'tax', status: 'signed', relatedProject: 'N/A', otherParty: 'IRS', createdAt: '2024-01-01', signedAt: '2024-01-01' },
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
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
  active: { label: 'Active', color: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  archived: { label: 'Archived', color: 'bg-gray-100 text-gray-500' },
};

export default function ClientDocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showSignModal, setShowSignModal] = useState(false);

  const filters = ['all', 'contract', 'nda', 'agreement', 'proposal', 'invoice', 'tax'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Manage contracts, agreements, NDAs, and other documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={14} />
          New Document
        </button>
      </div>

      {/* Filters */}
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents
          .filter(d => activeFilter === 'all' || d.type === activeFilter)
          .map((doc) => {
            const type = typeConfig[doc.type];
            const status = statusConfig[doc.status];
            const Icon = type.icon;
            return (
              <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${type.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>{status.label}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{doc.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{doc.otherParty} • {doc.relatedProject}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Created: {doc.createdAt}</span>
                  {doc.signedAt && <span className="text-green-600">Signed: {doc.signedAt}</span>}
                </div>
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Eye size={12} /> View
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Download size={12} /> PDF
                  </button>
                  {doc.status === 'active' && doc.type === 'contract' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowSignModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FileSignature size={12} /> Sign
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign Document</h2>
            <p className="text-sm text-gray-500">Draw your signature below to sign this document.</p>
            <SignaturePad
              onSignature={(dataUrl) => {
                console.log('Document signed');
                setShowSignModal(false);
              }}
            />
            <button onClick={() => setShowSignModal(false)} className="w-full text-center text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
