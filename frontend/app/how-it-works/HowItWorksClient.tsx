// @AI-HINT: Comprehensive How It Works page with detailed workflows from FYP report use cases.
'use client';

import React from 'react';
import Link from 'next/link';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { 
  FileText, 
  Handshake, 
  CheckCircle, 
  UserCircle, 
  Briefcase, 
  DollarSign,
  Shield,
  Brain,
  Lock,
  Star,
  MessageSquare,
  Gavel,
  ArrowRight,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StepCard from '@/app/components/Public/StepCard/StepCard';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { AnimatedOrb, ParticlesSystem, FloatingSphere, FloatingTorus } from '@/app/components/3D'
import commonStyles from './HowItWorksPage.common.module.css';
import lightStyles from './HowItWorksPage.light.module.css';
import darkStyles from './HowItWorksPage.dark.module.css';

const clientSteps = [
  {
    stepNumber: 1,
    title: 'Post a Project',
    description: 'Describe your project requirements, set your budget range, and get AI-powered price recommendations based on market data and project complexity. Our AI scopes your project and suggests milestones automatically.',
    icon: <FileText size={40} />,
  },
  {
    stepNumber: 2,
    title: 'Review AI-Matched Proposals',
    description: 'Our 7-factor AI matching algorithm recommends top freelancers based on skills, experience, past performance, communication, and verified reviews. Compare proposals with objective ranking scores.',
    icon: <Brain size={40} />,
  },
  {
    stepNumber: 3,
    title: 'Hire & Fund Escrow',
    description: 'Accept a proposal to create a milestone-based contract. Fund each milestone through Stripe, PayPal, or cryptocurrency - funds are securely held in escrow until you approve the work.',
    icon: <Lock size={40} />,
  },
  {
    stepNumber: 4,
    title: 'Collaborate & Approve',
    description: 'Use the built-in workroom for real-time collaboration, file sharing, and progress tracking. Review deliverables, request revisions if needed, and approve milestones when satisfied.',
    icon: <CheckCircle size={40} />,
  },
  {
    stepNumber: 5,
    title: 'Release Payment',
    description: 'Once you approve a milestone, payment is instantly released to the freelancer. Leave a review to help other clients find great talent.',
    icon: <DollarSign size={40} />,
  },
];

const freelancerSteps = [
  {
    stepNumber: 1,
    title: 'Build Your Profile',
    description: 'Create a comprehensive profile showcasing your skills, portfolio, certifications, and work history. Your AI Ranking Score grows as you complete projects and receive positive reviews.',
    icon: <UserCircle size={40} />,
  },
  {
    stepNumber: 2,
    title: 'Get AI-Matched to Projects',
    description: 'Our smart matching algorithm recommends projects that fit your skills and experience level. Browse job listings filtered by AI compatibility scores and your preferences.',
    icon: <Briefcase size={40} />,
  },
  {
    stepNumber: 3,
    title: 'Submit Winning Proposals',
    description: 'Write professional proposals with AI-assisted pricing guidance. Use the Proposal Writer tool to craft compelling bids. Stand out with your verified credentials and transparent ranking.',
    icon: <MessageSquare size={40} />,
  },
  {
    stepNumber: 4,
    title: 'Deliver & Get Paid',
    description: 'Work in the collaborative workroom, submit deliverables through the platform, and get paid instantly once milestones are approved. Track earnings and manage invoices from your dashboard.',
    icon: <DollarSign size={40} />,
  },
];

const securityFeatures = [
  {
    icon: <Shield size={32} />,
    title: 'Escrow Protection',
    description: 'Funds are securely held in escrow for each milestone. Payment is only released when you approve the delivered work, protecting both clients and freelancers.',
  },
  {
    icon: <Brain size={32} />,
    title: 'AI Fraud Detection',
    description: 'Our AI analyzes behavioral patterns to identify suspicious accounts, fake reviews, and fraudulent activities before they impact the platform.',
  },
  {
    icon: <Star size={32} />,
    title: 'Objective AI Ranking',
    description: 'Your ranking score is based on verifiable metrics: project completion rate, skill proficiency, communication quality, deadline adherence, and verified client reviews.',
  },
  {
    icon: <Gavel size={32} />,
    title: 'Dispute Resolution',
    description: 'Fair dispute resolution process with admin mediation. All interactions and deliverables are logged for transparent conflict resolution.',
  },
];

const whyDifferent = [
  {
    icon: <DollarSign size={28} />,
    title: 'Launch Platform Fee',
    stat: '0%',
    description: 'Keep 100% of earnings during promotional launch',
  },
  {
    icon: <Zap size={28} />,
    title: 'Objective Matching',
    stat: '7-Factor',
    description: 'algorithm evaluating competency & availability',
  },
  {
    icon: <Globe size={28} />,
    title: 'Global Settlements',
    stat: '70+',
    description: 'supported countries with multi-currency payouts',
  },
  {
    icon: <Shield size={28} />,
    title: 'Milestone Escrow',
    stat: '100%',
    description: 'secure code-enforced milestone payments',
  },
];

const HowItWorksPage: React.FC = () => {
  const themeStyles = useThemeStyles(lightStyles, darkStyles);

  return (
    <PageTransition>
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
         <AnimatedOrb variant="blue" size={500} blur={100} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
         <AnimatedOrb variant="purple" size={400} blur={80} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
         <ParticlesSystem count={20} className="absolute inset-0" />
         <div className="absolute top-40 left-20 opacity-10 animate-float-slow">
           <FloatingTorus size={60} />
         </div>
         <div className="absolute bottom-60 right-40 opacity-10 animate-float-medium">
           <FloatingSphere size={50} variant="gradient" />
         </div>
      </div>

      <main id="main-content" role="main" className={cn(commonStyles.container, themeStyles.container)}>
        <ScrollReveal>
          <header className={commonStyles.header}>
            <h1 className={cn(commonStyles.title, themeStyles.title)}>How MegiLance Works</h1>
            <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
              A modern freelance marketplace combining free AI project scoping, code-enforced milestone escrow payments, and verified skill matching.
            </p>
          </header>
        </ScrollReveal>

        {/* Why We're Different Section */}
        <section className={commonStyles.section} aria-labelledby="why-different">
          <ScrollReveal>
            <h2 id="why-different" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
              Why MegiLance is Different
            </h2>
            <p className={cn(commonStyles.sectionSubtitle, themeStyles.subtitle)}>
              Built to solve the real problems freelancers and clients face: high fees, poor matching, and lack of trust.
            </p>
          </ScrollReveal>
          <StaggerContainer className={commonStyles.statsGrid}>
            {whyDifferent.map((item, index) => (
              <StaggerItem key={index} className={cn(commonStyles.statCard, themeStyles.statCard)}>
                <div className={commonStyles.statIcon}>{item.icon}</div>
                <div className={commonStyles.statValue}>{item.stat}</div>
                <div className={commonStyles.statTitle}>{item.title}</div>
                <div className={commonStyles.statDesc}>{item.description}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        <section className={commonStyles.main} aria-label="Process overview">
          {/* For Clients */}
          <section className={commonStyles.section} aria-labelledby="howitworks-clients">
            <ScrollReveal>
              <h2 id="howitworks-clients" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
                For Clients
              </h2>
              <p className={cn(commonStyles.sectionSubtitle, themeStyles.subtitle)}>
                Post a project, get AI-matched proposals, collaborate in workrooms, and pay securely with milestone escrow.
              </p>
            </ScrollReveal>
            <StaggerContainer className={commonStyles.grid}>
              {clientSteps.map(step => (
                <StaggerItem key={step.stepNumber}>
                  <StepCard {...step} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>

          {/* For Freelancers */}
          <section className={commonStyles.section} aria-labelledby="howitworks-freelancers">
            <ScrollReveal>
              <h2 id="howitworks-freelancers" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
                For Freelancers
              </h2>
              <p className={cn(commonStyles.sectionSubtitle, themeStyles.subtitle)}>
                Build your reputation with AI ranking, win projects with smart proposals, and get paid reliably.
              </p>
            </ScrollReveal>
            <StaggerContainer className={commonStyles.grid}>
              {freelancerSteps.map(step => (
                <StaggerItem key={step.stepNumber}>
                  <StepCard {...step} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </section>
        </section>

        {/* Security & Protection Features */}
        <section id="escrow" className={commonStyles.section} aria-labelledby="security-features">
          <ScrollReveal>
            <h2 id="security-features" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
              Escrow Protection & Security
            </h2>
              <p className={cn(commonStyles.sectionSubtitle, themeStyles.subtitle)}>
                Built-in protections for both clients and freelancers at every step of the process.
              </p>
          </ScrollReveal>
          <StaggerContainer className={commonStyles.featuresGrid}>
            {securityFeatures.map((feature, index) => (
              <StaggerItem key={index} className={cn(commonStyles.featureCard, themeStyles.featureCard)}>
                <div className={commonStyles.featureIcon}>{feature.icon}</div>
                <h3 className={commonStyles.featureTitle}>{feature.title}</h3>
                <p className={commonStyles.featureDesc}>{feature.description}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* How Matching Score Works */}
        <section className={commonStyles.section} aria-labelledby="matching-score">
          <ScrollReveal>
            <h2 id="matching-score" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
              How MegiLance Matching Score Works
            </h2>
            <p className={cn(commonStyles.sectionSubtitle, themeStyles.subtitle)}>
              Our 7-factor semantic algorithm calculates an objective compatibility score for every proposal.
            </p>
          </ScrollReveal>
          
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm my-8">
            <div className="grid md:grid-cols-2 gap-8 items-center text-left">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Algorithmic Weighted Model</h3>
                <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed">
                  Instead of paying to rank higher, MegiLance enforces meritocracy. Proposals are ranked using a multi-dimensional analysis pipeline that combines text embeddings, historical execution metrics, and reputation vectors.
                </p>
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong>Evaluation Defense Note:</strong> This matching model ensures clients receive vetted matches automatically, saving hours of manual review.
                </div>
              </div>
              
              <div className="space-y-3.5">
                {[
                  { name: 'Skill Match', weight: 35, color: 'bg-blue-500', desc: 'Syntax & semantic skill vector compatibility' },
                  { name: 'Past Project Relevance', weight: 20, color: 'bg-indigo-500', desc: 'Historical project similarity & category fit' },
                  { name: 'Ratings & Reviews', weight: 15, color: 'bg-emerald-500', desc: 'Verified client feedback & milestone success' },
                  { name: 'Budget Fit', weight: 10, color: 'bg-amber-500', desc: 'Bid alignment with project target estimates' },
                  { name: 'Availability & Speed', weight: 10, color: 'bg-teal-500', desc: 'Working capacity & response times' },
                  { name: 'Communication Quality', weight: 5, color: 'bg-pink-500', desc: 'Activity rate in collaborative workspaces' },
                  { name: 'Fraud & Compliance', weight: 5, color: 'bg-rose-500', desc: 'Verification status & risk score checks' },
                ].map((factor) => (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{factor.name}</span>
                      <span className="text-slate-900 dark:text-white">{factor.weight}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", factor.color)} style={{ width: `${factor.weight}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technical Architecture Overview */}
        <section className={commonStyles.section} aria-labelledby="architecture">
          <ScrollReveal>
            <h2 id="architecture" className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
              The Technology Behind It
            </h2>
          </ScrollReveal>
          <div className={cn(commonStyles.architectureCard, themeStyles.architectureCard)}>
            <div className={commonStyles.archLayer}>
              <h3>Frontend Layer</h3>
              <p><strong>Next.js 16 + React 19 + TypeScript</strong></p>
              <p>Fast, SEO-optimized pages with responsive design. Server-side rendering and static generation for instant loading. Tailwind CSS for styling.</p>
            </div>
            <div className={commonStyles.archArrow}>↓</div>
            <div className={commonStyles.archLayer}>
              <h3>Backend Layer</h3>
              <p><strong>FastAPI + Python 3.11+</strong></p>
              <p>High-performance async API with Pydantic validation, JWT authentication, rate limiting, and comprehensive error handling.</p>
            </div>
            <div className={commonStyles.archArrow}>↓</div>
            <div className={commonStyles.archLayerSplit}>
              <div className={commonStyles.archLayer}>
                <h3>AI Services</h3>
                <p><strong>Python ML Pipeline</strong></p>
                <p>7-factor talent matching, price estimation, sentiment analysis, fraud detection, and proposal generation.</p>
              </div>
              <div className={commonStyles.archLayer}>
                <h3>Real-time & Payments</h3>
                <p><strong>Socket.io + Stripe</strong></p>
                <p>Real-time messaging, notifications, and collaboration. Stripe, PayPal, and cryptocurrency payment processing.</p>
              </div>
            </div>
            <div className={commonStyles.archArrow}>↓</div>
            <div className={commonStyles.archLayer}>
              <h3>Database</h3>
              <p><strong>Turso (libSQL) + MongoDB</strong></p>
              <p>Edge-distributed SQL database for core data with low-latency worldwide access. MongoDB for blog/CMS content.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={commonStyles.section} aria-labelledby="cta">
          <ScrollReveal>
            <div className={cn(commonStyles.ctaSection, themeStyles.ctaSection)}>
              <h2 id="cta" className={commonStyles.ctaTitle}>Ready to Get Started?</h2>
              <p className={commonStyles.ctaSubtitle}>
                Join thousands of freelancers and clients already using MegiLance.
              </p>
              <div className={commonStyles.ctaButtons}>
                <Link href="/signup" className={cn(commonStyles.ctaButton, commonStyles.ctaPrimary)}>
                  Create Free Account <ArrowRight size={18} />
                </Link>
                <Link href="/freelancer/projects" className={cn(commonStyles.ctaButton, commonStyles.ctaSecondary)}>
                  Browse Projects
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </PageTransition>
  );
};

export default HowItWorksPage;
