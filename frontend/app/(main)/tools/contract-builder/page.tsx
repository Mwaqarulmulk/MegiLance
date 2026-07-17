// @AI-HINT: Public standalone tool page for Contract Builder - SEO optimized
import React from 'react';
import type { Metadata } from 'next';
import ContractBuilder from '@/app/components/ContractBuilder/ContractBuilder';
import { 
  buildMeta, 
  buildAIToolJsonLd, 
  jsonLdScriptProps, 
  getKeywordsForPage 
} from '@/lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Free AI Freelance Contract Builder | Legal Agreement Maker',
  description: 'Generate legally-sound freelance contracts, NDAs, and service agreements instantly with customizable legal clauses and jurisdiction support.',
  path: '/tools/contract-builder',
  keywords: getKeywordsForPage(['longTail', 'features'], [
    'freelance contract builder', 'generate freelance contract',
    'AI legal contract creator', 'freelance NDA template', 'freelancer service agreement'
  ]),
});

export default function ContractBuilderPage() {
  const jsonLd = buildAIToolJsonLd(
    "AI Freelance Contract Builder",
    "Generate legally-sound freelance contracts, NDAs, and service agreements instantly with customizable legal clauses and jurisdiction support.",
    "/tools/contract-builder",
    "4.9",
    "160"
  );

  return (
    <>
      <script {...jsonLdScriptProps(jsonLd)} />
      <main className="py-20 flex-grow bg-slate-50 dark:bg-slate-900">
        <ContractBuilder />
      </main>
    </>
  );
}