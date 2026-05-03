// @AI-HINT: Onboarding layout – provides SEO metadata (noindex since it's auth-gated)
import { buildMeta } from '@/lib/seo';

export const metadata = buildMeta({
  title: 'Get Started',
  description:
    'Set up your MegiLance profile. Choose your role, add skills, and start freelancing or hiring in minutes.',
  path: '/onboarding',
  noindex: true, // Auth-gated page – don't index
});

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
