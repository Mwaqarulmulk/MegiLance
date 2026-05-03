// @AI-HINT: Custom hook for managing projects (CRUD operations)
// Used by both clients and freelancers for project interactions
'use client';

import { useState, useEffect, useCallback } from 'react';
import api, { APIError } from '@/lib/api';

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget_type: 'fixed' | 'hourly';
  budget_min: number;
  budget_max: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  estimated_duration: string;
  skills: string[];
  client_id: number;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  created_at: string;
  updated_at: string;
  // Computed/joined fields
  client_name?: string;
  proposal_count?: number;
  hired_freelancer?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

export interface CreateProjectData {
  title: string;
  description: string;
  category: string;
  budget_type: 'fixed' | 'hourly';
  budget_min: number;
  budget_max: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  estimated_duration: string;
  skills: string[];
}

export interface ProjectFilters {
  status?: string;
  category?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string;
}

interface UseProjectsReturn {
  projects: Project[];
  myProjects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  fetchProjects: (filters?: ProjectFilters) => Promise<void>;
  fetchMyProjects: () => Promise<void>;
  fetchProject: (id: number) => Promise<Project>;
  createProject: (data: CreateProjectData) => Promise<Project>;
  updateProject: (id: number, data: Partial<CreateProjectData>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
  // Pagination
  totalProjects: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProjects, setTotalProjects] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchProjects = useCallback(async (filters?: ProjectFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.projects.list({
        page: page,
        page_size: pageSize,
        status: filters?.status,
        category: filters?.category,
      }) as any;

      // Handle array or paginated response
      if (Array.isArray(response)) {
        setProjects(response);
        setTotalProjects(response.length);
      } else {
        setProjects(response.projects || response.items || []);
        setTotalProjects(response.total || response.count || 0);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  const fetchMyProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.projects.getMyProjects() as any;
      const projectList = Array.isArray(response) ? response : (response.projects || []);
      setMyProjects(projectList);
    } catch (err) {
      console.error('Failed to fetch my projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setMyProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: number): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await api.projects.get(id) as Project;
      setCurrentProject(project);
      return project;
    } catch (err) {
      console.error('Failed to fetch project:', err);
      const message = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectData): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await api.projects.create({
        ...data,
        status: 'open',
      }) as Project;
      // Refresh my projects list
      await fetchMyProjects();
      return project;
    } catch (err) {
      console.error('Failed to create project:', err);
      let message = 'Failed to create project';
      if (err instanceof APIError) {
        message = err.message;
        if (err.status === 403 && err.message.includes('profile')) {
          message = 'Please complete your profile before posting a project';
        }
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMyProjects]);

  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectData>): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    try {
      const project = await api.projects.update(id, data) as Project;
      // Update local state
      setMyProjects(prev => prev.map(p => p.id === id ? project : p));
      if (currentProject?.id === id) {
        setCurrentProject(project);
      }
      return project;
    } catch (err) {
      console.error('Failed to update project:', err);
      const message = err instanceof Error ? err.message : 'Failed to update project';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.projects.delete(id);
      // Update local state
      setMyProjects(prev => prev.filter(p => p.id !== id));
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProject?.id === id) {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  return {
    projects,
    myProjects,
    currentProject,
    isLoading,
    error,
    fetchProjects,
    fetchMyProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    totalProjects,
    page,
    setPage,
    pageSize,
  };
}

export default useProjects;
