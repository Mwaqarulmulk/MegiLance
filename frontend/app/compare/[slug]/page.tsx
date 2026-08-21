// @AI-HINT: Dynamic comparison pages — MegiLance vs Upwork, Fiverr, Toptal, Freelancer.com
// Targets high-value "alternative" keywords: "upwork alternative", "fiverr alternative" etc.
import type { Metadata } from 'next';
import CompareClient from './CompareClient';
import {
  buildMeta,
  buildBreadcrumbJsonLd,
  buildFAQJsonLd,
  jsonLdScriptProps,
  BASE_URL,
  SITE_NAME,
} from '@/lib/seo';

type CompetitorData = {
  slug: string;
  name: string;
  title: string;
  description: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
  comparison: { feature: string; us: string; them: string }[];
  whySwitch: string[];
};

const competitors: Record<string, CompetitorData> = {
  upwork: {
    slug: 'upwork',
    name: 'Upwork',
    title: `${SITE_NAME} vs Upwork - Better Freelance Marketplace Alternative (2026)`,
    description: `Compare ${SITE_NAME} vs Upwork. Lower fees, AI-powered matching, faster hiring, and secure blockchain payments. See why businesses are switching from Upwork to ${SITE_NAME}.`,
    keywords: [
      'upwork alternative', 'upwork alternatives', 'free upwork alternative',
      'better than upwork', 'upwork vs megilance', 'sites similar to upwork',
      'sites like upwork', 'upwork competitor', 'cheaper than upwork',
      'upwork replacement', 'upwork fees too high', 'freelance marketplace alternative',
      'hire freelancers lower fees', 'best upwork alternatives in 2026',
      'alternatives to upwork for hiring freelancers', 'upwork alternative for businesses',
    ],
    faqs: [
      { question: `Is there something better than Upwork for hiring in 2026?`, answer: `Yes. MegiLance provides 0% platform commission during our promotional launch, 15 free AI productivity tools, and automated milestone escrow. Clients avoid Upwork's 5% client surcharge and freelancers avoid the 10% cut.` },
      { question: `Is ${SITE_NAME} better than Upwork?`, answer: `${SITE_NAME} offers 7-factor AI matching, 15 free client-side AI tools (Price Estimator, Proposal Writer, Scope Planner, Contract Builder), 0% promotional platform fees, and milestone-based escrow payments.` },
      { question: `How much cheaper is ${SITE_NAME} compared to Upwork?`, answer: `Upwork charges clients 5% payment fees plus freelancers pay 10% service fees. ${SITE_NAME} offers 0% platform fee during our promotional launch period, allowing freelancers to keep 100% of their earnings.` },
      { question: 'Can I migrate my Upwork team to MegiLance?', answer: 'Yes! You can invite your existing collaborators to MegiLance and benefit from our 0% launch platform fee structure.' },
      { question: 'Does MegiLance have the same quality of freelancers?', answer: 'MegiLance freelancers undergo identity and portfolio verification. Our AI matching analyzes technical skills, past work, and availability.' },
    ],
    comparison: [
      { feature: 'Client Platform Fee', us: '0% (Launch Promotion)', them: '3-5%' },
      { feature: 'Freelancer Platform Fee', us: '0% (Launch Promotion)', them: '10%' },
      { feature: 'Free AI Estimation Tools', us: '✓ Free (No signup needed)', them: '✗' },
      { feature: 'AI-Powered Matching', us: '✓ 7-Factor Engine', them: 'Manual search' },
      { feature: 'Cost to Post Project', us: 'Free', them: 'Free to $49' },
      { feature: 'Milestone Escrow', us: '✓ Included', them: '✓ With fees' },
      { feature: 'Dispute Mediation', us: '✓ Included', them: '✓' },
    ],
    whySwitch: [
      '0% platform fees during our launch period',
      'Free AI tools for project pricing, scoping, and proposal generation',
      '7-factor AI talent matching based on verified skills',
      'Secure milestone-based escrow payments',
      'Direct workroom collaboration and chat',
    ],
  },
  fiverr: {
    slug: 'fiverr',
    name: 'Fiverr',
    title: `${SITE_NAME} vs Fiverr - Professional Freelance Alternative (2026)`,
    description: `Compare ${SITE_NAME} vs Fiverr. Custom milestone-based projects, free AI scoping tools, 0% launch platform fees, and verified professionals.`,
    keywords: [
      'fiverr alternative', 'better than fiverr', 'fiverr vs megilance',
      'sites like fiverr', 'apps like fiverr', 'fiverr similar sites',
      'fiverr type sites', 'places like fiverr', 'fiverr competitor',
      'professional freelance platform', 'fiverr replacement 2026',
    ],
    faqs: [
      { question: 'How is MegiLance different from Fiverr?', answer: 'While Fiverr focuses on pre-made gig packages, MegiLance lets you post custom milestone projects, use free AI planning tools, and receive AI-matched proposals from qualified freelancers.' },
      { question: 'Are MegiLance freelancers more professional than Fiverr?', answer: 'MegiLance freelancers go through portfolio indexing and skill verification. Our AI matching considers expertise, project requirements, and past performance.' },
      { question: 'Is MegiLance cheaper than Fiverr?', answer: 'Yes. Fiverr charges up to 5.5% buyer fees plus a 20% freelancer commission. MegiLance currently offers a 0% platform fee during our launch promotional period (standard payment processor fees apply).' },
      { question: 'Can I get custom work on MegiLance like on Fiverr?', answer: 'Yes. MegiLance supports custom projects with structured milestone escrow. You describe what you need, and matched freelancers submit tailored proposals.' },
    ],
    comparison: [
      { feature: 'Project Type', us: 'Custom Milestones + Fixed', them: 'Pre-made Gigs only' },
      { feature: 'Client Platform Fee', us: '0% (Launch Promotion)', them: '5.5% + order fees' },
      { feature: 'Freelancer Commission', us: '0% (Launch Promotion)', them: '20%' },
      { feature: 'Free AI Estimation Tools', us: '✓ Included', them: '✗' },
      { feature: 'Milestone Escrow', us: '✓', them: '✗ (Lump sum)' },
      { feature: 'Custom Proposals', us: '✓ Tailored with AI', them: 'Fixed packages' },
      { feature: 'Long-term Contracts', us: '✓', them: 'Limited' },
    ],
    whySwitch: [
      'Get custom solutions, not generic gig packages',
      'AI finds the right freelancer for YOUR specific needs',
      'Lower fees for both clients and freelancers',
      'Milestone-based payments for complex projects',
      'Professional freelancers with verified skills',
      'Better communication tools and project management',
    ],
  },
  toptal: {
    slug: 'toptal',
    name: 'Toptal',
    title: `${SITE_NAME} vs Toptal - Top Freelancers Without the Premium Price (2026)`,
    description: `Compare ${SITE_NAME} vs Toptal. Access verified top freelancers at a fraction of the cost. AI matching, flexible hiring, and no minimum commitments. The affordable Toptal alternative.`,
    keywords: [
      'toptal alternative', 'cheaper than toptal', 'toptal vs megilance',
      'hire top developers affordable', 'toptal competitor',
      'toptal too expensive', 'affordable elite freelancers',
      'top developer marketplace', 'toptal replacement',
    ],
    faqs: [
      { question: 'How is MegiLance different from Toptal?', answer: 'Toptal charges premium rates ($60-200+/hr) with a $500 deposit. MegiLance gives you access to verified, skilled freelancers at market rates with AI matching, no deposits, and flexible engagement models.' },
      { question: 'Are MegiLance freelancers as good as Toptal?', answer: 'MegiLance uses AI-powered skill assessments to verify freelancer expertise. While Toptal claims "top 3%", our AI matching ensures you get the best fit for YOUR specific project requirements and budget.' },
      { question: 'Is MegiLance cheaper than Toptal?', answer: 'Significantly. Toptal freelancers typically charge $60-200+/hr with mandatory minimums. MegiLance freelancers set competitive market rates, and you pay 0% promotional platform commission during our launch period. No deposits required.' },
    ],
    comparison: [
      { feature: 'Freelancer Rates', us: 'Market rates', them: '$60-200+/hr premium' },
      { feature: 'Required Deposit', us: 'None', them: '$500 upfront' },
      { feature: 'Minimum Commitment', us: 'None', them: '2-4 week minimum' },
      { feature: 'Platform Fee', us: '0% (Launch Promotion)', them: 'Included in rates' },
      { feature: 'AI Matching', us: '✓ Instant', them: '✗ Manual (1-3 weeks)' },
      { feature: 'Project Types', us: 'All (any budget)', them: 'Enterprise only' },
      { feature: 'Trial Period', us: 'Milestone-based', them: '2-week trial' },
      { feature: 'Blockchain Security', us: '✓', them: '✗' },
    ],
    whySwitch: [
      'No $500 deposit or minimum commitments required',
      'Access skilled freelancers at market rates, not premium markup',
      'AI matching in minutes vs weeks of manual screening',
      'Flexible for projects of any size and budget',
      'Same quality talent with transparent pricing',
    ],
  },
  'freelancer-com': {
    slug: 'freelancer-com',
    name: 'Freelancer.com',
    title: `${SITE_NAME} vs Freelancer.com - Modern AI-Powered Alternative (2026)`,
    description: `Compare ${SITE_NAME} vs Freelancer.com. Better UI, AI matching, lower fees, and verified freelancers. Upgrade from Freelancer.com to the modern freelance marketplace.`,
    keywords: [
      'freelancer.com alternative', 'freelancer alternative',
      'better than freelancer.com', 'freelancer vs megilance',
      'freelancer.com replacement', 'modern freelance marketplace',
    ],
    faqs: [
      { question: 'Is MegiLance better than Freelancer.com?', answer: 'MegiLance offers a modern UI, AI-powered matching, lower fees, and verified freelancers. Unlike Freelancer.com, there are no contest fees, no hidden charges, and no spam proposals.' },
      { question: 'Does MegiLance have contests like Freelancer.com?', answer: 'MegiLance focuses on direct hiring and AI matching for higher quality results. Instead of running contests where you get dozens of low-effort entries, our AI matches you with 3-5 highly qualified candidates.' },
    ],
    comparison: [
      { feature: 'Platform Fee', us: '0% (Launch Promotion)', them: '3-5%' },
      { feature: 'Freelancer Commission', us: '0% (Launch Promotion)', them: '10%' },
      { feature: 'AI Matching', us: '✓ Advanced', them: '✗' },
      { feature: 'Proposal Quality', us: 'AI-filtered', them: 'Unfiltered spam' },
      { feature: 'Modern UI/UX', us: '✓ 2026 design', them: 'Outdated' },
      { feature: 'Blockchain Payments', us: '✓', them: '✗' },
      { feature: 'Skill Verification', us: '✓ AI-assessed', them: 'Basic exams' },
      { feature: 'Hidden Fees', us: 'None', them: 'Contest fees, upgrades' },
    ],
    whySwitch: [
      'Modern, clean interface vs outdated design',
      'AI-filtered proposals, no spam',
      'Zero hidden fees or premium upgrades needed',
      'Quality-focused matching over quantity',
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(competitors).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = competitors[slug];
  if (!data) {
    return buildMeta({
      title: 'Platform Comparison',
      description: 'Compare MegiLance with other freelance platforms.',
      path: '/compare',
    });
  }
  return buildMeta({
    title: data.title,
    description: data.description,
    path: `/compare/${data.slug}`,
    keywords: data.keywords,
  });
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = competitors[slug];

  if (!data) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h1>Comparison Not Found</h1>
        <p>We don&apos;t have a comparison for this platform yet.</p>
      </div>
    );
  }

  return (
    <>
      <script {...jsonLdScriptProps(buildFAQJsonLd(data.faqs))} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([
          { name: 'Compare', path: '/compare' },
          { name: `vs ${data.name}`, path: `/compare/${data.slug}` },
        ])
      )} />
      <script {...jsonLdScriptProps({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title,
        description: data.description,
        url: `${BASE_URL}/compare/${data.slug}`,
        about: {
          '@type': 'SoftwareApplication',
          name: SITE_NAME,
          applicationCategory: 'BusinessApplication',
        },
        mentions: {
          '@type': 'SoftwareApplication',
          name: data.name,
          applicationCategory: 'BusinessApplication',
        },
      })} />
      <CompareClient data={data} />
    </>
  );
}
