import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowRight, Award, Zap, Shield, CheckCircle2, DollarSign, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { 
  buildMeta, 
  getKeywordsForPage, 
  buildFAQJsonLd, 
  buildBreadcrumbsJsonLd, 
  jsonLdScriptProps, 
  BASE_URL 
} from '@/lib/seo';

const FREELANCING_WEBSITES_FAQS = [
  {
    question: 'What makes MegiLance one of the best freelancing websites in 2026?',
    answer: 'MegiLance combines 0% platform commission fees with machine-learning talent matching, pre-funded milestone escrow protection, and a suite of 14 free AI productivity tools (contract builders, invoice generators, and fee calculators).',
  },
  {
    question: 'How does MegiLance compare to Upwork and Fiverr?',
    answer: 'While Upwork charges 10% freelancer fees plus 5% client fees and Fiverr deducts 20% from sellers and 5.5% from buyers, MegiLance operates with 0% platform commission during our 2026 launch and offers 100% free job bids without paid connects.',
  },
  {
    question: 'How do I migrate my freelance clients to MegiLance?',
    answer: 'You can sign up in under 60 seconds, create a custom contract using our free Contract Builder with milestone escrow terms, and invite your clients to transact with zero commission deductions.',
  },
];

export const metadata: Metadata = buildMeta({
  title: 'Best Freelancing Websites & Top Freelance Platforms in 2026 | MegiLance',
  description: 'Compare the best freelancing websites, top 10 freelance platforms, and freelance job sites. See how MegiLance eliminates 10–20% commission fees with milestone escrow.',
  path: '/freelancing-websites',
  keywords: getKeywordsForPage(['transactional', 'informational', 'longTail'], [
    'freelancing websites', 'freelancing sites', 'best freelance websites',
    'top 10 freelance platforms', 'best freelance platform', 'freelance marketplaces',
    'best websites for freelancers', 'sites like upwork and fiverr'
  ]),
});

export default function FreelancingWebsitesPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Best Freelancing Websites & Top Freelance Platforms in 2026',
      description: 'Comprehensive review and comparison of top freelancing sites and platforms with 0% commission alternatives.',
      url: `${BASE_URL}/freelancing-websites`,
    },
    buildFAQJsonLd(FREELANCING_WEBSITES_FAQS),
    buildBreadcrumbsJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Freelancing Websites', path: '/freelancing-websites' },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 mb-4 dark:bg-blue-950 dark:text-blue-300">
            <Layers size={13} />
            Marketplace Industry Review &amp; Rankings (2026)
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Best Freelancing Websites &amp; Top Platforms
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Compare the top freelancing websites and platforms. Discover how MegiLance eliminates traditional 10–20% commission cuts with milestone escrow vaults.
          </p>
        </header>

        {/* Top 4 Platforms Comparison Grid */}
        <section className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            {
              name: '1. MegiLance (Overall Best for 2026)',
              fee: '0% Commission Fee',
              desc: 'AI talent matching, automated milestone escrow, 14 free AI tools, and zero paid bid connects.',
              badge: 'Editor\'s Choice',
              badgeColor: 'bg-emerald-500 text-white',
            },
            {
              name: '2. Upwork (High Volume / High Fees)',
              fee: '10% Freelancer + 5% Client',
              desc: 'Large project catalog, but requires paid Connects ($0.15 each) to apply and charges a 5% client surcharge.',
              badge: 'Legacy Marketplace',
              badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            },
            {
              name: '3. Fiverr (Micro-Services / High Deductions)',
              fee: '20% Seller + 5.5% Buyer',
              desc: 'Good for fixed packaged gigs, but takes 20% of all gross seller revenue including client tips.',
              badge: 'Gig Catalog',
              badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            },
            {
              name: '4. Toptal (Elite Enterprise / High Markup)',
              fee: 'Hidden 100%+ Agency Markup',
              desc: 'Top 3% developer network, but bills clients premium hourly rates ($150–$250/hr) with high deposits.',
              badge: 'Agency Model',
              badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            },
          ].map((platform) => (
            <div key={platform.name} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{platform.name}</h3>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${platform.badgeColor}`}>{platform.badge}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{platform.fee}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{platform.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Comparison Overview */}
        <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How MegiLance Redefines the Freelance Economy</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Most freelancing websites tax independent contractors by extracting 10% to 20% of every payment, while charging clients handling fees. MegiLance introduces a zero-commission model, secure escrow deposits, and verified profiles to maximize success.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex gap-3">
              <Award className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">0% Commission Model</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Freelancers keep 100% of their billings, while clients enjoy fee-free project postings.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Zap className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">AI Smart Match Engine</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avoid spam proposals. Our AI system matches clients directly to verified specialists instantly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Secure Milestone Escrows</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pre-funded escrow vaults protect both parties. Release funds only after successfully reviewing deliverables.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">14 Free AI Tools</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Built-in AI invoice generators, legal contract builders, and fee calculators streamline your business operations.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Link Callout */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Compare Top Freelance Marketplaces</h2>
          <p className="text-blue-100 max-w-xl mx-auto mb-6">
            See how MegiLance stacks up against Upwork, Fiverr, Toptal, and Freelancer.com side by side.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/compare" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-blue-700 hover:scale-[1.02] transition-transform shadow-md"
            >
              <span>View Comparison Matrix</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              href="/tools/upwork-fee-calculator" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-white/40 text-white hover:bg-white/10 transition-colors"
            >
              <span>Calculate Fee Savings</span>
            </Link>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {FREELANCING_WEBSITES_FAQS.map((faq) => (
              <div key={faq.question} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
