// @AI-HINT: Website Development Cost Calculator & 2026 Pricing Guide.
// Targets Semrush-verified high-volume cluster: "how much does it cost to build a website" (4.0K Vol, $4.09 CPC).
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Globe, Calculator, Sparkles, ArrowRight, CheckCircle2, DollarSign, 
  Layers, ShieldCheck, Code, Server, Smartphone, ShoppingCart, Rocket 
} from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';

type WebsiteType = 'landing' | 'business' | 'ecommerce' | 'custom-saas';

interface WebsiteTier {
  name: string;
  desc: string;
  baseCostMin: number;
  baseCostMax: number;
  timelineWeeks: string;
  techStack: string[];
  costBreakdown: { item: string; cost: string }[];
}

const WEBSITE_TIERS: Record<WebsiteType, WebsiteTier> = {
  landing: {
    name: 'High-Converting Landing Page / One-Pager',
    desc: 'Single responsive page designed for product launches, lead generation, or event signups.',
    baseCostMin: 1500,
    baseCostMax: 3500,
    timelineWeeks: '1–2 Weeks',
    techStack: ['Next.js 16 / Tailwind CSS', 'Figma UX Prototype', 'Vercel / Cloudflare Hosting', 'Lead Form API'],
    costBreakdown: [
      { item: 'UI/UX Design & Copywriting in Figma', cost: '$500 – $1,200' },
      { item: 'Responsive Frontend Development', cost: '$800 – $1,800' },
      { item: 'Domain, SSL & Annual Hosting', cost: '$50 – $150/yr' },
      { item: 'Analytics & SEO Setup', cost: '$150 – $350' },
    ],
  },
  business: {
    name: 'Corporate / Small Business Website (5–10 Pages)',
    desc: 'Multi-page professional site with CMS blogging, contact booking, team directory, and case studies.',
    baseCostMin: 3500,
    baseCostMax: 7500,
    timelineWeeks: '3–5 Weeks',
    techStack: ['WordPress / Webflow / Next.js', 'Sanity / Strapi CMS', 'Interactive Components', 'Technical SEO'],
    costBreakdown: [
      { item: 'Brand Identity & Multi-Page UX Wireframes', cost: '$1,200 – $2,500' },
      { item: 'CMS Architecture & Component Coding', cost: '$2,000 – $4,200' },
      { item: 'Content Upload & On-Page SEO Optimization', cost: '$300 – $800' },
      { item: 'Business Hosting & Maintenance', cost: '$100 – $300/yr' },
    ],
  },
  ecommerce: {
    name: 'Full E-Commerce Store (50+ Products)',
    desc: 'Online storefront with catalog filtering, cart, multi-currency checkout, and order management.',
    baseCostMin: 5000,
    baseCostMax: 12000,
    timelineWeeks: '4–8 Weeks',
    techStack: ['Shopify Storefront / MedusaJS', 'Stripe / PayPal Gateway', 'Klaviyo Email Automation', 'Inventory Sync'],
    costBreakdown: [
      { item: 'Custom Storefront UI/UX & Mobile Flow', cost: '$1,800 – $3,500' },
      { item: 'Product Catalog & Payment Integration', cost: '$2,800 – $6,500' },
      { item: 'Abandoned Cart & Email Setup', cost: '$400 – $1,000' },
      { item: 'Payment Processing & Hosting', cost: 'Standard Stripe / App Fees' },
    ],
  },
  'custom-saas': {
    name: 'Custom Web Application / SaaS Platform',
    desc: 'Complex interactive web application with user authentication, database, REST/GraphQL APIs, and billing portal.',
    baseCostMin: 8000,
    baseCostMax: 22000,
    timelineWeeks: '6–12 Weeks',
    techStack: ['Next.js 16 + React 19', 'FastAPI / Python or Node.js', 'PostgreSQL Database', 'Stripe Subscriptions'],
    costBreakdown: [
      { item: 'System Architecture & Interactive Design System', cost: '$2,500 – $5,500' },
      { item: 'Backend APIs, Auth & Multi-Tenant DB', cost: '$3,500 – $9,000' },
      { item: 'Frontend Dashboard & Subscription Billing', cost: '$2,000 – $6,500' },
      { item: 'Security Audit & Automated CI/CD Testing', cost: '$1,000 – $2,500' },
    ],
  },
};

export default function WebsiteCostCalculatorPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showFreelancerNotice, setShowFreelancerNotice] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<WebsiteType>('business');
  const [hasCustomDesign, setHasCustomDesign] = useState<boolean>(true);
  const [hasEcommerce, setHasEcommerce] = useState<boolean>(false);
  const [hasAiChatbot, setHasAiChatbot] = useState<boolean>(false);

  const handlePostProject = () => {
    if (user?.role === 'freelancer') {
      setShowFreelancerNotice(true);
      return;
    }
    if (!user) {
      router.push(`/signup?role=client&redirect=${encodeURIComponent('/create-project')}`);
      return;
    }
    router.push('/create-project');
  };

  const tier = WEBSITE_TIERS[selectedType];

  let calculatedMin = tier.baseCostMin;
  let calculatedMax = tier.baseCostMax;

  if (hasCustomDesign && selectedType === 'landing') {
    calculatedMin += 300;
    calculatedMax += 600;
  }
  if (hasEcommerce && selectedType !== 'ecommerce') {
    calculatedMin += 1500;
    calculatedMax += 3000;
  }
  if (hasAiChatbot) {
    calculatedMin += 800;
    calculatedMax += 2000;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        'name': 'Website Development Cost Calculator (2026)',
        'url': 'https://megilance.site/tools/website-cost-calculator',
        'applicationCategory': 'BusinessApplication',
        'operatingSystem': 'All',
        'offers': {
          '@type': 'Offer',
          'price': '0.00',
          'priceCurrency': 'USD',
        },
        'description': 'Calculate how much it costs to build a website in 2026. Interactive pricing calculator for landing pages, business websites, ecommerce stores, and custom web applications.',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'How much does it cost to build a website in 2026?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Building a website in 2026 costs between $1,500 and $3,500 for a simple landing page, $3,500 to $7,500 for a multi-page business website, $5,000 to $12,000 for an e-commerce store, and $8,000 to $22,000+ for a custom SaaS web application.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How can I save money when building a website?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Hiring independent developers on MegiLance eliminates traditional agency markups (which often exceed 100%) and platform commissions (0% fee on MegiLance vs 10-20% on Upwork and Fiverr) while protecting your budget with pre-funded milestone escrow.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://megilance.site' },
          { '@type': 'ListItem', 'position': 2, 'name': 'AI Tools', 'item': 'https://megilance.site/tools' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Website Cost Calculator', 'item': 'https://megilance.site/tools/website-cost-calculator' },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          {/* Freelancer Role Alert Modal */}
          {showFreelancerNotice && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <strong className="block font-bold">Client Account Required</strong>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  You are currently signed in as a Freelancer. Creating and funding escrow projects requires a Client account.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/login?role=client"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
                >
                  Switch / Login as Client
                </Link>
                <button
                  onClick={() => setShowFreelancerNotice(false)}
                  className="px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Heading */}
          <header className="mb-10 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider mb-4 border border-emerald-200 dark:border-emerald-800">
              <Sparkles size={14} className="text-emerald-500" />
              <span>Interactive Pricing Engine (2026 Edition)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Website Development Cost Calculator
            </h1>
            <p className="text-base sm:text-lg text-slate-650 dark:text-slate-350 leading-relaxed">
              Calculate accurate software and website design costs with zero agency markups. MegiLance provides transparent market rates with 100% pre-funded milestone escrow.
            </p>
          </header>

          {/* Interactive Calculator Bento Box */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Type Selection */}
              <div className="md:col-span-6 space-y-6">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    1. Select Website Category
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {(Object.keys(WEBSITE_TIERS) as WebsiteType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedType(type)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          selectedType === type
                            ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold capitalize">{type.replace('-', ' ')}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                          From ${WEBSITE_TIERS[type].baseCostMin.toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    2. Optional Add-ons & Scope
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasCustomDesign}
                      onChange={(e) => setHasCustomDesign(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Bespoke Figma UI/UX Design System (+~$500)</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasAiChatbot}
                      onChange={(e) => setHasAiChatbot(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>AI Customer Support Chatbot / Tool Calling (+~$1,200)</span>
                  </label>
                </div>
              </div>

              {/* Live Result View */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white inline-block mb-3">
                      {tier.name}
                    </span>
                    <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight font-mono">
                      ${calculatedMin.toLocaleString()} – ${calculatedMax.toLocaleString()}
                    </div>
                    <p className="text-emerald-100 text-sm leading-relaxed mb-4">
                      Estimated delivery: <strong>{tier.timelineWeeks}</strong> with verified specialist talent.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-emerald-200 block mb-0.5">Agency Savings</span>
                      <strong className="text-white font-bold text-sm">Save 40–60% vs Agencies</strong>
                    </div>
                    <div>
                      <span className="text-emerald-200 block mb-0.5">Platform Fee</span>
                      <strong className="text-emerald-300 font-bold text-sm">$0.00 (0% Launch Fee)</strong>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handlePostProject}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white !text-white text-sm transition shadow-md cursor-pointer"
                  >
                    <Rocket size={16} />
                    <span className="text-white">Post Project with this Budget</span>
                  </button>
                  <Link
                    href="/tools/ai-startup-advisor"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-900 dark:text-white text-sm transition"
                  >
                    <span>Full Tech Blueprint</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Table */}
          <section className="bg-white dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Cost Breakdown for {tier.name}
            </h2>
            <p className="text-sm text-slate-650 dark:text-slate-400 mb-6">
              Realistic component breakdown based on vetted developer and designer rates:
            </p>
            <div className="space-y-3">
              {tier.costBreakdown.map((row) => (
                <div key={row.item} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    <span>{row.item}</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{row.cost}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-850">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions About Website Costs
            </h2>
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Why do website development prices vary so widely?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Prices depend on whether you use pre-made templates or custom engineering (Next.js/React), whether you need custom backend databases and APIs, and whether you hire through expensive traditional agencies or directly with vetted freelancers on MegiLance.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What ongoing costs should I expect after launch?
                </h3>
                <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                  Standard ongoing costs include domain registration ($10–$20/yr), cloud hosting ($5–$50/mo depending on traffic), and optional maintenance retainer hours for updates and security patches.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
