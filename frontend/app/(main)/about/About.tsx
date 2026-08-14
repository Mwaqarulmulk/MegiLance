// @AI-HINT: Factual About page explaining platform purpose, origin, core pillars, architecture, and team.
'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import { StaggerContainer, StaggerItem } from '@/app/components/Animations/StaggerContainer';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import { 
  Globe, 
  Shield, 
  Zap, 
  Brain, 
  DollarSign,
  Lock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useMounted } from '@/app/hooks/useMounted';
import common from './About.common.module.css';
import light from './About.light.module.css';
import dark from './About.dark.module.css';
import BrandLottiePlayer from '@/app/components/ui/BrandLottiePlayer';
import { PRICING_CONFIG, PLATFORM_STATUS } from '@/lib/platform-config';

const About: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const t = (mounted && resolvedTheme === 'dark') ? dark : light;
  const styles = {
    root: cn(common.root, t.root),
    hero: cn(common.hero, t.hero),
    title: cn(common.title, t.title),
    subtitle: cn(common.subtitle, t.subtitle),
    grid: cn(common.grid, t.grid),
    card: cn(common.card, t.card),
    cardTitle: cn(common.cardTitle, t.cardTitle),
    cardBody: cn(common.cardBody, t.cardBody),
    sectionHeader: cn(common.sectionHeader, t.sectionHeader),
    sectionTitle: cn(common.sectionTitle, t.sectionTitle),
    sectionNote: cn(common.sectionNote, t.sectionNote),
    valuesGrid: cn(common.valuesGrid, t.valuesGrid),
    valueItem: cn(common.valueItem, t.valueItem),
    valueTitle: cn(common.valueTitle, t.valueTitle),
    valueDesc: cn(common.valueDesc, t.valueDesc),
    cta: cn(common.cta, t.cta),
    ctaBtn: cn(common.ctaBtn, t.ctaBtn),
  };

  return (
    <PageTransition>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <AnimatedOrb variant="purple" size={500} blur={90} opacity={0.1} className="absolute top-[-10%] right-[-10%]" />
        <AnimatedOrb variant="blue" size={400} blur={70} opacity={0.08} className="absolute bottom-[-10%] left-[-10%]" />
        <ParticlesSystem count={12} className="absolute inset-0" />
        <div className="absolute top-20 left-10 opacity-10 animate-float-slow">
          <FloatingCube size={40} />
        </div>
        <div className="absolute bottom-40 right-20 opacity-10 animate-float-medium">
          <FloatingSphere size={30} variant="gradient" />
        </div>
      </div>

      <main id="main-content" role="main" aria-labelledby="about-title" className={styles.root}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <ScrollReveal direction="down">
            <div className={common.heroRow}>
              <div className={common.heroContent}>
                <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {PLATFORM_STATUS.STAGE}
                </span>
                <h1 id="about-title" className={styles.title}>About MegiLance</h1>
                <p className={styles.subtitle}>
                  MegiLance is an AI-assisted freelance platform for clients and independent professionals. Its free tools help users estimate project costs, calculate freelance rates, write proposals, plan project scopes and evaluate potential risks. The marketplace connects those workflows with freelancer discovery, job opportunities, project collaboration and milestone-based payments.
                </p>
              </div>
              <Image
                src="/images/hero/about-hero.png"
                alt="MegiLance platform overview — AI tools, Milestone Escrow, and Freelance Marketplace"
                width={520}
                height={400}
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                style={{ width: '100%', maxWidth: '520px', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </ScrollReveal>
        </header>

        {/* Core Pillars */}
        <section aria-labelledby="pillars-title" style={{ margin: '2rem 0 4rem' }}>
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="pillars-title" className={styles.sectionTitle}>What MegiLance Solves</h2>
              <span aria-hidden="true" className={styles.sectionNote}>Built for clients and independent professionals</span>
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.grid}>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="pillar-tools-title">
              <Brain size={32} className={common.iconPrimary} />
              <h3 id="pillar-tools-title" className={styles.cardTitle}>Free AI Productivity Tools</h3>
              <p className={styles.cardBody}>
                11 interactive tools that help users estimate realistic project budgets, calculate sustainable freelance rates, craft structured proposals, and inspect briefs for risk patterns before any contracts begin.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="pillar-matching-title">
              <Zap size={32} className={common.iconWarning} />
              <h3 id="pillar-matching-title" className={styles.cardTitle}>Objective Skill Matching</h3>
              <p className={styles.cardBody}>
                Algorithmic multi-factor evaluation connecting clients with relevant talent based on verified competencies, project requirements, budget compatibility, and availability.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="pillar-escrow-title">
              <Lock size={32} className={common.iconSuccess} />
              <h3 id="pillar-escrow-title" className={styles.cardTitle}>Milestone Escrow Protection</h3>
              <p className={styles.cardBody}>
                Structured milestone funding ensures clients only release funds upon deliverable approval, while freelancers work with confidence knowing milestone payments are pre-funded in escrow.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Leadership & Core Team */}
        <section aria-labelledby="team-title" style={{ margin: '4rem 0' }}>
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="team-title" className={styles.sectionTitle}>Leadership &amp; Core Engineering</h2>
              <span aria-hidden="true" className={styles.sectionNote}>The team behind MegiLance</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <BrandLottiePlayer
                src="/lottie/16_team_collaboration.json"
                ariaLabel="MegiLance Team Collaboration Animation"
                className="w-full max-w-lg h-64 md:h-80"
                framed={true}
                glow={true}
              />
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.valuesGrid}>
            <StaggerItem className={styles.valueItem} tabIndex={0}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(69, 115, 223, 0.1)', color: 'var(--color-primary, #4573df)', marginBottom: '0.75rem' }}>
                Founder &amp; Lead Engineer
              </div>
              <h3 className={styles.valueTitle}>Ghulam Mujtaba</h3>
              <p className={styles.valueDesc}>
                Lead Architect. Responsible for Next.js 16 frontend, FastAPI microservices, AI engine integrations, and platform design.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem} tabIndex={0}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(39, 174, 96, 0.1)', color: '#27ae60', marginBottom: '0.75rem' }}>
                Co-Founder &amp; Backend Lead
              </div>
              <h3 className={styles.valueTitle}>Muhammad Waqar Ul Mulk</h3>
              <p className={styles.valueDesc}>
                Database &amp; Security Lead. Oversees Turso async query pipelines, authentication layers, and infrastructure deployment.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem} tabIndex={0}>
              <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(155, 81, 224, 0.1)', color: '#9b51e0', marginBottom: '0.75rem' }}>
                Academic Advisory Board
              </div>
              <h3 className={styles.valueTitle}>Advisory &amp; Evaluation</h3>
              <p className={styles.valueDesc}>
                <strong>Dr. Junaid Akram</strong> &amp; <strong>Khula Qadeer</strong> — System Evaluation, AI Vetting Methodology, and Advisory Guidance.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Origin & Development */}
        <section aria-labelledby="origin-title" style={{ margin: '4rem 0' }}>
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="origin-title" className={styles.sectionTitle}>Platform Origin &amp; Status</h2>
              <span aria-hidden="true" className={styles.sectionNote}>Built from research into a scalable product</span>
            </div>
            <div className={styles.card} style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
              <p className={styles.cardBody} style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>
                MegiLance began as an advanced software engineering project exploring how AI-assisted scope planning and transparent milestone payments could resolve common friction in online freelancing. Today, MegiLance operates in early access / public beta, continuously expanding its free tool suite and verified global talent network.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-title">
          <ScrollReveal>
            <div className={styles.cta}>
              <h2 id="cta-title" className={styles.sectionTitle} style={{ margin: 0 }}>Explore MegiLance Today</h2>
              <p style={{ maxWidth: '560px', margin: '0 auto', fontSize: '1rem', opacity: 0.85 }}>
                Start with free AI tools to estimate project costs or plan work, then connect with freelancers and clients on the marketplace.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <Link href="/ai">
                  <button className={styles.ctaBtn} aria-label="Explore Free AI Tools">
                    Use Free AI Tools
                  </button>
                </Link>
                <Link href="/signup">
                  <button className={styles.ctaBtn} style={{ background: 'transparent', border: '1px solid currentColor', color: 'inherit' }} aria-label="Create Free Account">
                    Join MegiLance
                  </button>
                </Link>
              </div>
              <span className={styles.sectionNote}>
                {PRICING_CONFIG.LAUNCH_POLICY_NOTICE}
              </span>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </PageTransition>
  );
};

export default About;
