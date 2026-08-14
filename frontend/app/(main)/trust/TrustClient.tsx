'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useThemeMode } from '@/app/hooks/useThemeMode';
import { 
  ShieldCheck, 
  Lock, 
  UserCheck, 
  Scale, 
  EyeOff, 
  Cpu, 
  FileCheck, 
  Mail, 
  AlertCircle, 
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PLATFORM_STATUS, PRICING_CONFIG } from '@/lib/platform-config';
import commonStyles from './TrustClient.common.module.css';
import lightStyles from './TrustClient.light.module.css';
import darkStyles from './TrustClient.dark.module.css';

export default function TrustClient() {
  const mode = useThemeMode();
  const themeStyles = mode === 'dark' ? darkStyles : lightStyles;

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <header className={commonStyles.header}>
        <span className={cn(commonStyles.badge, themeStyles.badge)}>
          <ShieldCheck size={14} className="inline mr-1 text-emerald-500" />
          Trust &amp; Platform Integrity
        </span>
        <h1 className={cn(commonStyles.title, themeStyles.title)}>Trust, Safety &amp; Security on MegiLance</h1>
        <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
          We operate with complete transparency. Here is how our milestone escrow works, how dispute resolution operates, how we handle your data, and what security practices protect our platform.
        </p>
      </header>

      {/* Grid of Trust Pillars */}
      <div className={commonStyles.sectionsGrid}>
        
        {/* 1. Who Operates MegiLance & Product Status */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <FileCheck size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Platform Operation &amp; Status</h2>
              <span className={commonStyles.statusPill}>{PLATFORM_STATUS.STAGE}</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>
              MegiLance is developed and maintained by an engineering and AI research team led by Ghulam Mujtaba (Lead Architect) and Muhammad Waqar Ul Mulk (Backend &amp; Security Lead), with academic supervision from Dr. Junaid Akram and Khula Qadeer.
            </p>
            <p>
              The platform is currently operating in <strong>{PLATFORM_STATUS.STAGE}</strong>. We are actively refining our AI recommendation algorithms, onboarding freelance talent across 10 disciplines, and offering promotional platform pricing during this launch phase.
            </p>
            <div className={commonStyles.contactBox}>
              <strong>General Support:</strong> <a href="mailto:support@megilance.site" className={commonStyles.link}>support@megilance.site</a>
            </div>
          </div>
        </section>

        {/* 2. Milestone Escrow & Payment Workflow */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <Lock size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Milestone Escrow Payment Workflow</h2>
              <span className={commonStyles.statusPill}>Pre-Funded Protection</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>Our payment system protects both parties from transaction anxiety through a 4-step escrow structure:</p>
            <ol className={commonStyles.orderedList}>
              <li><strong>Milestone Definition:</strong> The project is divided into distinct, measurable milestones with agreed deliverables and due dates.</li>
              <li><strong>Pre-Funding Escrow:</strong> The client funds the milestone in advance. Funds are held safely in escrow before work starts.</li>
              <li><strong>Deliverable Submission:</strong> The freelancer completes the milestone scope and submits the work in the collaboration workroom.</li>
              <li><strong>Review &amp; Approval:</strong> The client reviews the deliverable. Once approved, escrow funds are automatically released to the freelancer.</li>
            </ol>
            <p className="text-xs opacity-75 mt-2">
              {PRICING_CONFIG.PAYMENT_PROCESSOR_NOTE}
            </p>
          </div>
        </section>

        {/* 3. Dispute Resolution Procedure */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <Scale size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Dispute Mediation &amp; Resolution</h2>
              <span className={commonStyles.statusPill}>Fair Evidence-Based Review</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>
              If a client and freelancer cannot reach agreement regarding milestone deliverables or quality standards, either party can initiate dispute mediation directly from the workroom:
            </p>
            <ul className={commonStyles.bulletList}>
              <li><strong>Direct Negotiation (Phase 1):</strong> Parties have 48 hours to attempt direct resolution or revision within the project workroom.</li>
              <li><strong>Evidence Submission (Phase 2):</strong> If unresolved, both parties submit evidence, original project briefs, and deliverable files.</li>
              <li><strong>Mediation Assessment (Phase 3):</strong> MegiLance mediation evaluates deliverables against the agreed milestone criteria within 3–5 business days.</li>
              <li><strong>Fund Distribution:</strong> Escrow funds are distributed or refunded proportionally based on the evidence-grounded mediation ruling.</li>
            </ul>
          </div>
        </section>

        {/* 4. Identity & Skill Verification */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <UserCheck size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Identity &amp; Skills Verification</h2>
              <span className={commonStyles.statusPill}>Multi-Tier Vetting</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>To maintain platform trust, we employ progressive verification tiers:</p>
            <ul className={commonStyles.bulletList}>
              <li><strong>Email &amp; Phone Verification:</strong> Required for all accounts prior to project publishing or bidding.</li>
              <li><strong>Identity Verification:</strong> Freelancers can submit government ID verification to earn a Verified Talent Badge.</li>
              <li><strong>Skill &amp; Portfolio Review:</strong> Code repositories, design portfolios, and past project case studies are indexed to build algorithmic match scores.</li>
              <li><strong>Review Integrity:</strong> Only clients and freelancers with completed, funded milestone contracts can leave feedback. Self-reviews and unverified ratings are strictly prevented.</li>
            </ul>
          </div>
        </section>

        {/* 5. Privacy & Guest Data Policy */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <EyeOff size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Privacy &amp; Data Handling</h2>
              <span className={commonStyles.statusPill}>Privacy-First Architecture</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>
              Your privacy is fundamental to our engineering approach:
            </p>
            <ul className={commonStyles.bulletList}>
              <li><strong>Guest Mode Privacy:</strong> When you use our free AI tools without signing in, inputs are processed in-memory for calculation and are not sold to data brokers.</li>
              <li><strong>Account Data:</strong> Registered user data is encrypted at rest and in transit via TLS 1.3.</li>
              <li><strong>AI Training Isolation:</strong> User project descriptions and confidential workroom communications are not used to train public generative models without explicit consent.</li>
            </ul>
          </div>
        </section>

        {/* 6. Security Architecture & Responsible Disclosure */}
        <section className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}>
          <div className={commonStyles.cardHeader}>
            <div className={cn(commonStyles.iconWrap, themeStyles.iconWrap)}>
              <Cpu size={24} />
            </div>
            <div>
              <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Security Practices &amp; Vulnerability Disclosure</h2>
              <span className={commonStyles.statusPill}>Technical Governance</span>
            </div>
          </div>
          <div className={commonStyles.cardBody}>
            <p>Our security controls include:</p>
            <ul className={commonStyles.bulletList}>
              <li><strong>Authentication:</strong> Encrypted JWT access tokens, secure HTTP-only cookies, and bcrypt (cost factor 12) password hashing.</li>
              <li><strong>Database Protection:</strong> Parameterized queries via SQLAlchemy ORM on Turso Edge SQL to prevent SQL injection vulnerabilities.</li>
              <li><strong>Rate Limiting &amp; DDoS Guard:</strong> Automated API rate limiting via slowapi and Cloudflare edge proxies.</li>
            </ul>
            <div className={commonStyles.contactBox} style={{ marginTop: '1.25rem' }}>
              <strong>Responsible Security Disclosure:</strong> If you discover a vulnerability or security bug, please contact us directly at <a href="mailto:security@megilance.site" className={commonStyles.link}>security@megilance.site</a>. We review all reports promptly.
            </div>
          </div>
        </section>

      </div>

      {/* Footer Navigation */}
      <div className={commonStyles.footerNav}>
        <Link href="/methodology" className={cn(commonStyles.navBtn, themeStyles.navBtn)}>
          <Sparkles size={16} />
          <span>Explore AI Methodology</span>
          <ArrowRight size={16} />
        </Link>
        <Link href="/pricing" className={cn(commonStyles.navBtn, themeStyles.navBtn)}>
          <span>View Transparent Pricing</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
