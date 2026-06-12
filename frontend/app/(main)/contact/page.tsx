import type { Metadata } from 'next';
import { buildMeta } from '../../../lib/seo';

export const metadata: Metadata = buildMeta({
  title: 'Contact MegiLance | Support, Sales & Partnership Inquiries',
  description: 'Get in touch with the MegiLance team. Reach support for platform help, sales for enterprise plans, or partnerships for integration opportunities. We respond within 24 hours.',
  path: '/contact',
  keywords: [
    'contact megilance', 'megilance support', 'megilance customer service',
    'freelance platform support', 'megilance sales', 'megilance partnerships',
    'help with megilance account', 'megilance email contact',
  ],
});

// @AI-HINT: Contact page route — delegates to the premium Contact component
import Contact from "./Contact";

export default function ContactPage() {
  return <Contact />;
}
