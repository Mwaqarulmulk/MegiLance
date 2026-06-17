import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Privacy Policy | MegiLance',
  description: 'MegiLance privacy policy - how we collect, use, and protect your personal data. GDPR compliant, transparent data practices.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '6rem 2rem 4rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-primary, #0f172a)' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-secondary, #64748b)', marginBottom: '1.5rem' }}>Last updated: March 2026</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>1. Information We Collect</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          We collect information you provide directly, including your name, email address, payment information, profile details, and communication data. We also automatically collect usage data, device information, and cookies to improve our platform.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>2. How We Use Your Information</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          Your information is used to provide and improve our services, process transactions, match freelancers with clients, communicate with you, ensure platform security, and comply with legal obligations.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>3. Data Sharing</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          We do not sell your personal information. We may share data with service providers who assist in platform operations, payment processors for transactions, and as required by law. All third parties are bound by strict data protection agreements.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>4. Data Security</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>5. Your Rights</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          You have the right to access, correct, or delete your personal data. You can also opt out of marketing communications and request data portability. Contact us at support@megilance.site to exercise these rights.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>6. Cookies</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8, marginBottom: '1rem' }}>
          We use essential cookies for platform functionality and optional analytics cookies to improve our services. You can manage cookie preferences through your browser settings.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary, #0f172a)' }}>7. Contact Us</h2>
        <p style={{ color: 'var(--text-secondary, #475569)', lineHeight: 1.8 }}>
          For privacy-related inquiries, contact us at <a href="mailto:support@megilance.site" style={{ color: 'var(--ml-blue, #4573df)' }}>support@megilance.site</a>.
        </p>
      </section>
    </main>
  );
}
