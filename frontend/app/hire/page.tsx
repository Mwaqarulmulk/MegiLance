// @AI-HINT: Skills directory page listing all available skills for hiring
// Parent page for /hire/[skill]/[industry] programmatic SEO pages

import type { Metadata } from 'next';
import { buildMeta, buildCollectionPageJsonLd, buildBreadcrumbJsonLd, buildItemListJsonLd, buildHowToJsonLd, buildFAQJsonLd, jsonLdScriptProps, BASE_URL, getKeywordsForPage } from '@/lib/seo';
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
  const howToJsonLd = buildHowToJsonLd(
    'How to Hire a Freelancer Online',
    'A step-by-step guide for businesses to hire qualified freelancers on MegiLance with 0% platform fees and AI-powered matching.',
    [
      { name: 'Browse Skill Categories', text: 'Choose from 40+ skill categories including web development, design, AI/ML, writing, and marketing. Each category has vetted freelancer profiles ready to hire.' },
      { name: 'Post Your Project for Free', text: 'Describe your project requirements, set your budget range, and upload any reference materials. Posting is 100% free with no listing fees.' },
      { name: 'Review AI-Matched Proposals', text: 'Receive proposals from qualified freelancers matched by our AI engine. Review portfolios, ratings, and hourly rates to find the best fit.' },
      { name: 'Set Milestones & Fund Escrow', text: 'Agree on project milestones with your chosen freelancer. Fund the escrow securely — your payment is held until each milestone is completed and approved.' },
      { name: 'Approve Work & Release Payment', text: 'Review deliverables for each milestone. Approve to release payment automatically from escrow to the freelancer.' },
    ]
  );

  const hireFAQs = [
    { question: 'How do I hire a freelancer online?', answer: 'Post your project for free on MegiLance, receive proposals from AI-matched freelancers, review their profiles and portfolios, then hire the best fit using milestone-based escrow payments.' },
    { question: 'What is the best website to hire freelancers?', answer: 'MegiLance is among the best freelancer websites offering 0% platform commission (vs Upwork 10-20%), AI-powered matching, milestone escrow, and 40+ skill categories. It is 100% free to post projects.' },
    { question: 'How much does it cost to hire a freelancer?', answer: 'On MegiLance, posting projects is free and we charge 0% platform commission. You only pay the agreed project rate plus standard payment processing fees. Freelancer hourly rates range from $15/hr to $150+/hr depending on skill and experience.' },
    { question: 'How do I hire a web developer?', answer: 'Browse MegiLance\'s web developer directory at /hire/react-developer or /hire/nodejs-developer. Post your project, review proposals with portfolio links, and hire via milestone escrow. Average web developer rate is $50-90/hr.' },
  ];

  return (
    <>
      <script {...jsonLdScriptProps(
        buildCollectionPageJsonLd('Hire Freelancers by Skill', 'Browse top freelancers organized by skill. 30+ categories, verified profiles, competitive rates.', '/hire')
      )} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Hire Freelancers', path: '/hire' }])
      )} />
      <script {...jsonLdScriptProps(buildItemListJsonLd(skillCategories))} />
      <script {...jsonLdScriptProps(howToJsonLd)} />
      <script {...jsonLdScriptProps(buildFAQJsonLd(hireFAQs))} />
      <HireClient />
    </>
  );
}
