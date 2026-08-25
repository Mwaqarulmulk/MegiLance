// @AI-HINT: Programmatic SEO pages targeting "how much does it cost to hire a [skill]"
// Low KD (8-16%), high commercial value ($12-$35 CPC).
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CostToHireClient, { SkillCostData } from './CostToHireClient';
import { 
  buildMeta, 
  buildServiceJsonLd, 
  buildBreadcrumbJsonLd, 
  buildFAQJsonLd, 
  jsonLdScriptProps, 
  BASE_URL,
  SITE_NAME
} from '@/lib/seo';

const SKILL_COST_DATABASE: Record<string, SkillCostData> = {
  'react-developer': {
    slug: 'react-developer',
    name: 'React Developer',
    category: 'Frontend & Web Development',
    avgHourlyRate: 75,
    ratesBySeniority: {
      junior: { min: 30, max: 45, desc: '1-3 years of experience building basic UI components, SPA routes, and state management.' },
      mid: { min: 55, max: 75, desc: '3-5 years of experience with Next.js, Redux/Zustand, performance optimization, and API integration.' },
      senior: { min: 85, max: 130, desc: '5+ years leading architecture, full-stack React Server Components, WebSockets, and enterprise systems.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$70 – $120/hr', annualSalary: '$115,000 – $165,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$80 – $130/hr', annualSalary: '$120,000 – $170,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$60 – $100/hr', annualSalary: '$90,000 – $140,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$65 – $105/hr', annualSalary: '$100,000 – $145,000/yr' },
      { country: 'Western Europe (Germany)', flag: '🇩🇪', hourlyRange: '$65 – $95/hr', annualSalary: '$95,000 – $135,000/yr' },
      { country: 'Eastern Europe (Poland/Ukraine)', flag: '🇪🇺', hourlyRange: '$40 – $65/hr', annualSalary: '$60,000 – $95,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$25 – $50/hr', annualSalary: '$40,000 – $75,000/yr' },
    ],
    projectEstimates: [
      { type: 'Landing Page / MVP Frontend', timeline: '2–3 weeks', budget: '$2,500 – $4,500', desc: 'Custom responsive design, Tailwind CSS, API endpoints connection, and interactive elements.' },
      { type: 'Full-Stack Web App / SaaS', timeline: '6–8 weeks', budget: '$6,000 – $14,000', desc: 'Next.js 16 frontend, authentication, database integration, Stripe billing, and dashboard UI.' },
      { type: 'Enterprise Platform Refactor', timeline: '10–16 weeks', budget: '$18,000 – $45,000+', desc: 'Micro-frontends, design system components, high-traffic caching, and automated testing suite.' },
    ],
    keySkills: ['React 19', 'Next.js 16', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL', 'REST APIs'],
    faqs: [
      {
        question: 'How much does it cost to hire a freelance React developer in 2026?',
        answer: 'On average, hiring a freelance React developer costs between $55 and $85 per hour globally, with junior developers starting around $30/hr and senior architects commanding $90 to $130+/hr.',
      },
      {
        question: 'Why hire React developers on MegiLance instead of Upwork?',
        answer: 'MegiLance charges 0% platform commission, allowing clients to save 5–10% on every project invoice while ensuring developers keep 100% of their earnings with pre-funded milestone escrow safety.',
      },
      {
        question: 'What factors affect the cost of hiring a React developer?',
        answer: 'Key pricing factors include developer seniority, project complexity, full-stack capabilities (Next.js, Node.js, FastAPI), and timezone requirements.',
      },
    ],
  },
  'python-developer': {
    slug: 'python-developer',
    name: 'Python Developer',
    category: 'Backend & AI Engineering',
    avgHourlyRate: 80,
    ratesBySeniority: {
      junior: { min: 35, max: 50, desc: '1-3 years with core Python, basic scripting, Flask/Django APIs, and database CRUD.' },
      mid: { min: 60, max: 85, desc: '3-5 years with FastAPI, async architecture, Celery worker queues, and PostgreSQL optimization.' },
      senior: { min: 90, max: 145, desc: '5+ years in distributed systems, AI/ML pipelines, vector embeddings, and cloud architecture.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$75 – $130/hr', annualSalary: '$125,000 – $180,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$85 – $140/hr', annualSalary: '$130,000 – $185,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$65 – $110/hr', annualSalary: '$95,000 – $150,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$70 – $115/hr', annualSalary: '$105,000 – $155,000/yr' },
      { country: 'Western Europe', flag: '🇩🇪', hourlyRange: '$70 – $105/hr', annualSalary: '$100,000 – $145,000/yr' },
      { country: 'Eastern Europe', flag: '🇪🇺', hourlyRange: '$45 – $70/hr', annualSalary: '$65,000 – $105,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$30 – $55/hr', annualSalary: '$45,000 – $80,000/yr' },
    ],
    projectEstimates: [
      { type: 'REST / GraphQL API Backend', timeline: '3–4 weeks', budget: '$3,500 – $6,000', desc: 'FastAPI / Django REST framework, authentication, database migrations, and Swagger documentation.' },
      { type: 'AI & Data Processing Pipeline', timeline: '5–7 weeks', budget: '$5,500 – $12,000', desc: 'LLM integration, RAG vector embeddings, automated data scraping, and analytics reporting.' },
      { type: 'Enterprise Distributed Microservices', timeline: '10–14 weeks', budget: '$16,000 – $38,000+', desc: 'Async worker architecture, Kafka / Redis queuing, automated Pytest CI/CD, and Dockerization.' },
    ],
    keySkills: ['Python 3.12', 'FastAPI', 'Django', 'PostgreSQL', 'LangChain', 'Docker', 'AWS'],
    faqs: [
      {
        question: 'How much does it cost to hire a Python developer?',
        answer: 'Hiring a freelance Python developer typically costs between $60 and $90 per hour globally, with specialized AI and machine learning engineers ranging from $95 to $145+/hr.',
      },
      {
        question: 'What is the difference between junior and senior Python developer rates?',
        answer: 'Junior Python developers charge $35–$50/hr for scripting and basic endpoints, while Senior Python developers charge $90–$145/hr for scalable backend architecture, concurrency, and AI pipelines.',
      },
    ],
  },
  'fullstack-developer': {
    slug: 'fullstack-developer',
    name: 'Full-Stack Developer',
    category: 'Full-Stack Software Engineering',
    avgHourlyRate: 85,
    ratesBySeniority: {
      junior: { min: 35, max: 55, desc: '1-3 years building frontend interfaces and connecting relational databases and APIs.' },
      mid: { min: 65, max: 90, desc: '3-5 years building end-to-end web apps with Next.js, Node.js/Python, and cloud deployments.' },
      senior: { min: 95, max: 150, desc: '5+ years architecting multi-tenant SaaS, high-throughput microservices, and database scaling.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$80 – $140/hr', annualSalary: '$130,000 – $190,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$90 – $150/hr', annualSalary: '$135,000 – $195,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$70 – $115/hr', annualSalary: '$100,000 – $160,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$75 – $120/hr', annualSalary: '$110,000 – $165,000/yr' },
      { country: 'Western Europe', flag: '🇩🇪', hourlyRange: '$75 – $110/hr', annualSalary: '$105,000 – $155,000/yr' },
      { country: 'Eastern Europe', flag: '🇪🇺', hourlyRange: '$50 – $75/hr', annualSalary: '$75,000 – $115,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$35 – $60/hr', annualSalary: '$50,000 – $90,000/yr' },
    ],
    projectEstimates: [
      { type: 'MVP Product Prototype', timeline: '4–6 weeks', budget: '$4,500 – $8,500', desc: 'Complete frontend + backend + database + Stripe checkout prototype ready for beta users.' },
      { type: 'Custom SaaS Platform', timeline: '8–10 weeks', budget: '$8,000 – $18,000', desc: 'Multi-tenant architecture, user permissions, automated billing, and real-time dashboard.' },
      { type: 'Enterprise Marketplace / Web App', timeline: '12–16 weeks', budget: '$20,000 – $50,000+', desc: 'High-availability infrastructure, split escrow payments, chat, and monitoring.' },
    ],
    keySkills: ['Next.js', 'React', 'Node.js', 'Python', 'PostgreSQL', 'Stripe', 'Docker', 'AWS'],
    faqs: [
      {
        question: 'How much does it cost to hire a full stack developer in 2026?',
        answer: 'Hiring a full-stack developer averages $65 to $95 per hour for mid-level engineers and $95 to $150/hr for senior software architects.',
      },
      {
        question: 'Is it cheaper to hire one full-stack developer or separate frontend/backend developers?',
        answer: 'For early-stage startups and MVPs, hiring one senior full-stack developer saves 30–40% in communication overhead and development costs compared to managing separate teams.',
      },
    ],
  },
  'ui-ux-designer': {
    slug: 'ui-ux-designer',
    name: 'UI/UX Designer',
    category: 'Product & Visual Design',
    avgHourlyRate: 65,
    ratesBySeniority: {
      junior: { min: 25, max: 40, desc: '1-3 years with wireframing, simple Figma UI mockups, and mobile screen designs.' },
      mid: { min: 45, max: 70, desc: '3-5 years with complete design systems, responsive component tokens, and user research.' },
      senior: { min: 75, max: 120, desc: '5+ years leading UX strategy, conversion optimization, interaction design, and team design ops.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$65 – $115/hr', annualSalary: '$105,000 – $155,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$75 – $125/hr', annualSalary: '$110,000 – $160,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$55 – $95/hr', annualSalary: '$85,000 – $135,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$60 – $100/hr', annualSalary: '$90,000 – $140,000/yr' },
      { country: 'Western Europe', flag: '🇩🇪', hourlyRange: '$60 – $90/hr', annualSalary: '$90,000 – $130,000/yr' },
      { country: 'Eastern Europe', flag: '🇪🇺', hourlyRange: '$35 – $55/hr', annualSalary: '$55,000 – $85,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$25 – $45/hr', annualSalary: '$35,000 – $65,000/yr' },
    ],
    projectEstimates: [
      { type: 'Landing Page & Brand UI Kit', timeline: '1–2 weeks', budget: '$1,500 – $3,000', desc: 'High-converting responsive landing page design, color palette, and typography tokens in Figma.' },
      { type: 'Complete Mobile App Design (20+ Screens)', timeline: '3–5 weeks', budget: '$3,500 – $7,500', desc: 'iOS & Android design system, interactive prototypes, micro-interactions, and developer specs.' },
      { type: 'Enterprise SaaS Design System', timeline: '6–10 weeks', budget: '$8,000 – $20,000+', desc: 'Complex dashboard UX, design tokens, accessibility (WCAG AA), and component guidelines.' },
    ],
    keySkills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Design Tokens', 'Accessibility'],
    faqs: [
      {
        question: 'How much does it cost to hire a UI/UX designer?',
        answer: 'UI/UX designers typically charge $45 to $75 per hour for mid-level specialists and $75 to $120+/hr for senior product design leads.',
      },
    ],
  },
  'ai-developers': {
    slug: 'ai-developers',
    name: 'AI Developer & Engineer',
    category: 'Artificial Intelligence & Machine Learning',
    avgHourlyRate: 95,
    ratesBySeniority: {
      junior: { min: 45, max: 65, desc: '1-3 years with OpenAI API, basic prompt engineering, and Python data preprocessing.' },
      mid: { min: 75, max: 110, desc: '3-5 years with RAG vector databases, LangChain, fine-tuning open-weights models (Llama 3), and FastAPI.' },
      senior: { min: 120, max: 180, desc: '5+ years designing autonomous multi-agent pipelines, custom model training, and low-latency inference.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$90 – $160/hr', annualSalary: '$145,000 – $220,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$95 – $165/hr', annualSalary: '$150,000 – $225,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$80 – $135/hr', annualSalary: '$120,000 – $180,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$85 – $140/hr', annualSalary: '$125,000 – $185,000/yr' },
      { country: 'Western Europe', flag: '🇩🇪', hourlyRange: '$80 – $130/hr', annualSalary: '$120,000 – $175,000/yr' },
      { country: 'Eastern Europe', flag: '🇪🇺', hourlyRange: '$55 – $90/hr', annualSalary: '$85,000 – $135,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$40 – $70/hr', annualSalary: '$60,000 – $105,000/yr' },
    ],
    projectEstimates: [
      { type: 'Custom AI Chatbot / Workflow Assistant', timeline: '2–3 weeks', budget: '$3,000 – $6,000', desc: 'RAG knowledge base integration, OpenAI/Claude API, streaming chat UI, and tool-calling.' },
      { type: 'Autonomous Agent & Vector Pipeline', timeline: '4–7 weeks', budget: '$7,000 – $16,000', desc: 'Multi-agent orchestration, Pinecone/Qdrant vector index, structured JSON extraction, and backend.' },
      { type: 'Proprietary Fine-Tuned Model Deployment', timeline: '8–12 weeks', budget: '$18,000 – $45,000+', desc: 'Domain data curation, LoRA fine-tuning, automated evaluation benchmarks, and scalable inference API.' },
    ],
    keySkills: ['Python', 'LangChain', 'OpenAI API', 'PyTorch', 'Vector Databases (Pinecone/Qdrant)', 'RAG Pipelines', 'FastAPI'],
    faqs: [
      {
        question: 'How much does it cost to hire an AI developer in 2026?',
        answer: 'Hiring an AI developer ranges from $75 to $110 per hour for mid-level engineers and $120 to $180+/hr for specialized machine learning architects.',
      },
    ],
  },
  'mobile-developer': {
    slug: 'mobile-developer',
    name: 'Mobile App Developer',
    category: 'Mobile Applications (iOS & Android)',
    avgHourlyRate: 85,
    ratesBySeniority: {
      junior: { min: 35, max: 50, desc: '1-3 years building mobile screen flows in Flutter or React Native.' },
      mid: { min: 60, max: 85, desc: '3-5 years with native device APIs, state management, push notifications, and offline sync.' },
      senior: { min: 90, max: 140, desc: '5+ years leading high-performance iOS/Android architecture and App Store release pipelines.' },
    },
    ratesByRegion: [
      { country: 'United States', flag: '🇺🇸', hourlyRange: '$75 – $130/hr', annualSalary: '$120,000 – $175,000/yr' },
      { country: 'Australia', flag: '🇦🇺', hourlyRange: '$85 – $140/hr', annualSalary: '$125,000 – $180,000/yr' },
      { country: 'United Kingdom', flag: '🇬🇧', hourlyRange: '$65 – $110/hr', annualSalary: '$95,000 – $150,000/yr' },
      { country: 'Canada', flag: '🇨🇦', hourlyRange: '$70 – $115/hr', annualSalary: '$105,000 – $155,000/yr' },
      { country: 'Western Europe', flag: '🇩🇪', hourlyRange: '$70 – $105/hr', annualSalary: '$100,000 – $145,000/yr' },
      { country: 'Eastern Europe', flag: '🇪🇺', hourlyRange: '$45 – $70/hr', annualSalary: '$65,000 – $105,000/yr' },
      { country: 'Asia & Latin America', flag: '🌏', hourlyRange: '$30 – $55/hr', annualSalary: '$45,000 – $80,000/yr' },
    ],
    projectEstimates: [
      { type: 'Cross-Platform MVP App', timeline: '4–6 weeks', budget: '$4,500 – $9,000', desc: 'Flutter/React Native app with auth, core user flows, backend connection, and in-app purchases.' },
      { type: 'Full-Featured Mobile Product', timeline: '8–12 weeks', budget: '$10,000 – $22,000', desc: 'Real-time messaging, map geolocation, push notifications, social login, and App Store submission.' },
      { type: 'Enterprise Scale Mobile System', timeline: '14–20 weeks', budget: '$25,000 – $55,000+', desc: 'High-security biometric auth, offline-first sync, automated UI testing, and CI/CD distribution.' },
    ],
    keySkills: ['Flutter', 'React Native', 'Swift (iOS)', 'Kotlin (Android)', 'Firebase', 'State Management', 'REST/GraphQL'],
    faqs: [
      {
        question: 'How much does it cost to hire a mobile app developer?',
        answer: 'Freelance mobile developers charge $60 to $85 per hour on average, with full cross-platform MVP builds typically costing between $4,500 and $9,000.',
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(SKILL_COST_DATABASE).map((slug) => ({ skill: slug }));
}

interface Props {
  params: Promise<{ skill: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skill } = await params;
  const data = SKILL_COST_DATABASE[skill];

  if (!data) {
    return buildMeta({
      title: 'Cost to Hire Freelance Developers | MegiLance',
      description: 'Find out how much it costs to hire developers, designers, and AI specialists.',
      path: '/cost-to-hire',
    });
  }

  return buildMeta({
    title: `How Much Does It Cost to Hire a ${data.name}? (2026 Rates & Salary Guide)`,
    description: `Complete guide on how much it costs to hire a ${data.name} in 2026. Explore average hourly rates ($${data.ratesBySeniority.junior.min}–$${data.ratesBySeniority.senior.max}/hr), global country rates, and project budgets.`,
    path: `/cost-to-hire/${data.slug}`,
    keywords: [
      `how much does it cost to hire a ${data.name.toLowerCase()}`,
      `${data.name.toLowerCase()} hourly rate`,
      `cost to hire ${data.name.toLowerCase()}`,
      `${data.name.toLowerCase()} salary guide 2026`,
      `hire ${data.name.toLowerCase()} cost`,
      `freelance ${data.name.toLowerCase()} rates`,
    ],
  });
}

export default async function CostToHirePage({ params }: Props) {
  const { skill } = await params;
  const data = SKILL_COST_DATABASE[skill];

  if (!data) {
    notFound();
  }

  const jsonLd = [
    buildServiceJsonLd(
      `How Much Does It Cost to Hire a ${data.name}?`,
      `Comprehensive 2026 rate and salary guide for hiring ${data.name}s. Compare junior, mid-level, and senior hourly rates across US, UK, Canada, Australia, and Europe.`,
      `/cost-to-hire/${data.slug}`
    ),
    buildFAQJsonLd(data.faqs),
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Cost to Hire', path: '/cost-calculator' },
      { name: data.name, path: `/cost-to-hire/${data.slug}` },
    ]),
  ];

  return (
    <>
      <script {...jsonLdScriptProps(...jsonLd)} />
      <CostToHireClient data={data} />
    </>
  );
}
