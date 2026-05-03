// @AI-HINT: Data analytics export API — BI reports, export jobs, templates, scheduled exports
import { apiFetch } from './core';
import type { ResourceId } from './core';

export const dataExportApi = {
  createExport: (data: {
    name: string;
    data_type: string;
    format?: string;
    filters?: Record<string, unknown>;
    columns?: string[];
  }) => {
    const params = new URLSearchParams();
    params.set('name', data.name);
    params.set('data_type', data.data_type);
    if (data.format) params.set('format', data.format);
    return apiFetch(`/data-export/create?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({ filters: data.filters, columns: data.columns }),
    });
  },

  listExports: (filters?: { status?: string; page?: number; page_size?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.page_size) params.set('page_size', String(filters.page_size));
    const qs = params.toString();
    return apiFetch(`/data-export/list${qs ? `?${qs}` : ''}`);
  },

  getExport: (exportId: ResourceId) =>
    apiFetch(`/data-export/${exportId}`),

  downloadExport: (exportId: ResourceId) =>
    apiFetch(`/data-export/${exportId}/download`),

  deleteExport: (exportId: ResourceId) =>
    apiFetch(`/data-export/${exportId}`, { method: 'DELETE' }),

  getTemplates: (dataType?: string) => {
    const qs = dataType ? `?data_type=${encodeURIComponent(dataType)}` : '';
    return apiFetch(`/data-export/templates${qs}`);
  },

  getAvailableColumns: (dataType: string) =>
    apiFetch(`/data-export/available-columns/${encodeURIComponent(dataType)}`),

  previewExport: (data: {
    data_type: string;
    columns: string[];
    filters?: Record<string, unknown>;
    limit?: number;
  }) =>
    apiFetch('/data-export/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getStorageUsage: () => apiFetch('/data-export/storage-usage'),

  // Scheduled exports
  getScheduledExports: () => apiFetch('/data-export/scheduled'),

  createScheduledExport: (data: {
    template_id: string;
    name: string;
    schedule: string;
    format: string;
    recipients: string[];
  }) =>
    apiFetch('/data-export/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteScheduledExport: (scheduledId: ResourceId) =>
    apiFetch(`/data-export/scheduled/${scheduledId}`, { method: 'DELETE' }),
};
