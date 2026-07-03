// @AI-HINT: Skill directory page - lists industries for a given skill
// URL pattern: /hire/[skill] (e.g., /hire/react-developer)

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HireSkillClient } from './HireSkillClient';
import { BASE_URL, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildItemListJsonLd, jsonLdScriptProps } from '@/lib/seo';

// ============ SKILL DATA (synced with sitemap.ts HIRE_SKILLS) ============
const SKILLS: Record<string, { name: string; category: string; avgRate: number }> = {
  'ai-developers': { name: 'AI Developer', category: 'AI/ML', avgRate: 95 },
  'web-developers': { name: 'Web Developer', category: 'Frontend', avgRate: 75 },
  'automation-experts': { name: 'Automation Expert', category: 'Backend', avgRate: 85 },
  'react-developer': { name: 'React Developer', category: 'Frontend', avgRate: 75 },
  'python-developer': { name: 'Python Developer', category: 'Backend', avgRate: 80 },
  'nodejs-developer': { name: 'Node.js Developer', category: 'Backend', avgRate: 70 },
  'ui-ux-designer': { name: 'UI/UX Designer', category: 'Design', avgRate: 65 },
  'mobile-developer': { name: 'Mobile Developer', category: 'Mobile', avgRate: 85 },
  'data-scientist': { name: 'Data Scientist', category: 'Data', avgRate: 95 },
  'devops-engineer': { name: 'DevOps Engineer', category: 'Infrastructure', avgRate: 90 },
  'fullstack-developer': { name: 'Full Stack Developer', category: 'Full Stack', avgRate: 85 },
  'wordpress-developer': { name: 'WordPress Developer', category: 'CMS', avgRate: 50 },
  'shopify-developer': { name: 'Shopify Developer', category: 'E-commerce', avgRate: 60 },
  'content-writer': { name: 'Content Writer', category: 'Writing', avgRate: 40 },
  'seo-specialist': { name: 'SEO Specialist', category: 'Marketing', avgRate: 55 },
  'video-editor': { name: 'Video Editor', category: 'Media', avgRate: 45 },
  'graphic-designer': { name: 'Graphic Designer', category: 'Design', avgRate: 50 },
  'machine-learning-engineer': { name: 'Machine Learning Engineer', category: 'AI/ML', avgRate: 100 },
  'blockchain-developer': { name: 'Blockchain Developer', category: 'Web3', avgRate: 110 },
  'flutter-developer': { name: 'Flutter Developer', category: 'Mobile', avgRate: 75 },
  'angular-developer': { name: 'Angular Developer', category: 'Frontend', avgRate: 70 },
  'vue-developer': { name: 'Vue.js Developer', category: 'Frontend', avgRate: 70 },
  'aws-architect': { name: 'AWS Solutions Architect', category: 'Cloud', avgRate: 120 },
  'java-developer': { name: 'Java Developer', category: 'Backend', avgRate: 80 },
  'go-developer': { name: 'Go Developer', category: 'Backend', avgRate: 90 },
  'rust-developer': { name: 'Rust Developer', category: 'Systems', avgRate: 95 },
  'typescript-developer': { name: 'TypeScript Developer', category: 'Frontend', avgRate: 75 },
  'ios-developer': { name: 'iOS Developer', category: 'Mobile', avgRate: 90 },
  'android-developer': { name: 'Android Developer', category: 'Mobile', avgRate: 85 },
  'cybersecurity-expert': { name: 'Cybersecurity Expert', category: 'Security', avgRate: 110 },
  'cloud-architect': { name: 'Cloud Architect', category: 'Cloud', avgRate: 125 },
  'php-developer': { name: 'PHP Developer', category: 'Backend', avgRate: 55 },
  'ruby-developer': { name: 'Ruby Developer', category: 'Backend', avgRate: 75 },
  'swift-developer': { name: 'Swift Developer', category: 'Mobile', avgRate: 90 },
  'kotlin-developer': { name: 'Kotlin Developer', category: 'Mobile', avgRate: 85 },
  'data-engineer': { name: 'Data Engineer', category: 'Data', avgRate: 95 },
  'qa-engineer': { name: 'QA Engineer', category: 'Testing', avgRate: 60 },
  'technical-writer': { name: 'Technical Writer', category: 'Writing', avgRate: 50 },
  'product-manager': { name: 'Product Manager', category: 'Management', avgRate: 95 },
  'project-manager': { name: 'Project Manager', category: 'Management', avgRate: 80 },
  'business-analyst': { name: 'Business Analyst', category: 'Management', avgRate: 75 },
  'social-media-manager': { name: 'Social Media Manager', category: 'Marketing', avgRate: 45 },
  'email-marketer': { name: 'Email Marketer', category: 'Marketing', avgRate: 50 },
  'copywriter': { name: 'Copywriter', category: 'Writing', avgRate: 55 },
  'illustrator': { name: 'Illustrator', category: 'Design', avgRate: 55 },
  'motion-designer': { name: 'Motion Designer', category: 'Design', avgRate: 65 },
  '3d-artist': { name: '3D Artist', category: 'Design', avgRate: 70 },
};

const INDUSTRIES = [
  { slug: 'healthcare', name: 'Healthcare', icon: '🏥', growth: 'high' },
  { slug: 'fintech', name: 'FinTech', icon: '💰', growth: 'high' },
  { slug: 'ecommerce', name: 'E-commerce', icon: '🛒', growth: 'medium' },
  { slug: 'education', name: 'Education', icon: '📚', growth: 'high' },
  { slug: 'real-estate', name: 'Real Estate', icon: '🏠', growth: 'medium' },
  { slug: 'saas', name: 'SaaS', icon: '☁️', growth: 'high' },
  { slug: 'gaming', name: 'Gaming', icon: '🎮', growth: 'high' },
  { slug: 'travel', name: 'Travel & Hospitality', icon: '✈️', growth: 'medium' },
  { slug: 'logistics', name: 'Logistics', icon: '📦', growth: 'medium' },
  { slug: 'media', name: 'Media & Entertainment', icon: '🎬', growth: 'medium' },
  { slug: 'automotive', name: 'Automotive', icon: '🚗', growth: 'medium' },
  { slug: 'startup', name: 'Startups', icon: '🚀', growth: 'high' },
  { slug: 'enterprise', name: 'Enterprise', icon: '🏢', growth: 'stable' },
  { slug: 'nonprofit', name: 'Non-Profit', icon: '❤️', growth: 'stable' },
  { slug: 'government', name: 'Government', icon: '🏛️', growth: 'stable' },
  { slug: 'crypto', name: 'Cryptocurrency', icon: '₿', growth: 'volatile' },
  { slug: 'ai', name: 'AI & Machine Learning', icon: '🤖', growth: 'explosive' },
  { slug: 'sustainability', name: 'Sustainability', icon: '🌱', growth: 'high' },
];

interface PageProps {
  params: Promise<{ skill: string }>;
}

export async function generateStaticParams() {
  return Object.keys(SKILLS).map((skill) => ({ skill }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { skill: skillSlug } = await params;
  const skill = SKILLS[skillSlug];

  if (!skill) {
    return { title: 'Hire Freelancers | MegiLance' };
  }

  const title = `Hire ${skill.name}s Online - Freelance ${skill.name}s for Hire | MegiLance`;
  const description = `Hire freelance ${skill.name.toLowerCase()}s on MegiLance. Average rate: $${skill.avgRate}/hr. Browse ${INDUSTRIES.length} industries, verified profiles, secure escrow payments. Best freelancer website to hire ${skill.category.toLowerCase()} experts.`;

  return {
    title,
    description,
    keywords: [
      `hire ${skill.name.toLowerCase()}`,
      `freelance ${skill.name.toLowerCase()}`,
      `${skill.name.toLowerCase()} for hire`,
      `${skill.category.toLowerCase()} freelancer`,
      `remote ${skill.name.toLowerCase()}`,
      `hire ${skill.name.toLowerCase()} online`,
      `best freelance ${skill.name.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/hire/${skillSlug}`,
      type: 'website',
      siteName: 'MegiLance',
    },
    alternates: {
      canonical: `${BASE_URL}/hire/${skillSlug}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function HireSkillPage({ params }: PageProps) {
  const { skill: skillSlug } = await params;
  const skill = SKILLS[skillSlug];

  if (!skill) {
    notFound();
  }

  const relatedSkills = Object.entries(SKILLS)
    .filter(([key]) => key !== skillSlug)
    .filter(([, s]) => s.category === skill.category)
    .slice(0, 4)
    .map(([slug, s]) => ({ slug, ...s }));

  const industryItems = INDUSTRIES.map((ind, i) => ({
    name: `Hire ${skill.name} for ${ind.name}`,
    url: `${BASE_URL}/hire/${skillSlug}/${ind.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <script {...jsonLdScriptProps(
        buildCollectionPageJsonLd(
          `Hire ${skill.name}s`,
          `Browse top ${skill.name}s by industry on MegiLance.`,
          `/hire/${skillSlug}`
        )
      )} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([
          { name: 'Hire', path: '/hire' },
          { name: skill.name, path: `/hire/${skillSlug}` },
        ])
      )} />
      <script {...jsonLdScriptProps(buildItemListJsonLd(industryItems))} />
      <HireSkillClient
        skill={{ slug: skillSlug, ...skill }}
        industries={INDUSTRIES}
        relatedSkills={relatedSkills}
      />
    </>
  );
}
