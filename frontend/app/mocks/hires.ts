// @AI-HINT: Hire draft storage API for managing hire drafts in localStorage.
import { readJSON, writeJSON, remove } from './storage';
import type { CreateHireInput, CreateHireResult, HireDraft } from './types';

const STORAGE_KEY = 'client:hire:draft';

function nowISO() {
  return new Date().toISOString();
}

function genId(prefix = 'hire_') {
  return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function loadHireDraft(): HireDraft | null {
  return readJSON<HireDraft | null>(STORAGE_KEY, null);
}

export function saveHireDraft(partial: Partial<HireDraft>): HireDraft {
  const existing = loadHireDraft();
  const next: HireDraft = {
    id: existing?.id ?? genId(),
    freelancerId: existing?.freelancerId ?? '',
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    rateType: existing?.rateType ?? 'Hourly',
    rate: existing?.rate ?? null,
    startDate: existing?.startDate ?? '',
    createdAt: existing?.createdAt ?? nowISO(),
    updatedAt: nowISO(),
    status: existing?.status ?? 'draft',
    ...partial,
  };
  writeJSON(STORAGE_KEY, next);
  return next;
}

export function clearHireDraft() {
  remove(STORAGE_KEY);
}

export async function submitHire(input: CreateHireInput): Promise<CreateHireResult> {
  const { apiFetch } = await import('@/lib/api/core');
  
  const result = await apiFetch('/contracts/direct', {
    method: 'POST',
    body: JSON.stringify({
      freelancer_id: parseInt(input.freelancerId, 10),
      title: input.title,
      description: input.description,
      rate_type: input.rateType,
      rate: input.rate,
      start_date: input.startDate || null,
    }),
  }) as { contract_id?: number; id?: number };

  saveHireDraft({ status: 'submitted', updatedAt: nowISO() });
  clearHireDraft();
  return { id: String(result.contract_id || result.id || 0), message: 'Hire request sent successfully.' };
}
