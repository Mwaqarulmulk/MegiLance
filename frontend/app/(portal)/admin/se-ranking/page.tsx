'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Activity, Search, AlertCircle, RefreshCw, 
  Settings as SettingsIcon, ShieldAlert, BarChart3, CheckCircle2, Globe, Link2
} from 'lucide-react';
import { BASE_URL } from '@/lib/seo';

interface Keyword {
  id: number;
  keyword: string;
  search_volume: number;
  competition: number;
  cpc: number;
}

interface RankingHistory {
  keyword: string;
  positions: number[];
}

interface AuditData {
  health_score: number;
  pages_crawled: number;
  passed_checks: number;
  warnings: number;
  errors: number;
  notices: number;
  core_web_vitals?: {
    lcp: string;
    fid: string;
    cls: string;
  };
  last_audit_time?: string;
}

interface ConfigStatus {
  configured: boolean;
  site_id: string | null;
  using_mock_data: boolean;
}

export default function SERankingDashboard() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [rankings, setRankings] = useState<{ dates: string[]; rankings: RankingHistory[] }>({ dates: [], rankings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const [configRes, auditRes, keywordsRes, rankingsRes] = await Promise.all([
        fetch(`${backendUrl}/api/se-ranking/status`),
        fetch(`${backendUrl}/api/se-ranking/audit`),
        fetch(`${backendUrl}/api/se-ranking/keywords`),
        fetch(`${backendUrl}/api/se-ranking/rankings`)
      ]);

      if (!configRes.ok || !auditRes.ok || !keywordsRes.ok || !rankingsRes.ok) {
        throw new Error('Failed to retrieve SE Ranking details from API');
      }

      setConfig(await configRes.json());
      setAudit(await auditRes.json());
      setKeywords(await keywordsRes.json());
      setRankings(await rankingsRes.json());
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred fetching SE Ranking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Fetching SE Ranking performance data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600 w-8 h-8" />
            <span>SE Ranking SEO Campaign Dashboard</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor keyword positions, site health, and performance of MegiLance AI Tools.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Warning/Alert Banner if using Mock Data */}
      {config?.using_mock_data && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <strong>Demo Sandbox Mode:</strong> Real SE Ranking API credentials are not configured. Showing local simulation benchmarks for MegiLance tools.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900/50 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Site Health */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">SEO Health Score</span>
            <span className="p-2 bg-green-50 dark:bg-green-950/30 rounded-xl text-green-600"><Award className="w-5 h-5" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{audit?.health_score}%</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-slate-500 font-medium">Optimal site structural health</span>
            </div>
          </div>
        </div>

        {/* Crawled Pages */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Indexed Pages</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-blue-600"><Globe className="w-5 h-5" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{audit?.pages_crawled}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <Link2 className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-slate-500 font-medium">Includes programmatic directories</span>
            </div>
          </div>
        </div>

        {/* Errors & Warnings */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Critical Errors</span>
            <span className="p-2 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-600"><ShieldAlert className="w-5 h-5" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-red-600">{audit?.errors}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-red-500">
              <span className="text-xs font-semibold">{audit?.warnings} Warnings flag-resolved</span>
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-500 font-semibold uppercase tracking-wider">LCP Performance</span>
            <span className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600"><Activity className="w-5 h-5" /></span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{audit?.core_web_vitals?.lcp || '1.8s'}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs text-slate-500 font-medium">CLS: {audit?.core_web_vitals?.cls || '0.04'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keywords Table list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-950 rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span>Tracked Target Keywords</span>
            </h2>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-2 py-1 rounded-full">
              {keywords.length} Target Keywords
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Keyword</th>
                  <th className="px-6 py-4 text-right">Search Volume</th>
                  <th className="px-6 py-4 text-right">Competition</th>
                  <th className="px-6 py-4 text-right">Est. CPC ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-semibold text-slate-950 dark:text-white">{kw.keyword}</td>
                    <td className="px-6 py-4 text-right">{kw.search_volume.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        kw.competition > 40 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {kw.competition}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">${kw.cpc.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rankings Progress history */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="font-bold text-slate-950 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Keyword Rank Progress</span>
            </h2>
          </div>
          <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[450px]">
            {rankings.rankings.map((rk, idx) => {
              const currentPos = rk.positions[rk.positions.length - 1];
              const prevPos = rk.positions[rk.positions.length - 2] || currentPos;
              const diff = prevPos - currentPos;

              return (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-950 dark:text-white">{rk.keyword}</h4>
                    <span className="text-xs text-slate-500">History: {rk.positions.join(' → ')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-950 dark:text-white">#{currentPos}</span>
                    {diff !== 0 && (
                      <span className={`block text-xs font-semibold ${diff > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {diff > 0 ? `▲ +${diff}` : `▼ ${diff}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
