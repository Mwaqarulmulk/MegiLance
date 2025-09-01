// @AI-HINT: Route entry for Contact page with metadata.
import type { Metadata } from 'next';
import Contact from './Contact';

export const metadata: Metadata = {
  title: 'Contact Us – MegiLance Support & Sales',
  description: 'Get in touch with the MegiLance team for support, sales, or general inquiries. We usually respond within 24 hours.',
  openGraph: {
    title: 'Contact MegiLance',
    description: 'Reach our team for help and partnership opportunities.'
  }
};

export default function ContactPage() { return <Contact />; }
