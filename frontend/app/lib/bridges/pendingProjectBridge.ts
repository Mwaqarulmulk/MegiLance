// @AI-HINT: Universal Lead Magnet & 1-Click Hiring Bridge utility for all 11 AI Productivity Tools
import type { ExtractedBrief, InstantMatchDraft } from '@/app/components/AI/InstantMatchingWizard/types';

export const PENDING_PROJECT_KEY = 'megilance_pending_project';
export const DRAFT_STORAGE_KEY = 'megilance_instant_match_draft';
export const PENDING_PROPOSAL_KEY = 'megilance_pending_proposal';

export interface MilestoneItem {
  title: string;
  amount: number;
  deliverables?: string;
  duration_days?: number;
}

export interface PendingProjectPayload {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budgetMin: string | number;
  budgetMax: string | number;
  budgetType: 'fixed' | 'hourly';
  experienceLevel: 'entry' | 'intermediate' | 'expert' | string;
  duration: 'less_than_1_month' | '1_to_3_months' | '3_to_6_months' | 'more_than_6_months' | string;
  sourceTool?: string;
  instantMatchFreelancerId?: string | number;
  estimatedDays?: number;
  milestones?: MilestoneItem[];
  rawToolOutput?: Record<string, any>;
  timestamp?: number;
}

export interface PendingProposalPayload {
  jobId?: number | string;
  projectId?: number | string;
  projectTitle?: string;
  coverLetter: string;
  bidAmount?: number | null;
  hourlyRate?: number | null;
  estimatedHours?: number | null;
  availability?: string;
  matchedSkills?: string[];
  sourceTool?: string;
  timestamp?: number;
}

export interface BridgeTransitionOptions {
  mode?: 'instant_match' | 'project_wizard' | 'project_form' | 'proposal_submit';
  returnUrl?: string;
  target?: 'wizard' | 'form';
  onModalOpen?: () => void;
}

/**
 * Normalizes any category or service string to valid platform category enum
 */
export function normalizeCategory(category?: string, serviceType?: string): string {
  const combined = `${category || ''} ${serviceType || ''}`.toLowerCase().trim();

  if (!combined) return 'WEB_DEVELOPMENT';

  if (
    combined.includes('mobile') ||
    combined.includes('ios') ||
    combined.includes('android') ||
    combined.includes('react native') ||
    combined.includes('flutter')
  ) {
    return 'MOBILE_DEVELOPMENT';
  }

  if (
    combined.includes('ai') ||
    combined.includes('machine learning') ||
    combined.includes('llm') ||
    combined.includes('nlp') ||
    combined.includes('deep learning') ||
    combined.includes('data science') ||
    combined.includes('analytics')
  ) {
    return 'AI_AND_MACHINE_LEARNING';
  }

  if (
    combined.includes('design') ||
    combined.includes('ui') ||
    combined.includes('ux') ||
    combined.includes('figma') ||
    combined.includes('branding') ||
    combined.includes('graphic') ||
    combined.includes('illustration')
  ) {
    return 'DESIGN_AND_CREATIVE';
  }

  if (
    combined.includes('devops') ||
    combined.includes('aws') ||
    combined.includes('cloud') ||
    combined.includes('docker') ||
    combined.includes('kubernetes') ||
    combined.includes('ci/cd') ||
    combined.includes('server')
  ) {
    return 'DEVOPS_AND_CLOUD';
  }

  if (
    combined.includes('writing') ||
    combined.includes('content') ||
    combined.includes('copy') ||
    combined.includes('translation') ||
    combined.includes('blog') ||
    combined.includes('technical write')
  ) {
    return 'WRITING_AND_TRANSLATION';
  }

  if (
    combined.includes('marketing') ||
    combined.includes('seo') ||
    combined.includes('sales') ||
    combined.includes('ads') ||
    combined.includes('social media') ||
    combined.includes('growth')
  ) {
    return 'SALES_AND_MARKETING';
  }

  if (
    combined.includes('web') ||
    combined.includes('fullstack') ||
    combined.includes('full_stack') ||
    combined.includes('frontend') ||
    combined.includes('backend') ||
    combined.includes('react') ||
    combined.includes('next') ||
    combined.includes('api') ||
    combined.includes('software')
  ) {
    return 'WEB_DEVELOPMENT';
  }

  return 'OTHER';
}

/**
 * Infers default high-demand skills for a service type or category
 */
export function inferSkills(serviceType?: string, category?: string): string[] {
  const text = `${serviceType || ''} ${category || ''}`.toLowerCase();

  if (text.includes('mobile') || text.includes('ios') || text.includes('android')) {
    return ['React Native', 'Flutter', 'iOS', 'Android', 'Mobile UI/UX'];
  }
  if (text.includes('ai') || text.includes('ml') || text.includes('data')) {
    return ['Python', 'FastAPI', 'PyTorch', 'OpenAI API', 'LangChain'];
  }
  if (text.includes('design') || text.includes('ui') || text.includes('ux')) {
    return ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'Responsive Design'];
  }
  if (text.includes('devops') || text.includes('cloud') || text.includes('aws')) {
    return ['AWS', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform'];
  }
  if (text.includes('contract') || text.includes('legal')) {
    return ['Contract Agreement', 'Escrow Milestones', 'Legal Compliance', 'Project Delivery'];
  }
  if (text.includes('invoice') || text.includes('accounting') || text.includes('tax')) {
    return ['Accounting', 'Tax Filing', 'Bookkeeping', 'QuickBooks', 'Financial Planning'];
  }
  if (text.includes('fraud') || text.includes('security')) {
    return ['Security Audit', 'Escrow Protected', 'Code Review', 'Risk Assessment'];
  }

  return ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS'];
}

/* ============================================================================
   Dual-Storage Synchronization Functions
   ============================================================================ */

/**
 * Saves pending project payload with dual-storage sync (sessionStorage + localStorage)
 * and automatically updates megilance_instant_match_draft for instant matching wizard.
 */
export function savePendingProject(payload: PendingProjectPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const enrichedPayload: PendingProjectPayload = {
      ...payload,
      timestamp: payload.timestamp || Date.now(),
      skills: Array.isArray(payload.skills) ? payload.skills : inferSkills(undefined, payload.category),
      category: payload.category || 'WEB_DEVELOPMENT',
      budgetType: payload.budgetType || 'fixed',
      experienceLevel: payload.experienceLevel || 'intermediate',
      duration: payload.duration || '1_to_3_months',
    };

    const serialized = JSON.stringify(enrichedPayload);
    sessionStorage.setItem(PENDING_PROJECT_KEY, serialized);
    localStorage.setItem(PENDING_PROJECT_KEY, serialized);

    // Sync into InstantMatchDraft format in localStorage so Instant Matching Wizard can mount instantly
    const brief: ExtractedBrief = {
      title: enrichedPayload.title || 'Custom Project Scope',
      description: enrichedPayload.description || '',
      category: enrichedPayload.category || 'WEB_DEVELOPMENT',
      skills: enrichedPayload.skills,
      budget_min: Number(enrichedPayload.budgetMin) || 500,
      budget_max: Number(enrichedPayload.budgetMax) || 2500,
      budget_type: enrichedPayload.budgetType || 'fixed',
      estimated_days: enrichedPayload.estimatedDays || 14,
      experience_level: enrichedPayload.experienceLevel || 'intermediate',
      duration: enrichedPayload.duration || '1_to_3_months',
    };

    const instantMatchDraft: InstantMatchDraft = {
      step: 2,
      prompt: enrichedPayload.description || enrichedPayload.title,
      category: enrichedPayload.category,
      budgetHint: Number(enrichedPayload.budgetMax) || undefined,
      extractedBrief: brief,
      matches: [],
      selectedCandidate: null,
      milestoneDraft: enrichedPayload.milestones && enrichedPayload.milestones.length > 0 ? {
        title: enrichedPayload.milestones[0].title,
        amount: enrichedPayload.milestones[0].amount,
        deliverables: enrichedPayload.milestones[0].deliverables || 'Initial Milestone Deliverable',
        notes: `Created from ${enrichedPayload.sourceTool || 'AI Tool'}`,
      } : null,
      timestamp: Date.now(),
      source: enrichedPayload.sourceTool || 'ai_tool_lead_magnet',
    };

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(instantMatchDraft));
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to save pending project:', err);
  }
}

/**
 * Retrieves the pending project payload from sessionStorage with fallback to localStorage
 */
export function getPendingProject(): PendingProjectPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_PROJECT_KEY) || localStorage.getItem(PENDING_PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingProjectPayload;
    if (parsed && (parsed.title || parsed.description)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to read pending project:', err);
  }
  return null;
}

/**
 * Clears pending project payload from all storages
 */
export function clearPendingProject(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PENDING_PROJECT_KEY);
    localStorage.removeItem(PENDING_PROJECT_KEY);
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to clear pending project:', err);
  }
}

/**
 * Checks if a valid pending project exists in storage
 */
export function hasPendingProject(): boolean {
  return getPendingProject() !== null;
}

/**
 * Saves a pending freelancer proposal draft with dual-storage sync
 */
export function savePendingProposal(payload: PendingProposalPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const enriched: PendingProposalPayload = {
      ...payload,
      timestamp: payload.timestamp || Date.now(),
    };
    const serialized = JSON.stringify(enriched);
    sessionStorage.setItem(PENDING_PROPOSAL_KEY, serialized);
    localStorage.setItem(PENDING_PROPOSAL_KEY, serialized);
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to save pending proposal:', err);
  }
}

/**
 * Retrieves the pending proposal draft from sessionStorage with fallback to localStorage
 */
export function getPendingProposal(): PendingProposalPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PENDING_PROPOSAL_KEY) || localStorage.getItem(PENDING_PROPOSAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingProposalPayload;
    if (parsed && (parsed.coverLetter || parsed.jobId || parsed.projectId)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to read pending proposal:', err);
  }
  return null;
}

/**
 * Clears pending proposal from all storages
 */
export function clearPendingProposal(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PENDING_PROPOSAL_KEY);
    localStorage.removeItem(PENDING_PROPOSAL_KEY);
  } catch (err) {
    console.warn('[pendingProjectBridge] Failed to clear pending proposal:', err);
  }
}

/**
 * Checks if a valid pending proposal exists in storage
 */
export function hasPendingProposal(): boolean {
  return getPendingProposal() !== null;
}

/* ============================================================================
   Universal Payload Builder for All 11 AI Tools
   ============================================================================ */

/**
 * Maps specialized output from any of the 11 AI productivity tools into standard PendingProjectPayload
 */
export function buildPendingProjectPayload(
  toolName: string,
  result: any,
  options?: {
    customTitle?: string;
    customDescription?: string;
    customCategory?: string;
    customSkills?: string[];
    customBudgetMin?: number;
    customBudgetMax?: number;
    customBudgetType?: 'fixed' | 'hourly';
    formState?: Record<string, any>;
  }
): PendingProjectPayload {
  const normTool = (toolName || '').toLowerCase().replace(/_/g, '-');
  const form = options?.formState || {};

  switch (normTool) {
    case 'price-estimator':
    case 'price-estimator-pro': {
      const meta = result?.meta || {};
      const est = result?.estimate || {};
      const timeline = result?.timeline || {};
      const hours = result?.hours_breakdown;
      const low = Number(est.low_estimate) || 500;
      const high = Number(est.high_estimate) || 2500;
      const service = meta.service_type || meta.category || 'Development';
      const category = normalizeCategory(meta.category, meta.service_type);

      const description = `Project Scope: ${meta.scope || 'Moderate'}
Estimated Budget: $${low.toLocaleString()} - $${high.toLocaleString()}
Estimated Timeframe: ${timeline.label || `${timeline.weeks || 3} weeks`}
Estimated Hours: ${est.total_hours || 40}h

Methodology & Architecture:
${result?.methodology || 'Full agile delivery cycle with unit testing and documentation.'}
${hours ? `\nHours Breakdown:\n• Core Development: ${hours.core_hours || 0}h\n• Additional Features: ${hours.feature_hours || 0}h\n• Project Coordination: ${hours.coordination_hours || 0}h` : ''}`;

      return {
        title: options?.customTitle || `Hire developer for ${service.replace(/_/g, ' ')}`,
        description: options?.customDescription || description,
        category: options?.customCategory || category,
        skills: options?.customSkills || (result?.skills?.length ? result.skills : inferSkills(meta.service_type, category)),
        budgetMin: options?.customBudgetMin ?? low,
        budgetMax: options?.customBudgetMax ?? high,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: meta.experience_level === 'entry' ? 'entry' : meta.experience_level === 'expert' ? 'expert' : 'intermediate',
        duration: (timeline.weeks || 2) <= 2 ? 'less_than_1_month' : (timeline.weeks || 4) <= 4 ? '1_to_3_months' : '3_to_6_months',
        sourceTool: 'price_estimator',
        estimatedDays: (timeline.weeks || 2) * 7,
        rawToolOutput: result,
      };
    }

    case 'scope-planner': {
      const proj = result?.project || {};
      const timeline = result?.timeline || {};
      const budget = result?.budget || {};
      const phases = Array.isArray(timeline.phases) ? timeline.phases : [];
      const deliverables = Array.isArray(result?.deliverables) ? result.deliverables : [];
      const team = Array.isArray(budget.team_breakdown) ? budget.team_breakdown : [];
      const totalBudget = Math.round(Number(budget.total) || 3000);
      const laborCost = Math.round(Number(budget.labor_cost) || totalBudget * 0.85);
      const category = normalizeCategory(proj.category);

      const description = `Project: ${proj.name || 'Custom Project Scope'} (${proj.category_label || 'Digital Product'}, ${proj.complexity_label || 'Standard'} Complexity)
Duration: ${timeline.total_weeks || 4} weeks
Total Budget: $${totalBudget.toLocaleString()} (Labor: $${laborCost.toLocaleString()}, Risk Buffer: $${Math.round(Number(budget.risk_buffer) || 0).toLocaleString()})

Phases Breakdown:
${phases.map((p: any) => `• ${p.name || 'Phase'} (${p.weeks || 1} wks): ${p.description || ''}`).join('\n')}

Key Deliverables:
${deliverables.map((d: any) => `• ${d}`).join('\n')}

Target Roles: ${team.map((t: any) => t.role).join(', ') || 'Lead Developer, UI/UX Designer'}`;

      const milestones: MilestoneItem[] = phases.map((p: any) => ({
        title: p.name || 'Project Phase',
        amount: Math.round(totalBudget / (phases.length || 1)),
        deliverables: p.description || 'Phase deliverables',
        duration_days: (p.weeks || 1) * 7,
      }));

      return {
        title: options?.customTitle || proj.name || 'Custom Project Scope Plan',
        description: options?.customDescription || description,
        category: options?.customCategory || category,
        skills: options?.customSkills || (team.length ? team.map((t: any) => t.role) : inferSkills(undefined, category)),
        budgetMin: options?.customBudgetMin ?? laborCost,
        budgetMax: options?.customBudgetMax ?? totalBudget,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: proj.complexity === 'low' ? 'entry' : (proj.complexity === 'high' || proj.complexity === 'enterprise') ? 'expert' : 'intermediate',
        duration: (timeline.total_weeks || 4) <= 4 ? 'less_than_1_month' : (timeline.total_weeks || 8) <= 12 ? '1_to_3_months' : '3_to_6_months',
        sourceTool: 'scope_planner',
        estimatedDays: (timeline.total_weeks || 4) * 7,
        milestones: milestones.length ? milestones : undefined,
        rawToolOutput: result,
      };
    }

    case 'rate-advisor': {
      const rates = result?.rates || {};
      const meta = result?.meta || {};
      const service = meta.service_type || form.service_type || 'Specialist';
      const category = normalizeCategory(undefined, service);
      const minRate = Number(rates.minimum) || 35;
      const recRate = Number(rates.recommended) || 65;
      const premRate = Number(rates.premium) || 95;

      const description = `Looking for an experienced ${service.replace(/_/g, ' ')} specialist.
Target Market Rate: $${recRate}/hr (Range: $${minRate}-$${premRate}/hr).
Estimated Commitment: ~${form.weekly_hours || 30} hrs/week.
Experience Level: ${meta.experience_level || 'Intermediate'}.`;

      return {
        title: options?.customTitle || `Hire ${meta.experience_level ? meta.experience_level.toUpperCase() : 'Experienced'} ${service.replace(/_/g, ' ')}`,
        description: options?.customDescription || description,
        category: options?.customCategory || category,
        skills: options?.customSkills || (form.skills_text ? form.skills_text.split(',').map((s: string) => s.trim()).filter(Boolean) : inferSkills(service, category)),
        budgetMin: options?.customBudgetMin ?? minRate,
        budgetMax: options?.customBudgetMax ?? premRate,
        budgetType: options?.customBudgetType || 'hourly',
        experienceLevel: meta.experience_level === 'junior' ? 'entry' : (meta.experience_level === 'senior' || meta.experience_level === 'expert') ? 'expert' : 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'rate_advisor',
        rawToolOutput: result,
      };
    }

    case 'proposal-writer': {
      const proposalText = result?.proposal || '';
      const detected = result?.detected_project_type?.primary || 'WEB_DEVELOPMENT';
      const matched = result?.skill_match?.matched_skills || [];
      const rateObj = result?.suggested_rate || {};
      const category = normalizeCategory(detected);

      const title = form.project_title || options?.customTitle || 'Project Scope Implementation';
      const desc = form.project_description || (proposalText ? proposalText.slice(0, 600) : 'Custom development project requirement.');

      return {
        title,
        description: options?.customDescription || desc,
        category: options?.customCategory || category,
        skills: options?.customSkills || (matched.length ? matched.map((s: any) => s.skill || s) : inferSkills(undefined, category)),
        budgetMin: options?.customBudgetMin ?? Math.round((Number(rateObj.range_low) || 35) * 20),
        budgetMax: options?.customBudgetMax ?? Math.round((Number(rateObj.range_high) || 75) * 40),
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: form.experience_level || 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'proposal_writer',
        rawToolOutput: result,
      };
    }

    case 'skill-analyzer': {
      const skillsArr = Array.isArray(result?.skills_analyzed) ? result.skills_analyzed : [];
      const meta = result?.meta || {};
      const estRate = result?.estimated_rate || {};
      const targetRole = meta.target_role || 'Specialist';
      const category = normalizeCategory(skillsArr[0]?.category, targetRole);

      const description = `Seeking a verified specialist with proven proficiency in:
${skillsArr.map((s: any) => `• ${s.label || s.skill} (Demand: ${s.demand_score || 80}/100, Global Rate: $${s.global_avg_rate || 50}/hr)`).join('\n')}

Estimated Market Rate: $${Math.round(Number(estRate.hourly_rate) || 60)}/hr (Range: $${Number(estRate.range_low) || 40}-$${Number(estRate.range_high) || 90}/hr).`;

      return {
        title: options?.customTitle || `Hire ${meta.experience_level ? meta.experience_level.toUpperCase() : 'Senior'} ${targetRole}`,
        description: options?.customDescription || description,
        category: options?.customCategory || category,
        skills: options?.customSkills || (skillsArr.length ? skillsArr.map((s: any) => s.label || s.skill) : inferSkills(targetRole, category)),
        budgetMin: options?.customBudgetMin ?? (Number(estRate.range_low) || 40),
        budgetMax: options?.customBudgetMax ?? (Number(estRate.range_high) || 90),
        budgetType: options?.customBudgetType || 'hourly',
        experienceLevel: meta.experience_level === 'junior' ? 'entry' : (meta.experience_level === 'senior' || meta.experience_level === 'expert') ? 'expert' : 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'skill_analyzer',
        rawToolOutput: result,
      };
    }

    case 'invoice-generator': {
      const items = Array.isArray(result?.items) ? result.items : [];
      const calcs = result?.calculations || {};
      const invoice = result?.invoice || {};
      const grandTotal = Math.round(Number(calcs.grand_total) || 1200);
      const subtotal = Math.round(Number(calcs.subtotal) || grandTotal * 0.9);

      const description = `Project Milestone Delivery Scope from Invoice #${invoice.number || '001'}:

Deliverable Line Items:
${items.map((item: any) => `• ${item.description || 'Milestone'}: ${item.quantity || 1} ${item.unit || 'unit'} @ $${item.rate || 0} = $${Number(item.total || 0).toLocaleString()}`).join('\n')}

Subtotal: $${subtotal.toLocaleString()}
Total Escrow Value: $${grandTotal.toLocaleString()}`;

      const milestones: MilestoneItem[] = items.map((it: any) => ({
        title: it.description || 'Project Milestone',
        amount: Number(it.total) || Math.round(grandTotal / (items.length || 1)),
        deliverables: `Completion of ${it.description || 'deliverable'}`,
      }));

      return {
        title: options?.customTitle || (items[0]?.description ? `Deliverable: ${items[0].description.slice(0, 50)}` : 'Milestone Escrow Project Scope'),
        description: options?.customDescription || description,
        category: options?.customCategory || 'WEB_DEVELOPMENT',
        skills: options?.customSkills || ['Milestone Delivery', 'Escrow Billing', 'Project Management'],
        budgetMin: options?.customBudgetMin ?? subtotal,
        budgetMax: options?.customBudgetMax ?? grandTotal,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: 'intermediate',
        duration: 'less_than_1_month',
        sourceTool: 'invoice_generator',
        milestones: milestones.length ? milestones : undefined,
        rawToolOutput: result,
      };
    }

    case 'contract-builder': {
      const formD = result?.formData || result || {};
      const totalVal = Math.round(Number(formD.total_value) || 1500);
      const category = normalizeCategory(formD.contract_type);

      const description = `Contract Scope of Work:
${formD.scope_description || 'Standard freelance services agreement and milestones.'}

Payment Terms: ${formD.payment_schedule || 'Milestone Escrow'}
Contract Value: $${totalVal.toLocaleString()}
Jurisdiction: ${formD.jurisdiction || 'US Standard / Remote'}`;

      return {
        title: options?.customTitle || (formD.scope_description ? `Contract: ${formD.scope_description.slice(0, 45)}...` : 'Freelance Services Agreement'),
        description: options?.customDescription || description,
        category: options?.customCategory || category,
        skills: options?.customSkills || ['Contract Agreement', 'Escrow Milestones', 'Project Delivery'],
        budgetMin: options?.customBudgetMin ?? Math.round(totalVal * 0.8),
        budgetMax: options?.customBudgetMax ?? totalVal,
        budgetType: formD.payment_schedule === 'hourly' ? 'hourly' : 'fixed',
        experienceLevel: 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'contract_builder',
        rawToolOutput: result,
      };
    }

    case 'fraud-check': {
      const riskLevel = result?.riskLevel || 'Low';
      const confidence = result?.confidence || 95;
      const text = options?.customDescription || form.text || result?.cleanText || 'Audited and verified project brief.';

      const description = `Verified Project Brief (Audited by MegiLance Trust Engine):
${text}

Trust & Safety Status: Risk Level ${riskLevel}, Confidence ${confidence}%. Protected by 100% Milestone Escrow.`;

      return {
        title: options?.customTitle || `Verified Project: ${text.slice(0, 45)}...`,
        description,
        category: options?.customCategory || 'WEB_DEVELOPMENT',
        skills: options?.customSkills || ['Verified Specialist', 'Escrow Protected', 'Code Review'],
        budgetMin: options?.customBudgetMin ?? 500,
        budgetMax: options?.customBudgetMax ?? 2500,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'fraud_check',
        rawToolOutput: result,
      };
    }

    case 'income-calculator': {
      const recs = result?.rate_recommendations || {};
      const cur = result?.meta?.currency || 'USD';
      const comfRate = Math.round(Number(recs.comfortable_hourly) || 60);
      const breakEven = Math.round(Number(recs.break_even_hourly) || 40);
      const premRate = Math.round(Number(recs.premium_hourly) || 90);

      const description = `Looking to hire top freelance specialist at verified market rates.
Target Rate: $${comfRate}/hr (Range: $${breakEven}-$${premRate}/hr).
Estimated Commitment: ~${form.hours_per_week || 40} hrs/week.`;

      return {
        title: options?.customTitle || `Hire Dedicated Specialist ($${comfRate}/hr)`,
        description: options?.customDescription || description,
        category: options?.customCategory || 'WEB_DEVELOPMENT',
        skills: options?.customSkills || ['Dedicated Specialist', 'Full-Time Remote', 'Milestone Delivery'],
        budgetMin: options?.customBudgetMin ?? breakEven,
        budgetMax: options?.customBudgetMax ?? premRate,
        budgetType: options?.customBudgetType || 'hourly',
        experienceLevel: 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'income_calculator',
        rawToolOutput: result,
      };
    }

    case 'expense-calculator':
    case 'expense-tax-calculator': {
      const inc = result?.income || {};
      const q = result?.quarterly || {};
      const gross = Math.round(Number(inc.gross_business_income) || 60000);
      const qTax = Math.round(Number(q.estimated_quarterly) || 3500);

      const description = `Seeking a certified tax & accounting specialist for freelance quarterly tax filings, business expense deduction optimization, and bookkeeping.
Annual Business Volume: $${gross.toLocaleString()}.
Estimated Quarterly Tax: $${qTax.toLocaleString()}.`;

      return {
        title: options?.customTitle || 'Hire Freelance Tax & Accounting Specialist',
        description: options?.customDescription || description,
        category: options?.customCategory || 'OTHER',
        skills: options?.customSkills || ['Accounting', 'Tax Filing', 'Bookkeeping', 'QuickBooks', 'Financial Planning'],
        budgetMin: options?.customBudgetMin ?? 300,
        budgetMax: options?.customBudgetMax ?? 1500,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: 'expert',
        duration: 'less_than_1_month',
        sourceTool: 'expense_calculator',
        rawToolOutput: result,
      };
    }

    case 'chatbot':
    case 'ai-assistant': {
      const msg = options?.customDescription || (typeof result === 'string' ? result : result?.prompt || result?.message || 'Custom project scope from AI Assistant');
      const title = options?.customTitle || `Hire Specialist: ${msg.slice(0, 45)}...`;
      const category = normalizeCategory(undefined, msg);

      return {
        title,
        description: `Project brief formulated via MegiLance AI Assistant:\n\n${msg}`,
        category: options?.customCategory || category,
        skills: options?.customSkills || inferSkills(undefined, category),
        budgetMin: options?.customBudgetMin ?? 500,
        budgetMax: options?.customBudgetMax ?? 3000,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: 'intermediate',
        duration: '1_to_3_months',
        sourceTool: 'chatbot',
        rawToolOutput: typeof result === 'object' ? result : { message: result },
      };
    }

    default: {
      return {
        title: options?.customTitle || 'Custom Freelance Project',
        description: options?.customDescription || 'Project requirement created via MegiLance AI Tool.',
        category: options?.customCategory || 'WEB_DEVELOPMENT',
        skills: options?.customSkills || inferSkills(),
        budgetMin: options?.customBudgetMin ?? 500,
        budgetMax: options?.customBudgetMax ?? 2500,
        budgetType: options?.customBudgetType || 'fixed',
        experienceLevel: 'intermediate',
        duration: '1_to_3_months',
        sourceTool: toolName,
        rawToolOutput: result,
      };
    }
  }
}

/* ============================================================================
   1-Click Navigation & Transition Helpers
   ============================================================================ */

/**
 * 1-Click Launch Instant Match: saves payload, syncs draft, and routes to matching wizard / dashboard
 */
export function launchInstantMatch(
  payload: PendingProjectPayload,
  router?: any,
  options?: BridgeTransitionOptions
): void {
  savePendingProject(payload);

  if (options?.onModalOpen) {
    options.onModalOpen();
    return;
  }

  if (router?.push) {
    const returnUrl = options?.returnUrl || '/client/dashboard?instantMatch=resume';
    router.push(returnUrl);
  }
}

/**
 * 1-Click Launch Project Creation: saves payload and routes to project creation wizard or form
 */
export function launchProjectCreation(
  payload: PendingProjectPayload,
  router?: any,
  options?: BridgeTransitionOptions
): void {
  savePendingProject(payload);

  if (router?.push) {
    if (options?.target === 'form') {
      const query = new URLSearchParams({
        title: payload.title || '',
        category: payload.category || 'WEB_DEVELOPMENT',
        skills: Array.isArray(payload.skills) ? payload.skills.join(',') : '',
        budget_min: String(payload.budgetMin || 500),
        budget_max: String(payload.budgetMax || 2500),
      }).toString();
      router.push(`/client/projects/create?${query}`);
    } else {
      router.push('/create-project');
    }
  }
}

/**
 * 1-Click Launch Proposal Submission: saves proposal draft and routes to submit proposal page
 */
export function launchProposalSubmission(
  payload: PendingProposalPayload,
  projectId: string | number,
  router?: any,
  options?: { isGuest?: boolean; returnUrl?: string }
): void {
  savePendingProposal({
    ...payload,
    jobId: projectId,
    projectId: projectId,
  });

  if (router?.push) {
    const targetUrl = `/freelancer/submit-proposal?jobId=${projectId}`;
    if (options?.isGuest) {
      const signupUrl = `/signup?role=freelancer&redirect=proposal&returnTo=${encodeURIComponent(targetUrl)}`;
      router.push(signupUrl);
    } else {
      router.push(targetUrl);
    }
  }
}
