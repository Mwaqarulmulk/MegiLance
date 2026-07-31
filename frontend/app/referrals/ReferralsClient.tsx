// @AI-HINT: Referrals Dashboard Client Component
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/app/hooks/useThemeMode';
import { cn } from '@/lib/utils';
import Button from '@/app/components/atoms/Button/Button';
import Input from '@/app/components/atoms/Input/Input';
import Skeleton from '@/app/components/Animations/Skeleton/Skeleton';
import { StatGridSkeleton, FormSkeleton } from '@/app/components/Animations/Skeleton/SkeletonPresets';
import commonStyles from './Referrals.common.module.css';
import lightStyles from './Referrals.light.module.css';
import darkStyles from './Referrals.dark.module.css';

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  pending_rewards: number;
  total_earned: number;
  referral_code: string;
  referral_link: string;
}

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  reward_amount: number;
  created_at: string;
}

export function ReferralsClient() {
  const themeStyles = useThemeStyles(lightStyles, darkStyles);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Overview (code + url + aggregate stats) from /referrals/me
      const meRes = await fetch('/api/v1/referrals/me', { credentials: 'include' });
      if (meRes.ok) {
        const me = await meRes.json();
        setStats({
          total_referrals: me?.stats?.total_referrals ?? 0,
          active_referrals: me?.stats?.active_referrals ?? 0,
          pending_rewards: 0,
          total_earned: Number(me?.total_earned ?? 0),
          referral_code: me?.code ?? '',
          referral_link: me?.referral_url ?? '',
        });
      }

      // List from /referrals/history → { items: [...] }
      const listRes = await fetch('/api/v1/referrals/history', { credentials: 'include' });
      if (listRes.ok) {
        const data = await listRes.json();
        setReferrals(Array.isArray(data) ? data : (data?.items ?? []));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch referral data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Invitation sent successfully!' });
        setInviteEmail('');
        fetchData(); // Refresh list
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to send invitation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setInviting(false);
    }
  };

  const copyLink = () => {
    if (stats?.referral_link) {
      navigator.clipboard.writeText(stats.referral_link);
      setMessage({ type: 'success', text: 'Referral link copied to clipboard!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className={cn(commonStyles.container, themeStyles.container, 'space-y-8 animate-pulse')}>
        <div className="space-y-2">
          <Skeleton width={220} height={28} radius={8} />
          <Skeleton width={320} height={14} radius={6} />
        </div>
        <StatGridSkeleton count={3} />
        <FormSkeleton fields={2} />
      </div>
    );
  }

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <h1 className={cn(commonStyles.title, themeStyles.title)}>Referral Program</h1>
      <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
        Invite friends and earn rewards when they join MegiLance.
      </p>

      {/* Stats Cards */}
      <div className={commonStyles.statsGrid}>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <span className={commonStyles.statLabel}>Total Referrals</span>
          <span className={commonStyles.statValue}>{stats?.total_referrals || 0}</span>
        </div>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <span className={commonStyles.statLabel}>Total Earnings</span>
          <span className={commonStyles.statValue}>${stats?.total_earned || 0}</span>
        </div>
        <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
          <span className={commonStyles.statLabel}>Pending</span>
          <span className={commonStyles.statValue}>${stats?.pending_rewards || 0}</span>
        </div>
      </div>

      {/* Invite Section */}
      <div className={cn(commonStyles.section, themeStyles.section)}>
        <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Invite Friends</h2>
        
        <div className={commonStyles.linkBox}>
          <span className={themeStyles.linkText}>{stats?.referral_link}</span>
          <Button variant="outline" size="sm" onClick={copyLink}>
            Copy Link
          </Button>
        </div>

        <div className={commonStyles.divider}>OR</div>

        <form onSubmit={handleInvite} className={commonStyles.inviteForm}>
          <Input
            label="Email Address"
            type="email"
            placeholder="friend@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Button variant="primary" type="submit" isLoading={inviting}>
            Send Invitation
          </Button>
        </form>

        {message && (
          <div className={cn(commonStyles.message, message.type === 'success' ? commonStyles.success : commonStyles.error)}>
            {message.text}
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className={cn(commonStyles.section, themeStyles.section)}>
        <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>Your Referrals</h2>
        {referrals.length === 0 ? (
          <p className={themeStyles.emptyText}>No referrals yet. Start inviting!</p>
        ) : (
          <div className={commonStyles.tableContainer}>
            <table className={cn(commonStyles.table, themeStyles.table)}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Reward</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td>{ref.referred_email}</td>
                    <td>
                      <span className={cn(commonStyles.statusBadge, commonStyles[ref.status])}>
                        {ref.status}
                      </span>
                    </td>
                    <td>{new Date(ref.created_at).toLocaleDateString()}</td>
                    <td>${ref.reward_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
