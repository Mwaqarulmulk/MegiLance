// @AI-HINT: Blog search layout – provides SEO metadata for the search page
import { buildMeta, buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';

export const metadata = buildMeta({
  title: 'Search Blog',
  description:
    'Search MegiLance blog for freelancing tips, career guides, industry insights, and platform updates.',
  path: '/blog/search',
  keywords: [
    'freelancing blog',
    'freelancer tips',
    'remote work',
    'career advice',
    'MegiLance blog',
  ],
});

const breadcrumb = buildBreadcrumbJsonLd([
  { name: 'Blog', path: '/blog' },
  { name: 'Search', path: '/blog/search' },
]);

export default function BlogSearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script {...jsonLdScriptProps(breadcrumb)} />
      {children}
    </>
  );
}
