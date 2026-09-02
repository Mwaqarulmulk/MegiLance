// @AI-HINT: Public client profile page with dynamic SEO metadata & Person JSON-LD
import type { Metadata } from 'next';
import UserProfile from '@/app/components/Profile/UserProfile/UserProfile';
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps, BASE_URL } from '@/lib/seo';

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://api.megilance.site';

async function fetchClient(id: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND}/api/users/${id}/public`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const client = await fetchClient(id);

  if (!client) {
    return buildMeta({
      title: `Client Profile #${id}`,
      description: `View remote client profile #${id}, active projects, hiring reviews, and job listings on MegiLance.`,
      path: `/clients/${id}`,
    });
  }

  const name = client.name || client.full_name || 'Client';
  const company = client.company_name || '';
  const title = company ? `${name} at ${company}` : `${name} - Client Profile`;
  const description = `View ${name}'s profile on MegiLance.${company ? ` ${company}.` : ''} See project history, reviews, and hiring activity.`;

  return buildMeta({
    title,
    description: description.substring(0, 160),
    path: `/clients/${id}`,
    keywords: [name, company, 'client', 'hire freelancer', 'MegiLance'].filter(Boolean) as string[],
    image: client.profile_image_url || undefined,
  });
}

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await fetchClient(id);

  const name = client?.name || client?.full_name || 'Client';

  const personJsonLd = client
    ? {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        url: `${BASE_URL}/clients/${id}`,
        ...(client.company_name ? { worksFor: { '@type': 'Organization', name: client.company_name } } : {}),
        ...(client.location ? { address: { '@type': 'PostalAddress', addressLocality: client.location } } : {}),
        ...(client.profile_image_url ? { image: client.profile_image_url } : {}),
      }
    : null;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Clients', path: '/clients' },
    { name, path: `/clients/${id}` },
  ]);

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      {personJsonLd && <script {...jsonLdScriptProps(personJsonLd)} />}
      <UserProfile userId={id} />
    </>
  );
}
