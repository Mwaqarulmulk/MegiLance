import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Palette, ArrowRight, Monitor, Eye, Zap, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Hire Freelance Web Designers | Website Design Freelancer — MegiLance',
  description: 'Hire top freelance web designers and website design freelancers. Get bespoke UI/UX layouts, mobile-responsive custom websites, and creative designs with zero client fees.',
  path: '/designer-web-freelance',
  keywords: getKeywordsForPage(['transactional', 'longTail'], [
    'designer web freelance', 'website design freelancer', 'hire web designer',
    'hire graphic designer', 'hire UI UX designer', 'freelance website designer'
  ]),
});

export default function DesignerWebFreelancePage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 mb-4 dark:bg-violet-950 dark:text-violet-300">
          <Palette size={13} />
          Design Talent Hub
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Hire Top Freelance Web Designers
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Connect with vetted website design freelancers. Build premium interfaces, beautiful landing pages, and interactive prototypes tailored to your brand goals.
        </p>
      </header>

      {/* Benefits Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Hire Designers on MegiLance?</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          A successful website begins with top-tier user experience. MegiLance helps you hire designers with verified credentials, interactive portfolios, and client review verification. Plus, clients pay 0% fees, keeping your design budget optimized.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <Monitor className="text-violet-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Responsive UI/UX Web Design</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Hire experts in Figma, Adobe XD, and Sketch to design layouts that render beautifully across all screen sizes.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Eye className="text-violet-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Visual Portfolios</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Review live case studies, high-resolution screens, and prototype videos directly on verified profiles.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Zap className="text-violet-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Smart AI Matching</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Input your project requirements and receive a ranked list of designers matching your exact aesthetic and budget.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-violet-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Milestone Escrow Payments</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Review wireframes, mockups, and final exports before releasing payments through secure escrow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-violet-600 to-fuchsia-650 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Vetted Web Designers Today</h2>
        <p className="text-violet-100 max-w-xl mx-auto mb-6">
          Post your project specifications for free and get matched with top creative designers within minutes.
        </p>
        <Link 
          href="/client/find-talent" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-violet-650 hover:scale-[1.02] transition-transform"
        >
          Hire Top Designers <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How much does it cost to hire a freelance web designer?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Rates vary from $25/hr for junior designers to $100+/hr for senior UI/UX architects. You can use our cost estimator tool to calculate a precise project budget.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Do designers write code?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Typically, web designers focus on layouts, UI elements, and prototypes, while developers translate designs into code. However, you can hire "no-code" designers or full-stack design-developers on MegiLance.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
