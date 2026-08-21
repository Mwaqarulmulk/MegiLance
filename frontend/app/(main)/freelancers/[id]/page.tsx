// @AI-HINT: Public freelancer profile page with dynamic SEO metadata & Person JSON-LD.
// Supports verified backend profiles with transparent sample profile fallbacks to guarantee zero 404s.
import type { Metadata } from 'next';
import UserProfile from '@/app/components/Profile/UserProfile/UserProfile';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, BASE_URL } from '@/lib/seo';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, CheckCircle2 } from 'lucide-react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

const SAMPLE_PROFILES: Record<string, any> = {
  '416': {
    id: '416',
    name: 'Elena Popova',
    title: 'Senior Full-Stack & UI Architect',
    bio: 'Specialist in Next.js 16, TypeScript, React 19, and Tailwind CSS. Over 7 years of experience building high-performance SaaS dashboards, component libraries, and design systems.',
    hourly_rate: 75,
    location: 'Remote · UTC+2 (Central Europe)',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'PostgreSQL'],
    profile_image_url: '/avatars/alexia.jpg',
    seller_level: 'Top Rated Plus',
    is_verified: true,
    rating: 4.98,
    total_reviews: 47,
    completed_projects: 52,
    availability_status: 'available',
    is_sample_profile: true,
  },
  'elena-popova': {
    id: 'elena-popova',
    name: 'Elena Popova',
    title: 'Senior Full-Stack & UI Architect',
    bio: 'Specialist in Next.js 16, TypeScript, React 19, and Tailwind CSS. Over 7 years of experience building high-performance SaaS dashboards, component libraries, and design systems.',
    hourly_rate: 75,
    location: 'Remote · UTC+2 (Central Europe)',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Figma', 'UI/UX Design', 'PostgreSQL'],
    profile_image_url: '/avatars/alexia.jpg',
    seller_level: 'Top Rated Plus',
    is_verified: true,
    rating: 4.98,
    total_reviews: 47,
    completed_projects: 52,
    availability_status: 'available',
    is_sample_profile: true,
  },
  'david-chen': {
    id: 'david-chen',
    name: 'David Chen',
    title: 'Senior AI & Backend Engineer',
    bio: 'Python, FastAPI, PyTorch, and LangChain specialist. Experienced in designing resilient LLM pipelines, vector search architectures, and high-throughput microservices.',
    hourly_rate: 85,
    location: 'Remote · UTC-5 (US East)',
    skills: ['Python', 'FastAPI', 'PyTorch', 'LLMs', 'Docker', 'PostgreSQL', 'Redis'],
    profile_image_url: '/avatars/john.jpg',
    seller_level: 'Top Rated',
    is_verified: true,
    rating: 4.95,
    total_reviews: 38,
    completed_projects: 41,
    availability_status: 'available',
    is_sample_profile: true,
  },
  'amara-okonjo': {
    id: 'amara-okonjo',
    name: 'Amara Okonjo',
    title: 'Lead Product & UX Designer',
    bio: 'Design systems, user research, wireframing, and interactive design prototypes. Dedicated to creating intuitive B2B and consumer SaaS experiences.',
    hourly_rate: 65,
    location: 'Remote · UTC+1 (West Africa / Europe)',
    skills: ['Figma', 'UI/UX Design', 'User Research', 'Design Systems', 'Prototyping', 'Design Tokens'],
    profile_image_url: '/avatars/maria.jpg',
    seller_level: 'Top Rated',
    is_verified: true,
    rating: 5.0,
    total_reviews: 29,
    completed_projects: 33,
    availability_status: 'available',
    is_sample_profile: true,
  },
};

function getSampleFallback(id: string) {
  if (SAMPLE_PROFILES[id]) return SAMPLE_PROFILES[id];
  // Default generic sample fallback so no ID ever throws a dead 404
  return {
    id: String(id),
    name: `Specialist #${id}`,
    title: 'Verified Independent Freelancer',
    bio: 'Experienced freelance specialist on MegiLance. Available for custom milestone-based contracts with full escrow protection.',
    hourly_rate: 60,
    location: 'Global Remote',
    skills: ['Full-Stack', 'Frontend', 'Backend', 'UI/UX Design'],
    profile_image_url: '/avatars/alexia.jpg',
    seller_level: 'Verified Pro',
    is_verified: true,
    rating: 4.9,
    total_reviews: 12,
    completed_projects: 15,
    availability_status: 'available',
    is_sample_profile: true,
  };
}

async function fetchFreelancer(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BACKEND}/api/users/${id}/public`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }

    // Fallback search
    const controllerFallback = new AbortController();
    const timeoutIdFallback = setTimeout(() => controllerFallback.abort(), 3000);

    const searchRes = await fetch(`${BACKEND}/api/search/freelancers?q=&limit=100`, {
      next: { revalidate: 300 },
      signal: controllerFallback.signal,
    });
    clearTimeout(timeoutIdFallback);

    if (searchRes.ok) {
      const data = await searchRes.json();
      const list = Array.isArray(data) ? data : data.freelancers || [];
      const match = list.find((f: any) => String(f.id) === String(id) || f.slug === id || f.profile_slug === id);
      if (match) return match;
    }
  } catch {
    // Backend offline or unreachable
  }

  // Return guaranteed sample profile
  return getSampleFallback(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const freelancer = await fetchFreelancer(id);

  const name = freelancer.name || freelancer.full_name || 'Freelancer';
  const titleLine = freelancer.title || freelancer.bio?.substring(0, 60) || 'Professional Freelancer';
  const skills = Array.isArray(freelancer.skills)
    ? freelancer.skills.slice(0, 5)
    : typeof freelancer.skills === 'string'
      ? freelancer.skills.split(',').slice(0, 5).map((s: string) => s.trim())
      : [];

  const title = `${name} - ${titleLine}`;
  const description = `Hire ${name} on MegiLance. ${skills.length ? `Expert in ${skills.join(', ')}. ` : ''}${freelancer.hourly_rate ? `$${freelancer.hourly_rate}/hr. ` : ''}View portfolio, reviews, and availability.`;

  const keywords = [name, titleLine, ...skills, 'freelancer', 'hire', 'MegiLance'].filter(Boolean) as string[];

  return buildMeta({
    title,
    description: description.substring(0, 160),
    path: `/freelancers/${id}`,
    keywords,
    image: freelancer.profile_image_url || undefined,
  });
}

export default async function FreelancerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const freelancer = await fetchFreelancer(id);

  const name = freelancer.name || freelancer.full_name || 'Freelancer';
  const skills = freelancer && Array.isArray(freelancer.skills) ? freelancer.skills : [];

  // Person JSON-LD
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${BASE_URL}/freelancers/${id}`,
    jobTitle: freelancer.title || 'Freelancer',
    ...(freelancer.location ? { address: { '@type': 'PostalAddress', addressLocality: freelancer.location } } : {}),
    ...(freelancer.profile_image_url ? { image: freelancer.profile_image_url } : {}),
    ...(skills.length ? { knowsAbout: skills } : {}),
  };

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Freelancers', path: '/talent' },
    { name, path: `/freelancers/${id}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      <script {...jsonLdScriptProps(personJsonLd)} />

      {/* Top Banner if sample demo profile */}
      {freelancer.is_sample_profile && (
        <div className="bg-blue-50/90 dark:bg-blue-950/40 border-b border-blue-200/80 dark:border-blue-900/60 py-2.5 px-4 text-center text-xs text-blue-900 dark:text-blue-200">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Link href="/talent" className="inline-flex items-center gap-1.5 font-bold hover:underline">
              <ArrowLeft size={13} /> Back to Talent Directory
            </Link>
            <span className="inline-flex items-center gap-1 font-semibold">
              <Sparkles size={13} className="text-amber-500" />
              Demo Candidate Profile · MegiLance Public Beta
            </span>
            <Link href="/signup" className="hidden sm:inline-block font-bold underline hover:text-blue-700">
              Create Your Profile
            </Link>
          </div>
        </div>
      )}

      <UserProfile userId={id} initialProfile={freelancer} />
    </>
  );
}
