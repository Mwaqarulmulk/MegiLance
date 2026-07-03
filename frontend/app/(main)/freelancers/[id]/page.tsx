// @AI-HINT: Public freelancer profile page with dynamic SEO metadata & Person JSON-LD
import type { Metadata } from 'next';
import UserProfile from '@/app/components/Profile/UserProfile/UserProfile';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, BASE_URL } from '@/lib/seo';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

async function fetchFreelancer(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND}/api/users/${id}/public`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Fallback: try search endpoint
      const controllerFallback = new AbortController();
      const timeoutIdFallback = setTimeout(() => controllerFallback.abort(), 4000);

      const searchRes = await fetch(`${BACKEND}/api/search/freelancers?q=&limit=100`, {
        next: { revalidate: 300 },
        signal: controllerFallback.signal,
      });
      clearTimeout(timeoutIdFallback);

      if (!searchRes.ok) return null;
      const data = await searchRes.json();
      const list = Array.isArray(data) ? data : data.freelancers || [];
      return list.find((f: any) => String(f.id) === String(id)) || null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const freelancer = await fetchFreelancer(id);

  if (!freelancer) {
    return buildMeta({
      title: `Freelancer Profile #${id}`,
      description: `View freelance expert profile #${id}, verified skills, project reviews, and portfolio on MegiLance.`,
      path: `/freelancers/${id}`,
    });
  }

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

  const name = freelancer?.name || freelancer?.full_name || 'Freelancer';
  const skills = freelancer && Array.isArray(freelancer.skills) ? freelancer.skills : [];

  // Person JSON-LD
  const personJsonLd = freelancer
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url: `${BASE_URL}/freelancers/${id}`,
        jobTitle: freelancer.title || 'Freelancer',
        ...(freelancer.location ? { address: { '@type': 'PostalAddress', addressLocality: freelancer.location } } : {}),
        ...(freelancer.profile_image_url ? { image: freelancer.profile_image_url } : {}),
        ...(skills.length ? { knowsAbout: skills } : {}),
      }
    : null;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Freelancers', path: '/freelancers' },
    { name, path: `/freelancers/${id}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      {personJsonLd && <script {...jsonLdScriptProps(personJsonLd)} />}
      <UserProfile userId={id} initialProfile={freelancer} />
    </>
  );
}
