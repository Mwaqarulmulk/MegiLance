import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Terms of Service | MegiLance',
  description: 'MegiLance terms of service - the rules and guidelines for using our AI-powered freelancing platform.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary, #0f172a)' }}>Terms of Service</h1>
      <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem' }}>Last updated: March 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>1. Acceptance of Terms</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          By accessing or using MegiLance, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>2. Platform Description</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          MegiLance is an AI-powered freelancing platform that connects clients with freelancers. We provide tools for project management, secure payments via escrow, real-time messaging, and AI-assisted matching.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>3. User Accounts</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. One person may not maintain more than one account.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>4. Fees and Payments</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          MegiLance charges a platform fee on payments processed through the platform. Fee structures are outlined in our Pricing page. Escrow payments protect both clients and freelancers during project milestones.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>5. User Conduct</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Users must act professionally and ethically. Harassment, fraud, misrepresentation, and violation of intellectual property rights are prohibited. We reserve the right to suspend accounts that violate these terms.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>6. Intellectual Property</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Unless otherwise agreed, freelancers retain ownership of their work product. Clients receive rights upon full payment as defined in the project contract. MegiLance retains ownership of its platform and AI technology.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>7. Limitation of Liability</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          MegiLance facilitates connections between clients and freelancers but is not a party to service agreements. We are not liable for the quality of work, disputes between users, or damages arising from platform use.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>8. Termination</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Either party may terminate the agreement with proper notice. We reserve the right to suspend or terminate accounts for violations of these terms.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>9. Contact</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8 }}>
          For questions about these terms, contact us at <a href="mailto:support@megilance.site" style={{ color: 'var(--ml-blue, #4573df)' }}>support@megilance.site</a>.
        </p>
      </section>
    </main>
  );
}
