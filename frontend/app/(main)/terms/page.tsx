import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { Scale, ShieldCheck, CheckCircle2, DollarSign, FileCode, Users, AlertCircle } from 'lucide-react';

export const metadata: Metadata = buildMeta({
  title: 'Terms of Service | MegiLance',
  description: 'MegiLance terms of service - the rules and guidelines for using our AI-powered freelancing platform.',
  path: '/terms',
});

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "Acceptance & Eligibility",
    content: "By creating an account, browsing talent, posting opportunities, or using any MegiLance AI scoping tools, you agree to comply with these Terms of Service. You must be at least 18 years of age and legally authorized to enter binding contracts in your jurisdiction.",
  },
  {
    num: "02",
    title: "0% Commission Platform Scope",
    content: "MegiLance connects clients with independent specialists and provides AI scoping, real-time workrooms, and milestone escrow management. During promotional launch periods, 0% platform commission applies to eligible completed projects.",
  },
  {
    num: "03",
    title: "Code-Enforced Milestone Escrow",
    content: "All fixed-price contracts operate under pre-funded milestone escrow. Clients deposit funds prior to sprint inception. Funds are released exclusively upon client inspection and approval or formal dispute mediation resolution.",
  },
  {
    num: "04",
    title: "Full Intellectual Property (IP) Transfer",
    content: "Upon complete payment release from milestone escrow, all copyrights, source code ownership, design assets, and intellectual property transfer automatically and unconditionally from the freelancer to the client, unless explicitly agreed otherwise.",
  },
  {
    num: "05",
    title: "Platform Conduct & Anti-Fraud",
    content: "Users must not engage in off-platform payment circumvention, artificial review manipulation, malicious code delivery, or deceptive identity representation. Violations result in immediate account suspension and escrow freeze.",
  },
  {
    num: "06",
    title: "Fair Dispute Resolution",
    content: "In the event of milestone delivery disputes, our compliance team reviews time-stamped workroom delivery logs, agreed milestone requirements, and commits to deliver an impartial binding determination.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <Breadcrumbs />

        <header className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Scale size={13} className="text-indigo-500" />
            <span>Platform Agreement &amp; Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: March 2026 · Legally Binding Escrow Protocol
          </p>
        </header>

        <div className="space-y-6">
          {TERMS_SECTIONS.map((sec) => (
            <section
              key={sec.num}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                  {sec.num}
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {sec.title}
                </h2>
              </div>
              <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed pl-1">
                {sec.content}
              </p>
            </section>
          ))}
        </div>

        <section className="p-6 sm:p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-center space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Contract &amp; Legal Support</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Have questions regarding enterprise agreements or milestone disputes? Contact{' '}
            <a href="mailto:support@megilance.site" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              support@megilance.site
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
