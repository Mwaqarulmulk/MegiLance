// @AI-HINT: Workroom API — Kanban board tasks, file sharing, discussions for contract collaboration
import { apiFetch, getAuthToken } from './core';
import type { ResourceId } from './core';

export const workroomApi = {
  // Kanban Board
  getBoard: (contractId: ResourceId) =>
    apiFetch(`/workroom/contracts/${contractId}/board`),

  createTask: (contractId: ResourceId, data: {
    title: string;
    description?: string;
    column?: string;
    priority?: string;
    assignee_id?: number;
    due_date?: string;
    labels?: string[];
  }) =>
    apiFetch(`/workroom/contracts/${contractId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (taskId: ResourceId, data: {
    title?: string;
    description?: string;
    column?: string;
    priority?: string;
    assignee_id?: number;
    due_date?: string;
    labels?: string[];
    order_index?: number;
  }) =>
    apiFetch(`/workroom/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  moveTask: (taskId: ResourceId, column: string, orderIndex: number) =>
    apiFetch(`/workroom/tasks/${taskId}/move`, {
      method: 'POST',
      body: JSON.stringify({ column, order_index: orderIndex }),
    }),

  deleteTask: (taskId: ResourceId) =>
    apiFetch(`/workroom/tasks/${taskId}`, { method: 'DELETE' }),

  // Files
  getFiles: (contractId: ResourceId) =>
    apiFetch(`/workroom/contracts/${contractId}/files`),

  uploadFile: (contractId: ResourceId, file: File, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (description) formData.append('description', description);
    return apiFetch(`/workroom/contracts/${contractId}/files`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },

  downloadFile: async (fileId: ResourceId) => {
    const token = getAuthToken();
    const response = await fetch(`/api/v1/workroom/files/${fileId}/download`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!response.ok) {
      let message = 'Failed to download file';
      try {
        const error = await response.json();
        message = error.detail || error.message || message;
      } catch {
        // Keep the safe generic message for non-JSON failures.
      }
      throw new Error(message);
    }
    return response.blob();
  },

  deleteFile: (fileId: ResourceId) =>
    apiFetch(`/workroom/files/${fileId}`, { method: 'DELETE' }),

  // Discussions
  getDiscussions: (contractId: ResourceId, page = 1, pageSize = 20) =>
    apiFetch(`/workroom/contracts/${contractId}/discussions?page=${page}&page_size=${pageSize}`),

  createDiscussion: (contractId: ResourceId, data: {
    title: string;
    content: string;
    is_pinned?: boolean;
  }) =>
    apiFetch(`/workroom/contracts/${contractId}/discussions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDiscussion: (discussionId: ResourceId) =>
    apiFetch(`/workroom/discussions/${discussionId}`),

  addReply: (discussionId: ResourceId, content: string, parentId?: number) =>
    apiFetch(`/workroom/discussions/${discussionId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_id: parentId }),
    }),

  // Activity & Summary
  getActivity: (contractId: ResourceId, page = 1, pageSize = 50) =>
    apiFetch(`/workroom/contracts/${contractId}/activity?page=${page}&page_size=${pageSize}`),

  getSummary: (contractId: ResourceId) =>
    apiFetch(`/workroom/contracts/${contractId}/summary`),
};
