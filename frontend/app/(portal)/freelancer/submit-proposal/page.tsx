'use client';

import { useState } from 'react';
import { RichTextEditor } from '@/app/components/Editor';
import { SignaturePad } from '@/app/components/SignaturePad';
import {
  Send, Save, Eye, Clock, CheckCircle, AlertCircle,
  FileText, DollarSign, Calendar, Paperclip, Plus, Trash2,
  ChevronRight, ArrowLeft, Download, Upload
} from 'lucide-react';

interface ProposalData {
  projectId: string;
  projectTitle: string;
  coverLetter: string;
  bidAmount: number;
  hourlyRate: number;
  estimatedHours: number;
  timeline: string;
  milestones: { title: string; amount: number; dueDate: string }[];
  attachments: File[];
}

const mockProjects = [
  { id: 'p1', title: 'E-Commerce Platform Development', budget: '10000-15000', skills: ['React', 'Node.js', 'PostgreSQL'] },
  { id: 'p2', title: 'Mobile App for Fitness Tracking', budget: '5000-8000', skills: ['React Native', 'Firebase'] },
  { id: 'p3', title: 'AI Chatbot Integration', budget: '3000-6000', skills: ['Python', 'OpenAI', 'FastAPI'] },
];

export default function SubmitProposalPage() {
  const [step, setStep] = useState(1);
  const [proposal, setProposal] = useState<ProposalData>({
    projectId: '',
    projectTitle: '',
    coverLetter: '',
    bidAmount: 0,
    hourlyRate: 0,
    estimatedHours: 0,
    timeline: '',
    milestones: [{ title: '', amount: 0, dueDate: '' }],
    attachments: [],
  });
  const [showSignature, setShowSignature] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<string[]>([]);

  const steps = [
    { id: 1, label: 'Project & Details' },
    { id: 2, label: 'Terms & Pricing' },
    { id: 3, label: 'Review & Submit' },
  ];

  const addMilestone = () => {
    setProposal(prev => ({
      ...prev,
      milestones: [...prev.milestones, { title: '', amount: 0, dueDate: '' }],
    }));
  };

  const removeMilestone = (index: number) => {
    setProposal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }));
  };

  const updateMilestone = (index: number, field: string, value: string | number) => {
    setProposal(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === index ? { ...m, [field]: value } : m),
    }));
  };

  const saveDraft = () => {
    setSavedDrafts(prev => [...prev, `Draft ${prev.length + 1}`]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Submit Proposal</h1>
          <p className="text-gray-500 text-sm mt-1">Create a compelling proposal to win the project</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveDraft}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Save size={14} />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
            <Eye size={14} />
            Preview
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                step === s.id
                  ? 'bg-blue-600 text-white'
                  : step > s.id
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
              }`}
            >
              {step > s.id ? <CheckCircle size={14} /> : <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">{s.id}</span>}
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight size={16} className="text-gray-400 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1: Project & Details */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Project Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Select Project</h3>
            <div className="space-y-3">
              {mockProjects.map((project) => (
                <label
                  key={project.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    proposal.projectId === project.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="project"
                    value={project.id}
                    checked={proposal.projectId === project.id}
                    onChange={(e) => setProposal({ ...proposal, projectId: e.target.value, projectTitle: project.title })}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                    <div className="text-sm text-gray-500">Budget: ${project.budget}</div>
                    <div className="flex gap-1 mt-1">
                      {project.skills.map((s) => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cover Letter</h3>
            <RichTextEditor
              content={proposal.coverLetter}
              onChange={(html) => setProposal({ ...proposal, coverLetter: html })}
              placeholder="Write a compelling cover letter explaining why you're the best fit for this project..."
              minHeight="200px"
              maxLength={5000}
            />
          </div>

          {/* Attachments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attachments</h3>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500">Drag & drop files or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOC, images up to 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Terms & Pricing */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Pricing */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bid Amount ($)</label>
                <input
                  type="number"
                  value={proposal.bidAmount || ''}
                  onChange={(e) => setProposal({ ...proposal, bidAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($/hr)</label>
                <input
                  type="number"
                  value={proposal.hourlyRate || ''}
                  onChange={(e) => setProposal({ ...proposal, hourlyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={proposal.estimatedHours || ''}
                  onChange={(e) => setProposal({ ...proposal, estimatedHours: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeline</label>
                <input
                  type="text"
                  value={proposal.timeline}
                  onChange={(e) => setProposal({ ...proposal, timeline: e.target.value })}
                  placeholder="e.g., 4-6 weeks"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Milestones</h3>
              <button
                onClick={addMilestone}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} />
                Add Milestone
              </button>
            </div>
            <div className="space-y-3">
              {proposal.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={milestone.title}
                    onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    placeholder="Milestone title"
                    className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    value={milestone.amount || ''}
                    onChange={(e) => updateMilestone(index, 'amount', Number(e.target.value))}
                    placeholder="$"
                    className="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={milestone.dueDate}
                    onChange={(e) => updateMilestone(index, 'dueDate', e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {proposal.milestones.length > 1 && (
                    <button onClick={() => removeMilestone(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Proposal Summary</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500">Project</span>
                <p className="font-medium text-gray-900 dark:text-white">{proposal.projectTitle || 'Not selected'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Cover Letter</span>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300 prose prose-sm" dangerouslySetInnerHTML={{ __html: proposal.coverLetter || '<p class="text-gray-400">Not provided</p>' }} />
              </div>
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-sm text-gray-500">Bid Amount</span>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">${proposal.bidAmount.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Hourly Rate</span>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">${proposal.hourlyRate}/hr</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Hours</span>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{proposal.estimatedHours}h</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Timeline</span>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{proposal.timeline || 'N/A'}</p>
                </div>
              </div>
              {proposal.milestones.some(m => m.title) && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500">Milestones</span>
                  <div className="mt-2 space-y-2">
                    {proposal.milestones.filter(m => m.title).map((m, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{m.title}</span>
                        <span className="font-medium text-gray-900 dark:text-white">${m.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* E-Signature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Digital Signature</h3>
            <p className="text-sm text-gray-500 mb-4">Sign your proposal to authenticate it.</p>
            <button
              onClick={() => setShowSignature(!showSignature)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {showSignature ? 'Hide' : 'Add'} Signature
            </button>
            {showSignature && (
              <div className="mt-4">
                <SignaturePad
                  onSignature={(dataUrl) => {
                    console.log('Signature captured');
                    setShowSignature(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} />
          Previous
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Next Step
            <ChevronRight size={14} />
          </button>
        ) : (
          <button className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Send size={14} />
            Submit Proposal
          </button>
        )}
      </div>
    </div>
  );
}
