// @AI-HINT: User dispute center for clients and freelancers.
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, FileText, Plus, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/app/components/atoms/Button/Button';
import Badge from '@/app/components/atoms/Badge/Badge';
import Loading from '@/app/components/atoms/Loading/Loading';

interface Dispute {
  id: number;
  contract_id: number;
  raised_by: number;
  dispute_type: string;
  description: string;
  status: string;
  created_at: string;
}

function statusVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'open':
      return 'danger';
    case 'in_review':
      return 'warning';
    case 'resolved':
      return 'success';
    case 'closed':
      return 'secondary';
    case 'escalated':
      return 'info';
    default:
      return 'secondary';
  }
}

function formatDisputeType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function DisputesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  const contractsPath = user?.role === 'freelancer' ? '/freelancer/contracts' : '/client/contracts';

  const loadDisputes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.disputes.list({ page: 1, page_size: 50 }) as any;
      setDisputes(Array.isArray(data) ? data : data.disputes || data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadDisputes();
  }, [authLoading]);

  const counts = useMemo(() => ({
    open: disputes.filter(d => d.status === 'open').length,
    inReview: disputes.filter(d => d.status === 'in_review').length,
    resolved: disputes.filter(d => ['resolved', 'closed'].includes(d.status)).length,
  }), [disputes]);

  if (loading) return <Loading text="Loading disputes..." />;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold">
            <AlertTriangle size={26} /> Dispute Center
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track contract issues, upload evidence, and follow resolution progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadDisputes}>
            <RefreshCw size={16} /> Refresh
          </Button>
          <Button variant="primary" onClick={() => router.push(contractsPath)}>
            <Plus size={16} /> Start from Contract
          </Button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-2xl font-semibold">{counts.open}</div>
          <div className="text-sm text-slate-500">Open</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-2xl font-semibold">{counts.inReview}</div>
          <div className="text-sm text-slate-500">In Review</div>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div className="text-2xl font-semibold">{counts.resolved}</div>
          <div className="text-sm text-slate-500">Resolved</div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {disputes.length === 0 ? (
        <section className="rounded-lg border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
          <FileText className="mx-auto mb-3 text-slate-400" size={36} />
          <h2 className="text-xl font-semibold">No disputes yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            File disputes from an active contract when payment, scope, quality, or deadline issues cannot be resolved directly.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          {disputes.map(dispute => (
            <Link
              key={dispute.id}
              href={`/disputes/${dispute.id}`}
              className="block border-b border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{formatDisputeType(dispute.dispute_type)}</span>
                    <Badge variant={statusVariant(dispute.status) as any}>
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Contract #{dispute.contract_id}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {dispute.description}
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(dispute.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
