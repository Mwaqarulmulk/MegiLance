// @AI-HINT: Custom hook for managing proposals (freelancer bids on projects)
// Handles creating, submitting, and managing proposal state
'use client';

import { useState, useCallback } from 'react';
import api, { APIError } from '@/lib/api';

export interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  bid_amount: number;
  estimated_hours: number;
  hourly_rate: number;
  availability: string;
  attachments?: string;
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'withdrawn';
  is_draft: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  job_title?: string;
  client_name?: string;
  project?: {
    id: number;
    title: string;
    budget_min: number;
    budget_max: number;
    client_name: string;
  };
}

export interface CreateProposalData {
  project_id: number;
  cover_letter: string;
  bid_amount: number;
  estimated_hours?: number;
  hourly_rate?: number;
  availability?: string;
  attachments?: string;
}

interface UseProposalsReturn {
  proposals: Proposal[];
  drafts: Proposal[];
  currentProposal: Proposal | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchProposals: (projectId?: number) => Promise<void>;
  fetchDrafts: () => Promise<void>;
  fetchProposal: (id: number) => Promise<Proposal>;
  createProposal: (data: CreateProposalData) => Promise<Proposal>;
  saveDraft: (data: CreateProposalData) => Promise<Proposal>;
  submitDraft: (id: number) => Promise<Proposal>;
  updateProposal: (id: number, data: Partial<CreateProposalData>) => Promise<Proposal>;
  withdrawProposal: (id: number) => Promise<void>;
  deleteProposal: (id: number) => Promise<void>;
  // For clients
  acceptProposal: (id: number) => Promise<void>;
  rejectProposal: (id: number, reason?: string) => Promise<void>;
  getProjectProposals: (projectId: number) => Promise<Proposal[]>;
}

export function useProposals(): UseProposalsReturn {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [drafts, setDrafts] = useState<Proposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async (projectId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = projectId ? { project_id: projectId } : {};
      const response = await api.proposals.list(params) as any;
      const proposalList = Array.isArray(response) ? response : (response.proposals || []);
      setProposals(proposalList);
    } catch (err) {
      console.error('Failed to fetch proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch proposals');
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.proposals.getDrafts() as any;
      const draftList = Array.isArray(response) ? response : (response.drafts || []);
      setDrafts(draftList);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
      setDrafts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProposal = useCallback(async (id: number): Promise<Proposal> => {
    setIsLoading(true);
    setError(null);
    try {
      const proposal = await api.proposals.get(id) as Proposal;
      setCurrentProposal(proposal);
      return proposal;
    } catch (err) {
      console.error('Failed to fetch proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (data: CreateProposalData): Promise<Proposal> => {
    setIsLoading(true);
    setError(null);
    try {
      const proposal = await api.proposals.create(data) as Proposal;
      // Refresh proposals list
      await fetchProposals();
      return proposal;
    } catch (err) {
      console.error('Failed to create proposal:', err);
      let message = 'Failed to create proposal';
      if (err instanceof APIError) {
        message = err.message;
        if (err.status === 403) {
          message = err.message.includes('profile') 
            ? 'Please complete your profile before submitting proposals'
            : 'Only freelancers can submit proposals';
        } else if (err.status === 409) {
          message = 'You have already submitted a proposal for this project';
        }
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProposals]);

  const saveDraft = useCallback(async (data: CreateProposalData): Promise<Proposal> => {
    setIsLoading(true);
    setError(null);
    try {
      const proposal = await api.proposals.saveDraft(data) as Proposal;
      await fetchDrafts();
      return proposal;
    } catch (err) {
      console.error('Failed to save draft:', err);
      const message = err instanceof Error ? err.message : 'Failed to save draft';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDrafts]);

  const submitDraft = useCallback(async (id: number): Promise<Proposal> => {
    setIsLoading(true);
    setError(null);
    try {
      const proposal = await api.proposals.submitDraft(id) as Proposal;
      // Move from drafts to proposals
      setDrafts(prev => prev.filter(d => d.id !== id));
      await fetchProposals();
      return proposal;
    } catch (err) {
      console.error('Failed to submit draft:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProposals]);

  const updateProposal = useCallback(async (id: number, data: Partial<CreateProposalData>): Promise<Proposal> => {
    setIsLoading(true);
    setError(null);
    try {
      const proposal = await api.proposals.update(id, data) as Proposal;
      setProposals(prev => prev.map(p => p.id === id ? proposal : p));
      setDrafts(prev => prev.map(d => d.id === id ? proposal : d));
      if (currentProposal?.id === id) {
        setCurrentProposal(proposal);
      }
      return proposal;
    } catch (err) {
      console.error('Failed to update proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to update proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProposal]);

  const withdrawProposal = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.proposals.withdraw(id);
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'withdrawn' as const } : p));
      if (currentProposal?.id === id) {
        setCurrentProposal(prev => prev ? { ...prev, status: 'withdrawn' } : null);
      }
    } catch (err) {
      console.error('Failed to withdraw proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to withdraw proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProposal]);

  const deleteProposal = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.proposals.delete(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      setDrafts(prev => prev.filter(d => d.id !== id));
      if (currentProposal?.id === id) {
        setCurrentProposal(null);
      }
    } catch (err) {
      console.error('Failed to delete proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProposal]);

  // Client actions
  const acceptProposal = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.proposals.accept(id);
      setProposals(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'accepted' as const } : p
      ));
    } catch (err) {
      console.error('Failed to accept proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to accept proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectProposal = useCallback(async (id: number, reason?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.proposals.reject(id, reason);
      setProposals(prev => prev.map(p => 
        p.id === id ? { ...p, status: 'rejected' as const } : p
      ));
    } catch (err) {
      console.error('Failed to reject proposal:', err);
      const message = err instanceof Error ? err.message : 'Failed to reject proposal';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProjectProposals = useCallback(async (projectId: number): Promise<Proposal[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.proposals.getByProject(projectId) as any;
      const proposalList = Array.isArray(response) ? response : (response.proposals || []);
      return proposalList;
    } catch (err) {
      console.error('Failed to fetch project proposals:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch proposals';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    proposals,
    drafts,
    currentProposal,
    isLoading,
    error,
    fetchProposals,
    fetchDrafts,
    fetchProposal,
    createProposal,
    saveDraft,
    submitDraft,
    updateProposal,
    withdrawProposal,
    deleteProposal,
    acceptProposal,
    rejectProposal,
    getProjectProposals,
  };
}

export default useProposals;
