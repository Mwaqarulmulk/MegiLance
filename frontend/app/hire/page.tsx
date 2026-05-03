// @AI-HINT: Skills directory page listing all available skills for hiring
// Parent page for /hire/[skill]/[industry] programmatic SEO pages

import type { Metadata } from 'next';
import { buildMeta, buildCollectionPageJsonLd, buildBreadcrumbJsonLd, buildItemListJsonLd, jsonLdScriptProps, BASE_URL, getKeywordsForPage } from '@/lib/seo';
import HireClient from './HireClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Hire Freelancers Online - Web Developers, Graphic Designers & Experts for Hire',
    description: 'Hire freelancers by skill on MegiLance. Find and hire web developers, graphic designers, Python developers, and 30+ specializations. Verified profiles, escrow payments, satisfaction guaranteed. Better Upwork alternative with lower fees.',
    path: '/hire',
    keywords: getKeywordsForPage(['transactional', 'technology'], [
      'hire freelancers', 'hire web developer', 'hire graphic designer',
      'developers for hire', 'programmer for hire', 'hire python developers',
      'hire a web designer', 'hire a virtual assistant',
      'freelance web developer', 'freelance website designer',
    ]),
  });
}

const skillCategories = [
  { name: 'React Developers', url: `${BASE_URL}/hire/react-developer`, position: 1 },
  { name: 'Python Developers', url: `${BASE_URL}/hire/python-developer`, position: 2 },
  { name: 'Node.js Developers', url: `${BASE_URL}/hire/nodejs-developer`, position: 3 },
  { name: 'Full Stack Developers', url: `${BASE_URL}/hire/fullstack-developer`, position: 4 },
  { name: 'UI/UX Designers', url: `${BASE_URL}/hire/ui-ux-designer`, position: 5 },
  { name: 'Mobile Developers', url: `${BASE_URL}/hire/mobile-developer`, position: 6 },
  { name: 'Data Scientists', url: `${BASE_URL}/hire/data-scientist`, position: 7 },
  { name: 'DevOps Engineers', url: `${BASE_URL}/hire/devops-engineer`, position: 8 },
];

export default function HireDirectoryPage() {
  return (
    <>
      <script {...jsonLdScriptProps(
        buildCollectionPageJsonLd('Hire Freelancers by Skill', 'Browse top freelancers organized by skill. 30+ categories, verified profiles, competitive rates.', '/hire')
      )} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Hire Freelancers', path: '/hire' }])
      )} />
      <script {...jsonLdScriptProps(buildItemListJsonLd(skillCategories))} />
      <HireClient />
    </>
  );
}
