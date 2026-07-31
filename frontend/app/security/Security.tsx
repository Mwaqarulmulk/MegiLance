// @AI-HINT: Security page using per-page theme-aware modules, intersection observer animations, and accessible structure.
'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { PageTransition, ScrollReveal, StaggerContainer } from '@/app/components/Animations';
import { AnimatedOrb, ParticlesSystem, FloatingCube, FloatingSphere } from '@/app/components/3D';
import { X, Shield, Lock, FileText, CheckCircle } from 'lucide-react'
import common from './Security.common.module.css';
import light from './Security.light.module.css';
import dark from './Security.dark.module.css';

const Security: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === 'dark' ? dark : light;
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <PageTransition>
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

      <main id="main-content" role="main" className={cn(common.page, themed.themeWrapper)}>
        <div className={common.container}>
          <ScrollReveal>
            <header className={common.header}>
               <h1 className={common.title}>Trust & Security Center</h1>
               <p className={common.subtitle} aria-label="Last updated">Last Updated: March 24, 2026</p>
            </header>
          </ScrollReveal>

          <StaggerContainer className={common.grid} aria-label="Security highlights" delay={0.1}>
            <article className={common.card} aria-labelledby="sec-1">
              <div className={cn(common.cardIcon, themed.cardIcon)}>
                <Shield size={24} />
              </div>
              <h3 id="sec-1" className={common.cardTitle}>Smart Contract Security</h3>
              <p className={common.cardDesc}>
                Our payment and escrow systems are built on audited smart contracts. All contracts undergo rigorous
                internal testing and multiple external audits from leading security firms before deployment. Audit reports
                are available upon request.
              </p>
            </article>

            <article className={common.card} aria-labelledby="sec-2">
              <div className={cn(common.cardIcon, themed.cardIcon)}>
                <Lock size={24} />
              </div>
              <h3 id="sec-2" className={common.cardTitle}>Platform Security</h3>
              <p className={common.cardDesc}>
                We employ industry-standard security practices to protect our platform, including encryption of data in
                transit and at rest, regular security scans, and protection against common web vulnerabilities like XSS
                and CSRF.
              </p>
            </article>

            <article className={common.card} aria-labelledby="sec-3">
              <div className={cn(common.cardIcon, themed.cardIcon)}>
                <CheckCircle size={24} />
              </div>
              <h3 id="sec-3" className={common.cardTitle}>Account Protection</h3>
              <p className={common.cardDesc}>
                User accounts are protected with password hashing. We strongly recommend all users enable two-factor
                authentication (2FA) for an additional layer of security. You are responsible for the security of your own
                account credentials and connected wallets.
              </p>
            </article>
          </StaggerContainer>

          {/* Smart Contract Escrow Section */}
          <ScrollReveal className={common.section} delay={0.15}>
            <h2 className={common.sectionTitle}>Smart Contract Escrow Flow</h2>
            <p className={common.cardDesc} style={{ marginBottom: '2rem' }}>
              MegiLance uses decentralized smart contracts to protect payments. Work is funded upfront and held in escrow, releasing automatically upon approval or milestone completion.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#60a5fa' }}>1. Deposit</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: '1.5' }}>Client funds the project milestone. USDC is locked in the Escrow Smart Contract.</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '1.5rem', opacity: 0.5, transform: 'rotate(0deg)' }}>➡️</div>
                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(139, 92, 246, 0.08)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#a78bfa' }}>2. Deliver</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: '1.5' }}>Freelancer submits files/work. Client reviews deliverables directly on MegiLance.</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '1.5rem', opacity: 0.5 }}>➡️</div>
                <div style={{ textAlign: 'center', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#34d399' }}>3. Release</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.95, lineHeight: '1.5' }}>Client approves work. Contract triggers, instantly transferring funds to freelancer.</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Platform Environment Disclaimer */}
          <ScrollReveal className={common.section} delay={0.2}>
            <h2 className={common.sectionTitle}>Escrow & Payment Infrastructure</h2>
            <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                🛡️ Multi-Rail Escrow Architecture
              </h3>
              <p className={common.cardDesc} style={{ fontSize: '0.925rem', lineHeight: '1.6' }}>
                MegiLance provides high-assurance escrow payment routing, backing transactions via smart contract escrow rails (USDC) and PCI-DSS compliant credit card processing (Stripe). Funds are programmatically secured until milestone verification and approval.
              </p>
            </div>
          </ScrollReveal>

          {/* Dispute Resolution Section */}
          <ScrollReveal className={common.section} delay={0.25}>
            <h2 className={common.sectionTitle}>Dispute Resolution & Refunds</h2>
            <p className={common.cardDesc}>
              In the event of a disagreement, MegiLance provides a structured dispute window. Clients can request revisions or file a formal dispute before milestone approval. If a dispute is opened:
            </p>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: '1.6' }}>
              <li><strong>Arbitration Period:</strong> The escrowed funds remain locked in the contract, inaccessible to both parties.</li>
              <li><strong>Resolution:</strong> Our admin panel allows neutral mediators to review project milestones, chat logs, and deliverables to allocate funds fairly.</li>
              <li><strong>Refunds:</strong> If a mutual cancellation is agreed upon, the contract returns 100% of the milestone funds to the client's wallet.</li>
            </ul>
          </ScrollReveal>

          <ScrollReveal className={common.section} delay={0.3}>
            <h2 className={common.sectionTitle}>Responsible Disclosure</h2>
            <p className={common.cardDesc}>
              If you discover a security vulnerability, please report it to us at security@megilance.com. We appreciate
              the community&apos;s help in keeping our platform safe and may offer bounties for valid, responsibly disclosed
              vulnerabilities.
            </p>
            <div className={common.cta}>
              <a 
                href="mailto:security@megilance.com" 
                className={common.button} 
                aria-label="Email security team"
              >
                Contact Security
              </a>
              <button 
                onClick={() => setShowPolicy(true)}
                className={cn(common.button, common.buttonSecondary)} 
                aria-label="View security policy"
              >
                <FileText size={18} />
                View Policy
              </button>
            </div>
          </ScrollReveal>
        </div>
      </main>

      {/* Security Policy Modal */}
      {showPolicy && (
        <div className={cn(common.modal, themed.modal)} onClick={() => setShowPolicy(false)}>
          <div className={cn(common.modalContent, themed.modalContent)} onClick={(e) => e.stopPropagation()}>
            <button className={cn(common.modalClose, themed.modalClose)} onClick={() => setShowPolicy(false)}>
              <X size={24} />
            </button>
            <div className={common.modalHeader}>
              <Shield size={32} className={themed.modalIcon} />
              <h2>MegiLance Security Policy</h2>
              <p className={themed.modalSubtitle}>Version 1.0 - January 2025</p>
            </div>
            <div className={cn(common.modalBody, themed.modalBody)}>
              <section>
                <h3>1. Data Protection</h3>
                <ul>
                  <li>All data in transit is encrypted using TLS 1.3</li>
                  <li>Data at rest is encrypted using AES-256</li>
                  <li>Database access is restricted and audited</li>
                  <li>Regular backups with encrypted storage</li>
                </ul>
              </section>
              <section>
                <h3>2. Authentication & Access Control</h3>
                <ul>
                  <li>Passwords are hashed using bcrypt with cost factor 12</li>
                  <li>Two-factor authentication (TOTP) available</li>
                  <li>Session tokens expire after 30 minutes of inactivity</li>
                  <li>Role-based access control (RBAC) implementation</li>
                </ul>
              </section>
              <section>
                <h3>3. Payment Security</h3>
                <ul>
                  <li>PCI DSS compliant payment processing via Stripe</li>
                  <li>Escrow funds held in segregated accounts</li>
                  <li>Smart contract audits by third-party firms</li>
                  <li>Fraud detection using AI/ML algorithms</li>
                </ul>
              </section>
              <section>
                <h3>4. Infrastructure Security</h3>
                <ul>
                  <li>Hosted on enterprise-grade cloud infrastructure</li>
                  <li>DDoS protection and WAF enabled</li>
                  <li>Regular penetration testing</li>
                  <li>24/7 monitoring and incident response</li>
                </ul>
              </section>
              <section>
                <h3>5. Vulnerability Reporting</h3>
                <p>
                  Report security vulnerabilities to <a href="mailto:security@megilance.com">security@megilance.com</a>. 
                  Responsible disclosure is eligible for bug bounty rewards up to $10,000.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

export default Security;
