import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';
import Breadcrumbs from '@/app/components/molecules/Breadcrumbs/Breadcrumbs';
import { ShieldCheck, Lock, Eye, FileText, UserCheck, CheckCircle2, Mail } from 'lucide-react';

export const metadata: Metadata = buildMeta({
  title: 'Privacy Policy | MegiLance',
  description: 'MegiLance privacy policy - how we collect, use, and protect your personal data. GDPR compliant, transparent data practices.',
  path: '/privacy',
});

const SECTIONS = [
  {
    num: "01",
    title: "Information We Collect",
    icon: FileText,
    content: "We collect information you provide directly during onboarding and account management, including your legal name, verified email address, payment credentials, identity verification artifacts, and communication logs. We automatically collect technical telemetry (device type, IP address, performance logs) to maintain security and optimize real-time workrooms.",
  },
  {
    num: "02",
    title: "How We Use Your Information",
    icon: UserCheck,
    content: "Your data is used strictly to authenticate accounts, process escrow transactions, match freelancers with relevant projects via our 7-factor algorithm, facilitate collaborative workspace tools, and comply with international anti-money laundering (AML) and financial regulations.",
  },
  {
    num: "03",
    title: "Zero Selling of Personal Data",
    icon: Eye,
    content: "We do not sell, rent, or monetize your personal data or project source code. Data is only shared with verified service infrastructure providers (such as Stripe for payments and Turso/cloud databases) bound by strict non-disclosure and GDPR data processing agreements.",
  },
  {
    num: "04",
    title: "Bank-Grade Data Security",
    icon: Lock,
    content: "All sensitive payloads, authentication tokens, and payment workflows are protected using AES-256 and TLS 1.3 encryption in transit and at rest. Escrow release authorizations require verified session signatures.",
  },
  {
    num: "05",
    title: "Your Rights & Data Portability",
    icon: ShieldCheck,
    content: "Under GDPR and CCPA regulations, you have the absolute right to inspect, export, correct, or permanently delete your account data at any time. You can submit data portability or deletion requests directly from your dashboard or via our security team.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <Breadcrumbs />

        <header className="text-center space-y-4 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Lock size={13} className="text-blue-500" />
            <span>Privacy &amp; Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last updated: March 2026 · GDPR &amp; CCPA Compliant
          </p>
        </header>

        <div className="space-y-6">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.num}
                className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black font-mono px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
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
            );
          })}
        </div>

        <section className="p-6 sm:p-8 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Questions or Data Inquiries?</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Reach out directly to our Data Protection Officer at{' '}
            <a href="mailto:support@megilance.site" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              support@megilance.site
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
