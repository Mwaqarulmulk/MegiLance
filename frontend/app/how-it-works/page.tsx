import type { Metadata } from 'next';
import { buildMeta, buildBreadcrumbJsonLd, buildHowToJsonLd, buildSpeakableJsonLd, jsonLdScriptProps } from '@/lib/seo';
import HowItWorksClient from './HowItWorksClient';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'How It Works - Find & Do Freelance Work Online | MegiLance',
    description: 'Learn how to do freelance work, where can I find freelance work, and how to hire remote talent step-by-step. Discover why MegiLance is the top Upwork alternative.',
    path: '/how-it-works',
    keywords: [
      'how to do freelance work', 'where to get freelance work', 'where can i find freelance work',
      'how to find freelance jobs', 'how to hire freelancers', 'find freelance jobs online',
      'how freelancing works', 'upwork alternative guide',
    ],
  });
}

export default function Page() {
  const howToClientJsonLd = buildHowToJsonLd(
    'How to Hire a Freelancer on MegiLance',
    'A step-by-step guide to posting a project, reviewing proposals, and hiring the right freelancer with milestone escrow protection.',
    [
      { name: 'Post Your Project', text: 'Describe your project requirements, set your budget range, and choose your preferred skills. Posting is 100% free with no platform fees.', url: '/how-it-works' },
      { name: 'Review AI-Matched Proposals', text: 'Our AI matching engine surfaces the most compatible freelancers based on skill vectors, past performance, and budget alignment. Review proposals and freelancer profiles.', url: '/explore' },
      { name: 'Hire & Set Milestones', text: 'Select your preferred freelancer, agree on project milestones, and fund the escrow. Your payment is securely held until each milestone is approved.', url: '/how-it-works' },
      { name: 'Collaborate in the Workroom', text: 'Use the built-in real-time workroom for messaging, file sharing, and task management. No need for external tools.', url: '/how-it-works' },
      { name: 'Approve & Release Payment', text: 'When the deliverable meets your requirements, approve the milestone to automatically release payment to the freelancer.', url: '/how-it-works' },
    ]
  );

  const howToFreelancerJsonLd = buildHowToJsonLd(
    'How to Find Freelance Work on MegiLance',
    'A step-by-step guide for freelancers to create a profile, apply for projects, and earn securely.',
    [
      { name: 'Create Your Profile', text: 'Sign up free and build your freelancer profile with your skills, portfolio, certifications, and hourly rate.', url: '/signup' },
      { name: 'Browse Open Projects', text: 'Search hundreds of open projects filtered by skill, budget, and category. Use AI-powered job matching to find the best fits.', url: '/freelancer/projects' },
      { name: 'Submit a Proposal', text: 'Write a winning proposal using our free AI Proposal Writer tool. Include your timeline, approach, and milestone breakdown.', url: '/tools/proposal-creator' },
      { name: 'Work & Deliver Milestones', text: 'Collaborate in the real-time workroom, deliver work at each milestone, and get paid automatically via secure escrow release.', url: '/how-it-works' },
    ]
  );

  return (
    <>
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'How It Works', path: '/how-it-works' }])
      )} />
      <script {...jsonLdScriptProps(howToClientJsonLd)} />
      <script {...jsonLdScriptProps(howToFreelancerJsonLd)} />
      <script {...jsonLdScriptProps(
        buildSpeakableJsonLd(['h1', '.hero-description', '.how-it-works-steps'])
      )} />
      <HowItWorksClient />
    </>
  );
}
