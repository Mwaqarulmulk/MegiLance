import SystemStatus from '@/app/components/SystemStatus/SystemStatus';

export const metadata = {
  title: 'System Status | MegiLance',
  description: 'Real-time system health and API endpoint status',
};

export default function SystemStatusPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg-page, #f5f5f5)' }}>
      <SystemStatus />
    </main>
  );
}
