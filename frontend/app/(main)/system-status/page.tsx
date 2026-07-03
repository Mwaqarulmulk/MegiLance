import SystemStatus from '@/app/components/SystemStatus/SystemStatus';
import { buildMeta } from '@/lib/seo';

export const metadata = buildMeta({
  title: 'System Status | MegiLance',
  description: 'Real-time system health and API endpoint status for the MegiLance freelancing platform.',
  path: '/system-status',
});

export default function SystemStatusPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-page, #f5f5f5)' }}>
      <SystemStatus />
    </main>
  );
}
