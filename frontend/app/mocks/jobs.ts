// @AI-HINT: Mock Jobs API used to simulate backend behavior for posting jobs.
import { readJSON, writeJSON, remove } from './storage';
import type { CreateJobInput, CreateJobResult, JobDraft } from './types';
import { getAuthToken } from '@/lib/api';

const STORAGE_KEY = 'client:post-job:draft';

function nowISO() {
  return new Date().toISOString();
}

function genId(prefix = 'job_') {
  return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function loadDraft(): JobDraft | null {
  return readJSON<JobDraft | null>(STORAGE_KEY, null);
}

export function saveDraft(partial: Partial<JobDraft>): JobDraft {
  const existing = loadDraft();
  const next: JobDraft = {
    id: existing?.id ?? genId(),
    title: existing?.title ?? '',
    category: existing?.category ?? '',
    budgetType: existing?.budgetType ?? 'Fixed',
    budget: existing?.budget ?? null,
    description: existing?.description ?? '',
    skills: existing?.skills ?? [],
    timeline: existing?.timeline ?? '',
    createdAt: existing?.createdAt ?? nowISO(),
    updatedAt: nowISO(),
    status: existing?.status ?? 'draft',
    ...partial,
  };
  writeJSON(STORAGE_KEY, next);
  return next;
}

export function clearDraft() {
  remove(STORAGE_KEY);
}

export async function submitJob(input: CreateJobInput): Promise<CreateJobResult> {
  const { apiFetch } = await import('@/lib/api/core');
  
  const result = await apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      category: input.category,
      budget_type: input.budgetType === 'Fixed' ? 'fixed' : 'hourly',
      budget_min: input.budgetType === 'Fixed' ? input.budget : null,
      budget_max: input.budgetType === 'Fixed' ? input.budget : null,
      skills: Array.isArray(input.skills) ? input.skills.join(',') : input.skills,
      estimated_duration: input.timeline,
      description: input.description || '',
      experience_level: 'intermediate',
    }),
  }) as { project_id?: number; id?: number };

  saveDraft({ status: 'submitted', updatedAt: nowISO() });
  clearDraft();
  return { id: String(result.project_id || result.id || 0), message: 'Job posted successfully.' };
}
