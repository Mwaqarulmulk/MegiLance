import type { Metadata } from 'next';
import { buildMeta, getKeywordsForPage, buildComparisonArticleJsonLd, buildItemListJsonLd, buildBreadcrumbJsonLd, buildFAQJsonLd, jsonLdScriptProps, BASE_URL } from '../../../lib/seo';
import CompareIndexClient from './CompareIndexClient';

export const metadata: Metadata = buildMeta({
  title: 'MegiLance vs Upwork vs Fiverr | Best Freelance Platform Comparison 2026',
  description: 'Compare MegiLance vs Upwork vs Fiverr vs Freelancer.com. 0% promotional platform commission during launch, free AI productivity tools, and built-in milestone escrow protection.',
  path: '/compare',
  keywords: getKeywordsForPage(['informational', 'transactional'], [
    'upwork vs fiverr vs megilance', 'best freelance platform 2026',
    'freelance marketplace comparison', 'alternatives to upwork', 'alternatives to fiverr',
    'lower fees than upwork', 'better than fiverr', 'toptal alternative cheaper',
    'compare freelance platforms', 'megilance vs upwork',
  ]),
});

const COMPETITORS = [
  {
    slug: 'upwork',
    name: 'Upwork',
    desc: 'Compare commission structures, contract initiation fees, connects cost, and escrow payment protection.',
  },
  {
    slug: 'fiverr',
    name: 'Fiverr',
    desc: 'See how MegiLance compares for complex milestone projects vs Gig-based micro-services.',
  },
  {
    slug: 'toptal',
    name: 'Toptal',
    desc: 'Compare elite vetting mechanisms, platform deposits, and overall startup hiring costs.',
  },
  {
    slug: 'freelancer-com',
    name: 'Freelancer.com',
    desc: 'Analyze bid-boosting fees, spam control, and on-chain escrow payment safety.',
  },
];

const compareFAQs = [
  { question: 'Is MegiLance better than Upwork?', answer: 'MegiLance offers 0% commission fees vs Upwork\'s 10-20% freelancer commission plus 5% client fee. MegiLance includes free AI talent matching, milestone escrow, and a built-in workroom with no "Connects" system. For most projects, MegiLance saves freelancers and clients significant money.' },
  { question: 'How does MegiLance compare to Fiverr?', answer: 'Fiverr charges 20% commission on all freelancer earnings and a 5.5% service fee from buyers. MegiLance charges 0% platform commission during its 2026 launch. Unlike Fiverr\'s gig-based model, MegiLance supports custom milestone-based projects with full escrow protection.' },
  { question: 'What are the main alternatives to Upwork?', answer: 'The top Upwork alternatives include MegiLance (0% fees, AI matching), Toptal (elite vetting), Freelancer.com (competitive bidding), Guru, and PeoplePerHour. MegiLance is the only platform combining 0% commission with AI-powered talent matching and built-in project management.' },
  { question: 'Which freelance platform has the lowest fees?', answer: 'MegiLance has the lowest fees with 0% platform commission during 2026 launch. Compare: Upwork 10-20%, Fiverr 20%, Toptal 0% but very high markup on rates, Freelancer.com up to 10% + monthly fees.' },
];

export default function ComparePage() {
  const comparisonJsonLd = buildComparisonArticleJsonLd({
    headline: 'MegiLance vs Upwork vs Fiverr vs Freelancer.com: Best Freelance Platform Comparison 2026',
    description: 'Side-by-side comparison of major freelance platforms — fees, AI features, escrow, and talent quality.',
    datePublished: '2026-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    competitors: ['Upwork', 'Fiverr', 'Toptal', 'Freelancer.com'],
  });

  const competitorListJsonLd = buildItemListJsonLd(COMPETITORS.map((c, i) => ({
    name: `MegiLance vs ${c.name}`,
    url: `${BASE_URL}/compare/${c.slug}`,
    position: i + 1,
  })));

  return (
    <>
      <script {...jsonLdScriptProps(comparisonJsonLd)} />
      <script {...jsonLdScriptProps(competitorListJsonLd)} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Compare', path: '/compare' }])
      )} />
      <script {...jsonLdScriptProps(buildFAQJsonLd(compareFAQs))} />
      <CompareIndexClient competitors={COMPETITORS} />
    </>
  );
}
