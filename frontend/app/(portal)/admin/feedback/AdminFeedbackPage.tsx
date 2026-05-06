'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageTransition } from '@/app/components/Animations/PageTransition';
import { ScrollReveal } from '@/app/components/Animations/ScrollReveal';
import Button from '@/app/components/atoms/Button/Button';
import {
  Bug,
  Lightbulb,
  MessageSquare,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  RefreshCw,
  ChevronDown,
  X,
  Eye,
  Flag,
  TrendingUp,
  Users,
} from 'lucide-react';
import api from '@/lib/api';

type FeedbackType = 'bug_report' | 'feature_request' | 'general' | 'improvement' | 'complaint' | string;
type FeedbackStatus = 'open' | 'in_review' | 'resolved' | 'closed' | string;

interface FeedbackItem {
  id: string | number;
  type: FeedbackType;
  title: string;
  description: string;
  category?: string;
  status: FeedbackStatus;
  user_name?: string;
  user_email?: string;
  created_at: string;
  rating?: number;
  votes?: number;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  bug_report: { label: 'Bug', icon: <Bug size={14} />, color: 'red' },
  feature_request: { label: 'Feature', icon: <Lightbulb size={14} />, color: 'amber' },
  improvement: { label: 'Improvement', icon: <Zap size={14} />, color: 'blue' },
  general: { label: 'General', icon: <MessageSquare size={14} />, color: 'green' },
  complaint: { label: 'Complaint', icon: <Flag size={14} />, color: 'red' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'blue' },
  in_review: { label: 'In Review', color: 'amber' },
  resolved: { label: 'Resolved', color: 'green' },
  closed: { label: 'Closed', color: 'gray' },
};

// Demo data for when API is not available
const DEMO_ITEMS: FeedbackItem[] = [
  {
    id: 1, type: 'bug_report', title: 'Payment page crashes on Safari', status: 'open',
    description: 'When I click Pay on iOS Safari the page goes blank. Steps: 1. Open payment modal 2. Enter card 3. Click pay.',
    user_name: 'John Smith', user_email: 'john@example.com', created_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'high', rating: 2,
  },
  {
    id: 2, type: 'feature_request', title: 'Add dark mode to mobile app', status: 'in_review',
    description: 'Would love a dark mode option. Many competitors have it and it reduces eye strain.',
    user_name: 'Maria Garcia', user_email: 'maria@example.com', created_at: new Date(Date.now() - 172800000).toISOString(),
    category: 'medium', rating: 5, votes: 24,
  },
  {
    id: 3, type: 'improvement', title: 'Search results are slow to load', status: 'open',
    description: 'Searching for freelancers takes 3-4 seconds. Please optimize.',
    user_name: 'Ahmed Hassan', user_email: 'ahmed@example.com', created_at: new Date(Date.now() - 259200000).toISOString(),
    category: 'high', rating: 3, votes: 8,
  },
  {
    id: 4, type: 'general', title: 'Great platform, love the AI matching!', status: 'closed',
    description: 'Just wanted to say the AI-powered freelancer matching is excellent. Found a great developer in minutes.',
    user_name: 'Sarah Lee', user_email: 'sarah@example.com', created_at: new Date(Date.now() - 432000000).toISOString(),
    category: 'low', rating: 5, votes: 2,
  },
  {
    id: 5, type: 'bug_report', title: 'Profile image upload fails for PNG files', status: 'resolved',
    description: 'PNG images fail to upload with "invalid format" error. JPG works fine.',
    user_name: 'Mike Brown', user_email: 'mike@example.com', created_at: new Date(Date.now() - 604800000).toISOString(),
    category: 'critical', rating: 1,
  },
];

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  } catch { return dateStr; }
}

export default function AdminFeedbackPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [items, setItems] = useState<FeedbackItem[]>(DEMO_ITEMS);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FeedbackType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | number | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await (api as any).get('/feedback?limit=100');
      if (Array.isArray(data)) setItems(data);
      else if (data?.items) setItems(data.items);
      else setItems(DEMO_ITEMS);
    } catch {
      setItems(DEMO_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (id: string | number, status: FeedbackStatus) => {
    setUpdatingStatus(id);
    try {
      await (api as any).patch(`/feedback/${id}/status`, { status });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch { /* silent */ } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = items.filter(i => {
    if (filterType !== 'all' && i.type !== filterType) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    bugs: items.filter(i => i.type === 'bug_report').length,
    features: items.filter(i => i.type === 'feature_request').length,
    avgRating: items.filter(i => i.rating).reduce((s, i) => s + (i.rating || 0), 0) / (items.filter(i => i.rating).length || 1),
  };

  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-white/50' : 'text-gray-500';
  const rowHover = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50';

  const typeBadge = (type: FeedbackType) => {
    const cfg = TYPE_CONFIG[type] || { label: type, icon: <MessageSquare size={14} />, color: 'gray' };
    const colors: Record<string, string> = {
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', colors[cfg.color])}>
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const statusBadge = (status: FeedbackStatus) => {
    const cfg = STATUS_CONFIG[status] || { label: status, color: 'gray' };
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', colors[cfg.color])}>
        {cfg.label}
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn('text-2xl font-bold', textPrimary)}>User Feedback & Reports</h1>
              <p className={cn('text-sm mt-1', textMuted)}>Review and respond to user-submitted feedback, bugs, and feature requests.</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchItems} isLoading={loading}>
              <RefreshCw size={14} /> Refresh
            </Button>
          </div>
        </ScrollReveal>

        {/* Stats Row */}
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: stats.total, icon: <MessageSquare size={18} />, color: 'indigo' },
              { label: 'Open', value: stats.open, icon: <Clock size={18} />, color: 'blue' },
              { label: 'Bug Reports', value: stats.bugs, icon: <Bug size={18} />, color: 'red' },
              { label: 'Feature Requests', value: stats.features, icon: <Lightbulb size={18} />, color: 'amber' },
              { label: 'Avg Rating', value: stats.avgRating.toFixed(1), icon: <Star size={18} />, color: 'green' },
            ].map(stat => (
              <div key={stat.label} className={cn('rounded-xl border p-4', cardBg)}>
                <div className={cn('text-xs mb-2', textMuted)}>{stat.label}</div>
                <div className={cn('text-2xl font-bold', textPrimary)}>{stat.value}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.1}>
          <div className={cn('flex items-center gap-3 flex-wrap rounded-xl border p-4', cardBg)}>
            <Filter size={16} className={textMuted} />
            <div className="flex gap-2 flex-wrap">
              {(['all', 'bug_report', 'feature_request', 'improvement', 'general'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                    filterType === t
                      ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                      : (isDark ? 'border-white/10 text-white/60 hover:border-white/30' : 'border-gray-200 text-gray-500 hover:border-gray-400')
                  )}
                >
                  {t === 'all' ? 'All Types' : TYPE_CONFIG[t]?.label || t}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-300 dark:bg-white/10 hidden md:block" />
            <div className="flex gap-2 flex-wrap">
              {(['all', 'open', 'in_review', 'resolved', 'closed'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium border transition-all',
                    filterStatus === s
                      ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 border-indigo-600 text-white')
                      : (isDark ? 'border-white/10 text-white/60 hover:border-white/30' : 'border-gray-200 text-gray-500 hover:border-gray-400')
                  )}
                >
                  {s === 'all' ? 'All Status' : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Table */}
        <ScrollReveal delay={0.15}>
          <div className={cn('rounded-xl border overflow-hidden', cardBg)}>
            <table className="w-full text-sm">
              <thead>
                <tr className={cn('border-b text-xs font-semibold uppercase tracking-wider', isDark ? 'border-white/10 text-white/40' : 'border-gray-200 text-gray-400')}>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">User</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Rating</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className={cn('px-4 py-12 text-center', textMuted)}>No feedback found for the selected filters.</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.id} className={cn('border-b transition-colors cursor-pointer', isDark ? 'border-white/5' : 'border-gray-100', rowHover)}>
                    <td className="px-4 py-3">{typeBadge(item.type)}</td>
                    <td className="px-4 py-3">
                      <div className={cn('font-medium truncate max-w-xs', textPrimary)}>{item.title}</div>
                      <div className={cn('text-xs truncate max-w-xs mt-0.5', textMuted)}>{item.description.slice(0, 80)}…</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className={cn('text-xs', textMuted)}>{item.user_name || '—'}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className={cn('text-xs', textMuted)}>{formatDate(item.created_at)}</div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(item.status)}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {item.rating ? (
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className={cn('text-xs', textMuted)}>{item.rating}/5</span>
                        </div>
                      ) : <span className={cn('text-xs', textMuted)}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className={cn('p-1.5 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors', isDark ? 'text-white/60' : 'text-gray-500')}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {item.status === 'open' && (
                          <button
                            onClick={() => updateStatus(item.id, 'in_review')}
                            disabled={updatingStatus === item.id}
                            className="px-2 py-1 rounded text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:opacity-80 transition-opacity"
                          >
                            Review
                          </button>
                        )}
                        {(item.status === 'open' || item.status === 'in_review') && (
                          <button
                            onClick={() => updateStatus(item.id, 'resolved')}
                            disabled={updatingStatus === item.id}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:opacity-80 transition-opacity"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>

        {/* Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn('w-full max-w-xl rounded-2xl border p-6 shadow-2xl', isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200')}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {typeBadge(selected.type)}
                  {statusBadge(selected.status)}
                  {selected.category && (
                    <span className={cn('text-xs px-2 py-0.5 rounded border', isDark ? 'border-white/10 text-white/50' : 'border-gray-200 text-gray-400')}>
                      Priority: {selected.category}
                    </span>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className={cn('p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10', textMuted)}>
                  <X size={18} />
                </button>
              </div>

              <h2 className={cn('text-lg font-semibold mb-2', textPrimary)}>{selected.title}</h2>

              <div className={cn('p-4 rounded-lg mb-4 text-sm whitespace-pre-wrap', isDark ? 'bg-white/5 text-white/70' : 'bg-gray-50 text-gray-700')}>
                {selected.description}
              </div>

              <div className={cn('flex items-center justify-between text-xs mb-4', textMuted)}>
                <span>By: {selected.user_name || 'Anonymous'} {selected.user_email ? `(${selected.user_email})` : ''}</span>
                <span>{formatDate(selected.created_at)}</span>
              </div>

              {selected.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={16} className={s <= selected.rating! ? 'text-amber-400 fill-amber-400' : (isDark ? 'text-white/20' : 'text-gray-300')} />
                  ))}
                  <span className={cn('text-xs ml-1', textMuted)}>{selected.rating}/5 rating</span>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {(['open', 'in_review', 'resolved', 'closed'] as FeedbackStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    disabled={selected.status === s || updatingStatus === selected.id}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      selected.status === s
                        ? (isDark ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-600 text-white border-indigo-600')
                        : (isDark ? 'border-white/10 text-white/60 hover:border-white/30' : 'border-gray-200 text-gray-500 hover:border-gray-400'),
                      (selected.status === s || updatingStatus === selected.id) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
