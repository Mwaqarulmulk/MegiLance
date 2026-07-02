// @AI-HINT: Clean About page with mission, problem/solution, team details.
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
} from 'lucide-react';
import { useMounted } from '@/app/hooks/useMounted';
import common from './About.common.module.css';
import light from './About.light.module.css';
import dark from './About.dark.module.css';

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
      {/* Premium 3D Background */}
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
        <header className={styles.hero}>
          <ScrollReveal direction="down">
            <div className={common.heroRow}>
              <div className={common.heroContent}>
                <h1 id="about-title" className={styles.title}>About MegiLance</h1>
                <p className={styles.subtitle}>
                  MegiLance is a hybrid decentralized freelancing ecosystem designed to align the economics of remote work
                  with the psychology of trust. By integrating AI for objective competency matching and blockchain smart contracts
                  for secure escrow, we eliminate traditional market friction and empower global professionals to collaborate with absolute peace of mind.
                </p>
              </div>
              {/* Brand illustration — Our Story, Mission, Vision, AI+Blockchain, Secure Trust, Fair Pay, Global Freelancing */}
              <Image
                src="/images/hero/about-hero.png"
                alt="MegiLance platform values — Our Story, Our Mission, Our Vision, AI and Blockchain, Secure Trust, Fair Pay, Global Freelancing"
                width={520}
                height={400}
                priority
                sizes="(max-width: 768px) 100vw, 520px"
                style={{ width: '100%', maxWidth: '520px', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </ScrollReveal>
        </header>

        {/* The Problem We Solve */}
        <section aria-labelledby="problem-title">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="problem-title" className={styles.sectionTitle}>The Problem We Solve</h2>
              <span aria-hidden="true" className={styles.sectionNote}>Why the freelance industry needs disruption</span>
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.grid}>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="problem-fees-title">
              <DollarSign size={32} className={common.iconError} />
              <h3 id="problem-fees-title" className={styles.cardTitle}>Economic Extortion</h3>
              <p className={styles.cardBody}>
                Traditional platforms take 10-20% of a freelancer's hard-earned income. This heavy tax
                disproportionately penalizes talented professionals, driving up client costs and squeezing freelancer margins.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="problem-payments-title">
              <Globe size={32} className={common.iconWarning} />
              <h3 id="problem-payments-title" className={styles.cardTitle}>Financial Exclusion</h3>
              <p className={styles.cardBody}>
                Freelancers in the Global South face severe payment barriers, often blocked from main gateways.
                They suffer through high transfer fees, delayed wire clearings, and extreme exchange rate inflation.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="problem-trust-title">
              <Shield size={32} className={common.iconAccent} />
              <h3 id="problem-trust-title" className={styles.cardTitle}>Payment & Work Anxiety</h3>
              <p className={styles.cardBody}>
                Both clients and freelancers carry significant transaction anxiety. Clients fear unfinished milestones;
                freelancers fear unpaid invoices. Opaque platform bidding wars and arbitrary dispute reviews worsen this trust deficit.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Our Solution */}
        <section aria-labelledby="solution-title">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="solution-title" className={styles.sectionTitle}>Our Solution</h2>
              <span aria-hidden="true" className={styles.sectionNote}>Hybrid Web2 + Web3 Architecture</span>
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.grid}>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="solution-ai-title">
              <Brain size={32} className={common.iconPrimary} />
              <h3 id="solution-ai-title" className={styles.cardTitle}>Objectivity & Market Intelligence</h3>
              <p className={styles.cardBody}>
                We use machine learning to rank talent based on actual, verified performance rather than ad spend.
                Our AI Price Estimator uses live global indices to align budget expectations fairly for both sides.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="solution-blockchain-title">
              <Lock size={32} className={common.iconSuccess} />
              <h3 id="solution-blockchain-title" className={styles.cardTitle}>Smart Contract Escrow</h3>
              <p className={styles.cardBody}>
                MetaMask web3 wallets and smart contracts guarantee secure escrow. Payments are locked at milestone start
                and release immediately upon deliverable approval—creating a risk-free, transparent agreement.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.card} tabIndex={0} aria-labelledby="solution-speed-title">
              <Zap size={32} className={common.iconWarning} />
              <h3 id="solution-speed-title" className={styles.cardTitle}>Global High-Speed Edge</h3>
              <p className={styles.cardBody}>
                Built on Next.js 16, async FastAPI, and Turso Edge SQL databases to deliver a sub-second response time
                for users worldwide, facilitating fluid collaboration.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Mission & Values */}
        <section aria-labelledby="mission-title">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="mission-title" className={styles.sectionTitle}>Our Mission</h2>
              <span aria-hidden="true" className={styles.sectionNote}>Empowering the global freelance workforce</span>
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.valuesGrid}>
            <StaggerItem className={styles.valueItem} aria-labelledby="value-equity-title">
              <h3 id="value-equity-title" className={styles.valueTitle}>Financial Autonomy</h3>
              <p className={styles.valueDesc}>
                We drive transaction overhead close to zero by utilizing blockchain, ensuring that professionals keep the true value of their labor.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem} aria-labelledby="value-merit-title">
              <h3 id="value-merit-title" className={styles.valueTitle}>Eliminating Bias</h3>
              <p className={styles.valueDesc}>
                Our AI matching promotes freelancers solely based on skill, responsiveness, and work history, bypassing favoritism.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem} aria-labelledby="value-transparency-title">
              <h3 id="value-transparency-title" className={styles.valueTitle}>Mutual Safety</h3>
              <p className={styles.valueDesc}>
                We replace transaction anxiety with structural certainty. Secure escrow and milestone-based approvals mean peace of mind at every step.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Team Section */}
        <section aria-labelledby="team-title">
          <ScrollReveal>
            <div className={styles.sectionHeader}>
              <h2 id="team-title" className={styles.sectionTitle}>Our Team</h2>
              <span aria-hidden="true" className={styles.sectionNote}>The people building the future of freelancing</span>
            </div>
            {/* Team collaboration visual — Project Manager, Frontend Dev, Backend Dev, UX/UI Designer, QA/Operations */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <Image
                src="/images/sections/team.png"
                alt="MegiLance team — Project Manager, Frontend Developer, UX/UI Designer, Backend Developer, and QA/Operations working on the platform"
                width={680}
                height={520}
                sizes="(max-width: 768px) 100vw, 680px"
                style={{ width: '100%', maxWidth: '680px', height: 'auto', objectFit: 'contain' }}
              />
            </div>
          </ScrollReveal>
          <StaggerContainer className={styles.valuesGrid}>
            <StaggerItem className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Ghulam Ahmed</h3>
              <p className={styles.valueDesc}>
                Founder &amp; Lead Engineer. Architecture design, AI integration, and full-stack development.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Muhammad Waqar Ul Mulk</h3>
              <p className={styles.valueDesc}>
                Co-Founder &amp; Backend Lead. Database design, API implementation, and security hardening.
              </p>
            </StaggerItem>
            <StaggerItem className={styles.valueItem}>
              <h3 className={styles.valueTitle}>Mujtaba</h3>
              <p className={styles.valueDesc}>
                Co-Founder &amp; Design Lead. UI/UX design, responsive layouts, and theme implementation.
              </p>
            </StaggerItem>
          </StaggerContainer>
        </section>

        <section aria-labelledby="cta-title">
          <ScrollReveal>
            <h2 id="cta-title" className={styles.sectionTitle}>Join the Revolution</h2>
            <div className={styles.cta}>
              <Link href="/signup">
                <button className={styles.ctaBtn} aria-label="Get started with MegiLance">
                  Start Freelancing Today
                </button>
              </Link>
              <span className={styles.sectionNote}>Zero fees for freelancers. Blockchain-secured payments.</span>
            </div>
          </ScrollReveal>
        </section>
      </main>
    </PageTransition>
  );
};

export default About;
