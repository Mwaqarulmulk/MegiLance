import type { Metadata } from 'next';
import InstallClient from './InstallClient';
import { buildMeta, buildBreadcrumbJsonLd, buildSoftwareAppJsonLd, jsonLdScriptProps } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: 'Install MegiLance App - PWA for iOS, Android & Desktop',
    description: 'Install the MegiLance Progressive Web App on any device. Get instant push notifications, offline access, faster loading, and a native app experience. Available on iOS, Android, Windows, Mac, and Linux.',
    path: '/install',
    keywords: [
      'MegiLance app', 'install MegiLance', 'freelance app download', 'MegiLance PWA',
      'freelance mobile app', 'MegiLance desktop app', 'progressive web app freelancing',
    ],
  });
}

export default function Page() {
  return (
    <>
      <script {...jsonLdScriptProps(buildSoftwareAppJsonLd())} />
      <script {...jsonLdScriptProps(
        buildBreadcrumbJsonLd([{ name: 'Install App', path: '/install' }])
      )} />
      <InstallClient />
    </>
  );
}
