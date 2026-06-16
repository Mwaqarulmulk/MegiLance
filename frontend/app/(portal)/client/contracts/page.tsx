'use client';

import { useState } from 'react';
import {
  FileText, Download, Send, Eye, CheckCircle, Clock, AlertCircle,
  Plus, ChevronDown, ChevronRight, DollarSign, Calendar, User
} from 'lucide-react';
import { SignaturePad } from '@/app/components/SignaturePad';

interface Contract {
  id: string;
  title: string;
  freelancerName: string;
  freelancerTitle: string;
  status: 'pending_signature' | 'active' | 'paused' | 'completed' | 'cancelled' | 'disputed';
  totalAmount: number;
  currency: string;
  paymentType: string;
  startDate: string;
  endDate: string;
  milestones: {
    id: string;
    title: string;
    amount: number;
    status: string;
    dueDate: string;
  }[];
  signedByClient: boolean;
  signedByFreelancer: boolean;
}

const mockContracts: Contract[] = [
  {
    id: 'c1',
    title: 'E-Commerce Platform Development',
    freelancerName: 'John Developer',
    freelancerTitle: 'Senior Full-Stack Developer',
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
  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_signature: { label: 'Pending Signature', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  paused: { label: 'Paused', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700' },
};

export default function ClientContractsPage() {
  const [contracts] = useState<Contract[]>(mockContracts);
  const [expandedContract, setExpandedContract] = useState<string | null>('c1');
  const [showSignModal, setShowSignModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contracts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your service agreements</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus size={14} />
          New Contract
        </button>
      </div>

      <div className="space-y-4">
        {contracts.map((contract) => {
          const config = statusConfig[contract.status];
          const isExpanded = expandedContract === contract.id;
          return (
            <div key={contract.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                onClick={() => setExpandedContract(isExpanded ? null : contract.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="text-gray-400">
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{contract.title}</h3>
                      <p className="text-sm text-gray-500">{contract.freelancerName} • {contract.freelancerTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">${contract.totalAmount.toLocaleString()}</div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>{config.label}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-4">
                  {/* Signatures */}
                  <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {contract.signedByClient ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-yellow-500" />}
                      <span className="text-sm"><b>Client:</b> {contract.signedByClient ? 'Signed' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract.signedByFreelancer ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-yellow-500" />}
                      <span className="text-sm"><b>Freelancer:</b> {contract.signedByFreelancer ? 'Signed' : 'Pending'}</span>
                    </div>
                    {!contract.signedByClient && (
                      <button onClick={() => setShowSignModal(true)} className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Sign Contract
                      </button>
                    )}
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">Milestones</h4>
                    <div className="space-y-2">
                      {contract.milestones.map((ms) => (
                        <div key={ms.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${ms.status === 'paid' ? 'bg-green-500' : ms.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{ms.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">${ms.amount.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{ms.dueDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Download size={14} /> Download PDF
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sign Modal */}
      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign Contract</h2>
            <p className="text-sm text-gray-500">Draw your signature below to sign this contract.</p>
            <SignaturePad
              onSignature={(dataUrl) => {
                console.log('Contract signed');
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
