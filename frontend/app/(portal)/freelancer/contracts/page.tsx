'use client';

import { useState } from 'react';
import {
  FileText, Download, Send, Eye, CheckCircle, Clock, AlertCircle,
  Plus, Search, Filter, MoreVertical, ExternalLink, DollarSign,
  Calendar, User, ChevronDown, ChevronRight, Edit3, Trash2
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  freelancerName: string;
  status: 'pending_signature' | 'active' | 'paused' | 'completed' | 'cancelled' | 'disputed';
  totalAmount: number;
  currency: string;
  paymentType: 'fixed' | 'hourly' | 'retainer' | 'milestone';
  startDate: string;
  endDate: string;
  milestones: {
    id: string;
    title: string;
    amount: number;
    status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'paid';
    dueDate: string;
  }[];
  signedByClient: boolean;
  signedByFreelancer: boolean;
  documents: { name: string; type: string; url: string }[];
}

const mockContracts: Contract[] = [
  {
    id: 'c1',
    title: 'E-Commerce Platform Development',
    clientName: 'Acme Corp',
    clientAvatar: 'A',
    freelancerName: 'John Developer',
    status: 'active',
    totalAmount: 15000,
    currency: 'USD',
    paymentType: 'milestone',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    milestones: [
      { id: 'm1', title: 'UI/UX Design', amount: 3000, status: 'paid', dueDate: '2024-02-01' },
      { id: 'm2', title: 'Frontend Development', amount: 5000, status: 'in_progress', dueDate: '2024-02-28' },
      { id: 'm3', title: 'Backend API', amount: 4000, status: 'pending', dueDate: '2024-03-15' },
      { id: 'm4', title: 'Testing & Deployment', amount: 3000, status: 'pending', dueDate: '2024-04-01' },
    ],
    signedByClient: true,
    signedByFreelancer: true,
    documents: [
      { name: 'Service Agreement', type: 'contract', url: '#' },
      { name: 'NDA', type: 'nda', url: '#' },
    ],
  },
];

const statusConfig = {
  pending_signature: { label: 'Pending Signature', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  paused: { label: 'Paused', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: Trash2 },
  disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
};

const milestoneStatusConfig = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-600' },
  submitted: { label: 'Submitted', color: 'bg-yellow-100 text-yellow-600' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-600' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-600' },
};

export default function ContractsPage() {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [expandedContract, setExpandedContract] = useState<string | null>('c1');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = ['all', 'pending_signature', 'active', 'completed', 'disputed'];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contracts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your service agreements and contracts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          <Plus size={14} />
          New Contract
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
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
            {filter === 'all' ? 'All Contracts' : statusConfig[filter as keyof typeof statusConfig]?.label || filter}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => {
          const config = statusConfig[contract.status];
          const isExpanded = expandedContract === contract.id;
          const completedMilestones = contract.milestones.filter(m => m.status === 'paid' || m.status === 'approved').length;

          return (
            <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Contract Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                onClick={() => setExpandedContract(isExpanded ? null : contract.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {contract.clientAvatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{contract.title}</h3>
                      <p className="text-sm text-gray-500">{contract.clientName} • {contract.paymentType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">${contract.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{completedMilestones}/{contract.milestones.length} milestones</div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
                      <config.icon size={12} className="inline mr-1" />
                      {config.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Download PDF">
                        <Download size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-6">
                  {/* Signature Status */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {contract.signedByClient ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Clock size={16} className="text-yellow-500" />
                      )}
                      <span className="text-sm">
                        <span className="font-medium">Client:</span> {contract.signedByClient ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.signedByFreelancer ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Clock size={16} className="text-yellow-500" />
                      )}
                      <span className="text-sm">
                        <span className="font-medium">Freelancer:</span> {contract.signedByFreelancer ? 'Signed' : 'Pending'}
                      </span>
                    </div>
                    {!contract.signedByFreelancer && (
                      <button className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Sign Contract
                      </button>
                    )}
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {contract.milestones.map((milestone) => {
                        const msConfig = milestoneStatusConfig[milestone.status];
                        return (
                          <div key={milestone.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                milestone.status === 'paid' ? 'bg-green-500' :
                                milestone.status === 'approved' ? 'bg-blue-500' :
                                milestone.status === 'in_progress' ? 'bg-yellow-500' :
                                milestone.status === 'submitted' ? 'bg-purple-500' : 'bg-gray-300'
                              }`} />
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white text-sm">{milestone.title}</span>
                                <span className="text-xs text-gray-500 ml-2">Due: {milestone.dueDate}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">${milestone.amount.toLocaleString()}</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${msConfig.color}`}>{msConfig.label}</span>
                              {(milestone.status === 'in_progress' || milestone.status === 'submitted') && (
                                <button className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                                  Submit Deliverable
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Documents</h4>
                    <div className="flex gap-3">
                      {contract.documents.map((doc, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <FileText size={16} className="text-blue-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Download size={12} />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <ExternalLink size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
