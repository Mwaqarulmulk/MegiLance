import api, { ResourceId } from '@/lib/api';
import { unwrapResponse, errorToString } from './base.service';

export interface ProjectFilters {
  status?: string;
  category?: string;
  page?: number;
  page_size?: number;
  search?: string;
  sort?: string;
}

export async function fetchMyProjects(filters?: ProjectFilters) {
  try {
    const res = await api.projects.list(filters);
    return unwrapResponse(res, 'items');
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to fetch projects'));
  }
}

export async function fetchProjectById(id: ResourceId) {
  try {
    return await api.projects.get(id);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to fetch project'));
  }
}

export async function createProject(data: {
  title: string;
  description: string;
  category: string;
  budget_type?: string;
  budget_min?: number;
  budget_max?: number;
  experience_level?: string;
  estimated_duration?: string;
  skills?: string[];
  status?: string;
}) {
  try {
    return await api.projects.create(data);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to create project'));
  }
}

export async function updateProject(id: ResourceId, data: Record<string, unknown>) {
  try {
    return await api.projects.update(id, data);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to update project'));
  }
}

export async function deleteProject(id: ResourceId) {
  try {
    return await api.projects.delete(id);
  } catch (err) {
    throw new Error(errorToString(err, 'Failed to delete project'));
  }
}

export function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    on_hold: 'On Hold',
    review: 'Under Review',
  };
  return labels[status] || status;
}

export function getBudgetDisplay(budget?: number, budgetMin?: number, budgetMax?: number): string {
  if (budget) return `$${budget.toLocaleString()}`;
  if (budgetMin && budgetMax) return `$${budgetMin.toLocaleString()} - $${budgetMax.toLocaleString()}`;
  return 'Negotiable';
}
