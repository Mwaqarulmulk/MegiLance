import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Award, ArrowRight, Eye, Briefcase, FileCode, CheckCircle2 } from 'lucide-react';
import { buildMeta, getKeywordsForPage } from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Example of Work Portfolio for Freelancers | Winning Portfolios',
  description: 'Learn how to build a high-converting work portfolio. Browse example of work portfolio configurations for developers, designers, and writers to win high-paying jobs.',
  path: '/example-of-work-portfolio',
  keywords: getKeywordsForPage(['transactional', 'informational'], [
    'example of work portfolio', 'freelancer portfolio template',
    'developer work portfolio examples', 'how to write freelance portfolio', 'designer portfolio showcase'
  ]),
});

export default function ExampleOfWorkPortfolioPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 mb-4 dark:bg-indigo-950 dark:text-indigo-300">
          <Award size={13} />
          Freelancer Portfolios
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Example of Work Portfolio Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Struggling to win proposals? Discover how to design and build an example of work portfolio that highlights your core skills, builds trust, and wins contracts.
        </p>
      </header>

      {/* Guide Card */}
      <section className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-3xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Key Elements of a Winning Portfolio</h2>
        <p className="text-slate-650 dark:text-slate-400 mb-6 leading-relaxed">
          Clients scan portfolios in under 10 seconds. To stand out, your portfolio needs to show clear problem-solving skills, visual evidence of past projects, verified client reviews, and direct links to live code repositories or designs.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <FileCode className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Developer Portfolios</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Showcase clean code structures, GitHub repository stars, live project links, and system architecture diagrams.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Eye className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Designer Portfolios</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Display high-quality mockups, Figma prototype screens, interactive user flows, and before-and-after results.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Briefcase className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Case Study Structure</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Format every example: (1) The client problem, (2) Your technical solution, and (3) The measurable business outcome.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="text-indigo-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Verified Client Reviews</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Link your portfolio entries directly to verified reviews on MegiLance to instantly prove credibility.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-8 text-center text-white mb-12 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Optimize Your Profile Portfolio</h2>
        <p className="text-indigo-100 max-w-xl mx-auto mb-6">
          Ready to showcase your expertise? Create a profile on MegiLance, upload your work examples, and apply for high-value contracts.
        </p>
        <Link 
          href="/signup" 
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white text-indigo-700 hover:scale-[1.02] transition-transform"
        >
          Create Freelancer Profile <ArrowRight size={18} />
        </Link>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How many items should I include in my work portfolio?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              Quality beats quantity. Aim for 3 to 5 highly detailed case studies rather than dozens of minor snippets. Choose items that align with your target hourly rates.
            </p>
          </div>
          <div className="border-b border-slate-100 dark:border-slate-850 pb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I include NDAs in my work portfolio?</h3>
            <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
              If you signed an NDA, do not disclose the client's name or proprietary code. Instead, write a generalized case study (e.g., "SaaS Payments Optimization for Enterprise Client") and explain the architectural concepts.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
