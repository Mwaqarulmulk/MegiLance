// @AI-HINT: Public Job & Project detail page with dynamic SEO metadata and zero premature auth gating.
import type { Metadata } from 'next';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, BASE_URL } from '@/lib/seo';
import JobDetailClient, { PublicJobData } from './JobDetailClient';

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.megilance.site';

const SAMPLE_JOBS: Record<string, PublicJobData> = {
  '1': {
    id: '1',
    title: 'Next.js 16 SaaS Dashboard with Stripe Billing & Dark Theme',
    category: 'Web Development',
    description: 'We are seeking a senior Next.js & TypeScript engineer to construct a clean, modular SaaS dashboard. Work includes integrating Stripe Webhooks, building responsive analytics cards, and optimizing for WCAG 2.2 AA accessibility.',
    budget: 1800,
    budgetType: 'fixed_milestones',
    duration: '3 - 4 weeks',
    experienceLevel: 'Senior / Expert',
    skills: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS', 'Stripe API', 'PostgreSQL'],
    postedAt: '2 hours ago',
    client: {
      name: 'Voxel Cloud Labs',
      location: 'San Francisco, CA (Remote)',
      isPaymentVerified: true,
      totalHires: 14,
      rating: 4.96,
    },
    milestones: [
      { title: 'Project Architecture & UI Design System', description: 'Setup Next.js 16 skeleton, tokens, and responsive layout shell.', amount: 500 },
      { title: 'Stripe Subscriptions & API Integrations', description: 'Webhook processing, customer portal, and tier management.', amount: 700 },
      { title: 'Testing, Audit & Handover', description: 'Jest unit tests, lighthouse audit, and production deployment.', amount: 600 },
    ],
    isSample: true,
  },
  '2': {
    id: '2',
    title: 'FastAPI Microservice for Document Semantic Search & RAG',
    category: 'AI & Machine Learning',
    description: 'Looking for a Python specialist to build an async FastAPI endpoint for document embedding and retrieval. Experience with ChromaDB/Pinecone and OpenAI/Anthropic APIs required.',
    budget: 1400,
    budgetType: 'fixed_milestones',
    duration: '2 - 3 weeks',
    experienceLevel: 'Intermediate - Senior',
    skills: ['Python 3.11', 'FastAPI', 'PyTorch', 'Vector Databases', 'LangChain', 'Docker'],
    postedAt: '5 hours ago',
    client: {
      name: 'Synthetix AI',
      location: 'London, UK (Remote)',
      isPaymentVerified: true,
      totalHires: 8,
      rating: 5.0,
    },
    milestones: [
      { title: 'API Endpoint & Vector Indexing', description: 'FastAPI async ingestion pipeline and chunking.', amount: 700 },
      { title: 'RAG Retrieval & Benchmarking', description: 'Hybrid search, re-ranking, and response evaluation.', amount: 700 },
    ],
    isSample: true,
  },
};

function getSampleJobFallback(id: string): PublicJobData {
  if (SAMPLE_JOBS[id]) return SAMPLE_JOBS[id];
  return {
    id: String(id),
    title: `Freelance Project Opportunity #${id}`,
    category: 'Software & Engineering',
    description: 'Verified client project open for proposals on MegiLance. Milestone funds are pre-funded safely in escrow. Review requirements and submit your proposal directly.',
    budget: 1200,
    budgetType: 'fixed_milestones',
    duration: '2 - 4 weeks',
    experienceLevel: 'Intermediate - Expert',
    skills: ['Next.js', 'Python', 'UI/UX Design', 'API Integration'],
    postedAt: '1 day ago',
    client: {
      name: 'Verified Enterprise Client',
      location: 'Global Remote',
      isPaymentVerified: true,
      totalHires: 6,
      rating: 4.9,
    },
    milestones: [
      { title: 'Phase 1: Initial Scope & Prototype', description: 'Core functional prototype and UI review.', amount: 600 },
      { title: 'Phase 2: Production Delivery & Verification', description: 'Complete handover and deliverable verification.', amount: 600 },
    ],
    isSample: true,
  };
}

async function fetchJob(id: string): Promise<PublicJobData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND}/api/projects/${id}/public`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        id: String(data.id || id),
        title: data.title || 'Project Opportunity',
        category: data.category || 'Development',
        description: data.description || '',
        budget: Number(data.budget || 1000),
        budgetType: data.budget_type || 'fixed_milestones',
        duration: data.duration || '2 - 4 weeks',
        experienceLevel: data.experience_level || 'Intermediate',
        skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',') : ['Full-Stack']),
        postedAt: data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Recently',
        client: {
          name: data.client_name || 'Verified Client',
          location: data.client_location || 'Global Remote',
          isPaymentVerified: true,
          totalHires: data.client_hires || 5,
          rating: Number(data.client_rating || 5.0),
        },
        milestones: data.milestones || [],
        isSample: false,
      };
    }
  } catch {
    // Offline / Demo fallback
  }

  return getSampleJobFallback(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);

  return buildMeta({
    title: `${job.title} - MegiLance Jobs`,
    description: `${job.description.slice(0, 150)}... Budget: $${job.budget} USD with 100% milestone escrow protection.`,
    path: `/jobs/${id}`,
    keywords: [...job.skills, 'freelance job', 'remote project', 'MegiLance'],
  });
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await fetchJob(id);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Projects', path: '/explore' },
    { name: job.title, path: `/jobs/${id}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <JobDetailClient job={job} />
    </>
  );
}
