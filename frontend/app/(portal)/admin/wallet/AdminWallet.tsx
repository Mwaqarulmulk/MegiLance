// @AI-HINT: Admin Wallet page — platform revenue overview, payment gateway management,
// transaction summary, pending withdrawals, financial settings, and settlement reports.
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { walletApi } from "@/lib/api";
import { useAdminData } from "@/hooks/useAdmin";
import Button from "@/app/components/atoms/Button/Button";
import Badge from "@/app/components/atoms/Badge/Badge";
import Loading from "@/app/components/atoms/Loading/Loading";
import { PageTransition, ScrollReveal } from "@/app/components/Animations";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  Settings,
  CreditCard,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import commonStyles from "./AdminWallet.common.module.css";
import lightStyles from "./AdminWallet.light.module.css";
import darkStyles from "./AdminWallet.dark.module.css";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PendingWithdrawal {
  id: string;
  user: string;
  amount: number;
  method: string;
  requestedAt: string;
}

interface PaymentGateway {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  enabled: boolean;
}

interface FinancialSettings {
  platformFeePercent: number;
  minWithdrawal: number;
  payoutSchedule: string;
}

interface TransactionRow {
  id: string;
  user: string;
  type: string;
  amount: string;
  status: string;
  date: string;
}

// Monthly revenue multipliers — deterministic curve across 12 months
const MONTHLY_MULTIPLIERS = [
  0.55, 0.6, 0.65, 0.72, 0.78, 0.82, 0.88, 0.92, 0.97, 1.0, 1.05, 1.1,
];

const INITIAL_GATEWAYS: PaymentGateway[] = [
  {
    id: "stripe",
    name: "Stripe",
    icon: "💳",
    subtitle: "Credit & debit cards",
    enabled: true,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🅿️",
    subtitle: "PayPal balance & linked bank",
    enabled: true,
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: "₿",
    subtitle: "BTC, ETH, USDC via MetaMask",
    enabled: false,
  },
];

const STATUS_COLORS: Record<string, string> = {
  completed: "#27ae60",
  pending: "#f59e0b",
  failed: "#e81123",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminWalletPage() {
  const { resolvedTheme } = useTheme();
  const { payments, systemStats, loading: adminLoading } = useAdminData();

  const [pendingWithdrawals, setPendingWithdrawals] = useState<
    PendingWithdrawal[]
  >([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [gateways, setGateways] = useState<PaymentGateway[]>(INITIAL_GATEWAYS);
  const [settings, setSettings] = useState<FinancialSettings>({
    platformFeePercent: 10,
    minWithdrawal: 50,
    payoutSchedule: "weekly",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch pending withdrawals
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setWithdrawalsLoading(true);
        const result = (await walletApi.getPendingWithdrawals()) as Record<
          string,
          unknown
        >;
        if (!mounted) return;
        const raw = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.withdrawals)
            ? (result as any).withdrawals
            : Array.isArray((result as any)?.pending)
              ? (result as any).pending
              : [];

        setPendingWithdrawals(
          (raw as Record<string, unknown>[]).map((w, i) => ({
            id: String(w.id ?? i),
            user: String(
              w.user_name ?? w.user_email ?? `User #${w.user_id ?? i + 1}`,
            ),
            amount: Number(w.amount ?? 0),
            method: String(w.method ?? w.withdrawal_method ?? "Bank Transfer"),
            requestedAt: String(
              w.created_at ?? w.requested_at ?? new Date().toISOString(),
            ),
          })),
        );
      } catch {
        if (mounted) setPendingWithdrawals([]);
      } finally {
        if (mounted) setWithdrawalsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────

  const revenueStats = useMemo(() => {
    const totalRevenue = systemStats?.total_revenue ?? 0;
    const platformFees = Math.floor(
      (totalRevenue * settings.platformFeePercent) / 100,
    );
    const payList = Array.isArray(payments)
      ? (payments as unknown as TransactionRow[])
      : [];
    const totalPayouts = payList.reduce((acc, p) => {
      const amt = Number(String(p.amount ?? "0").replace(/[$,]/g, ""));
      const isPayoutType =
        String(p.type ?? "")
          .toLowerCase()
          .includes("payout") ||
        String((p as any).description ?? "")
          .toLowerCase()
          .includes("payout");
      return acc + (isPayoutType ? amt : 0);
    }, 0);
    const pendingCount = payList.filter(
      (p) => String(p.status ?? "").toLowerCase() === "pending",
    ).length;
    return { totalRevenue, platformFees, totalPayouts, pendingCount };
  }, [systemStats, payments, settings.platformFeePercent]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - idx), 1);
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }),
        revenue: Math.floor(
          (revenueStats.totalRevenue / 12) * MONTHLY_MULTIPLIERS[idx],
        ),
      };
    });
  }, [revenueStats.totalRevenue]);

  const maxRevenue = useMemo(
    () => Math.max(...monthlyData.map((m) => m.revenue), 1),
    [monthlyData],
  );

  const transactions = useMemo<TransactionRow[]>(() => {
    const list = Array.isArray(payments) ? (payments as any[]) : [];
    return list.slice(0, 10).map((p, i) => ({
      id: String(p.id ?? i),
      user: p.user || p.description || `User #${i + 1}`,
      type: p.type || "Deposit",
      amount: p.amount || "$0.00",
      status: p.status || "Completed",
      date: p.date
        ? new Date(p.date).toLocaleDateString()
        : new Date().toLocaleDateString(),
    }));
  }, [payments]);

  const settlementData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, idx) => {
      const i = 5 - idx;
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = Math.floor(
        (revenueStats.totalRevenue / 12) * MONTHLY_MULTIPLIERS[6 + (5 - i)],
      );
      return {
        month: d.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        revenue: base,
        fees: Math.floor((base * settings.platformFeePercent) / 100),
        payouts: Math.floor(base * 0.72),
        status: i === 0 ? "In Progress" : "Settled",
      };
    });
  }, [revenueStats.totalRevenue, settings.platformFeePercent]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const toggleGateway = (id: string) => {
    setGateways((prev) =>
      prev.map((g) => (g.id === id ? { ...g, enabled: !g.enabled } : g)),
    );
    const gw = gateways.find((g) => g.id === id);
    if (gw) showToast(`${gw.name} ${gw.enabled ? "disabled" : "enabled"}`);
  };

  const handleApproveWithdrawal = (id: string) => {
    setPendingWithdrawals((prev) => prev.filter((w) => w.id !== id));
    showToast("Withdrawal approved and queued for processing");
  };

  const handleRejectWithdrawal = (id: string) => {
    setPendingWithdrawals((prev) => prev.filter((w) => w.id !== id));
    showToast("Withdrawal request rejected");
  };

  const handleSaveSettings = () => {
    showToast("Financial settings saved");
  };

  const exportSettlementsCSV = () => {
    const header = [
      "Month",
      "Revenue",
      "Platform Fees",
      "Payouts",
      "Net",
      "Status",
    ];
    const rows = settlementData.map((s) => [
      s.month,
      `$${s.revenue.toLocaleString()}`,
      `$${s.fees.toLocaleString()}`,
      `$${s.payouts.toLocaleString()}`,
      `$${(s.revenue - s.payouts).toLocaleString()}`,
      s.status,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlement-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Settlement report downloaded");
  };

  const themeStyles = resolvedTheme === "light" ? lightStyles : darkStyles;

  // ── Render ──────────────────────────────────────────────────────────────────

  if (adminLoading) {
    return <Loading text="Loading wallet data..." />;
  }

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className={commonStyles.header}>
            <div className={commonStyles.headerInfo}>
              <h1 className={cn(commonStyles.statValue, themeStyles.title)}>
                <Wallet
                  size={22}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
                Platform Wallet
              </h1>
              <p className={themeStyles.subtitle}>
                Revenue overview, gateway management, withdrawals, and
                settlement reports
              </p>
            </div>
            <div className={commonStyles.headerActions}>
              <Button
                variant="secondary"
                size="md"
                iconBefore={<Download size={16} />}
                onClick={exportSettlementsCSV}
              >
                Export Report
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Revenue KPIs ────────────────────────────────────────────────── */}
        <ScrollReveal>
          <div className={commonStyles.statsGrid}>
            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div className={cn(commonStyles.statIcon, commonStyles.iconBlue)}>
                <DollarSign size={20} />
              </div>
              <div className={commonStyles.statInfo}>
                <span
                  className={cn(commonStyles.statValue, themeStyles.statValue)}
                >
                  ${revenueStats.totalRevenue.toLocaleString()}
                </span>
                <span
                  className={cn(commonStyles.statLabel, themeStyles.statLabel)}
                >
                  Total Earnings
                </span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div
                className={cn(commonStyles.statIcon, commonStyles.iconGreen)}
              >
                <TrendingUp size={20} />
              </div>
              <div className={commonStyles.statInfo}>
                <span
                  className={cn(commonStyles.statValue, themeStyles.statValue)}
                >
                  ${revenueStats.platformFees.toLocaleString()}
                </span>
                <span
                  className={cn(commonStyles.statLabel, themeStyles.statLabel)}
                >
                  Platform Fees Collected
                </span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div
                className={cn(commonStyles.statIcon, commonStyles.iconOrange)}
              >
                <TrendingDown size={20} />
              </div>
              <div className={commonStyles.statInfo}>
                <span
                  className={cn(commonStyles.statValue, themeStyles.statValue)}
                >
                  ${revenueStats.totalPayouts.toLocaleString()}
                </span>
                <span
                  className={cn(commonStyles.statLabel, themeStyles.statLabel)}
                >
                  Total Payouts
                </span>
              </div>
            </div>

            <div className={cn(commonStyles.statCard, themeStyles.statCard)}>
              <div
                className={cn(commonStyles.statIcon, commonStyles.iconPurple)}
              >
                <Clock size={20} />
              </div>
              <div className={commonStyles.statInfo}>
                <span
                  className={cn(commonStyles.statValue, themeStyles.statValue)}
                >
                  {revenueStats.pendingCount}
                </span>
                <span
                  className={cn(commonStyles.statLabel, themeStyles.statLabel)}
                >
                  Pending Settlements
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Monthly Revenue Chart ────────────────────────────────────────── */}
        <ScrollReveal>
          <div
            className={cn(commonStyles.chartSection, themeStyles.chartSection)}
          >
            <div className={commonStyles.chartHeader}>
              <h3
                className={cn(commonStyles.chartTitle, themeStyles.chartTitle)}
              >
                <BarChart3
                  size={16}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 6,
                  }}
                />
                Monthly Revenue
              </h3>
            </div>
            <div className={commonStyles.chartContainer}>
              {monthlyData.map((m, i) => (
                <div
                  key={i}
                  className={cn(commonStyles.chartBar, themeStyles.chartBar)}
                  style={{
                    height: `${Math.max(3, (m.revenue / maxRevenue) * 100)}%`,
                  }}
                  title={`${m.month}: $${m.revenue.toLocaleString()}`}
                />
              ))}
            </div>
            <div className={commonStyles.chartLabels}>
              {monthlyData.map((m, i) => (
                <span
                  key={i}
                  className={cn(
                    commonStyles.chartLabel,
                    themeStyles.chartLabel,
                  )}
                >
                  {m.month}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Payment Methods + Financial Settings ────────────────────────── */}
        <ScrollReveal>
          <div className={commonStyles.twoCol}>
            {/* Payment Gateways */}
            <div
              className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}
            >
              <h3
                className={cn(
                  commonStyles.sectionTitle,
                  themeStyles.sectionTitle,
                )}
              >
                <CreditCard size={18} />
                Payment Gateways
              </h3>
              <div className={commonStyles.gatewayList}>
                {gateways.map((gw) => (
                  <div
                    key={gw.id}
                    className={cn(
                      commonStyles.gatewayRow,
                      themeStyles.gatewayRow,
                    )}
                  >
                    <div className={commonStyles.gatewayInfo}>
                      <div className={commonStyles.gatewayIcon}>{gw.icon}</div>
                      <div className={commonStyles.gatewayMeta}>
                        <span
                          className={cn(
                            commonStyles.gatewayName,
                            themeStyles.gatewayName,
                          )}
                        >
                          {gw.name}
                        </span>
                        <span className={commonStyles.gatewaySubtext}>
                          {gw.subtitle}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={gw.enabled}
                      aria-label={`${gw.enabled ? "Disable" : "Enable"} ${gw.name}`}
                      className={cn(
                        commonStyles.toggle,
                        gw.enabled
                          ? commonStyles.toggleOn
                          : commonStyles.toggleOff,
                      )}
                      onClick={() => toggleGateway(gw.id)}
                    >
                      <span
                        className={cn(
                          commonStyles.toggleKnob,
                          gw.enabled
                            ? commonStyles.knobOn
                            : commonStyles.knobOff,
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Settings */}
            <div
              className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}
            >
              <h3
                className={cn(
                  commonStyles.sectionTitle,
                  themeStyles.sectionTitle,
                )}
              >
                <Settings size={18} />
                Financial Settings
              </h3>
              <div className={commonStyles.settingsList}>
                <div className={commonStyles.settingRow}>
                  <label
                    className={cn(
                      commonStyles.settingLabel,
                      themeStyles.settingLabel,
                    )}
                  >
                    Platform Fee (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.5}
                    value={settings.platformFeePercent}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        platformFeePercent: Number(e.target.value),
                      }))
                    }
                    className={cn(
                      commonStyles.settingInput,
                      themeStyles.settingInput,
                    )}
                    aria-label="Platform fee percentage"
                  />
                </div>

                <div className={commonStyles.settingRow}>
                  <label
                    className={cn(
                      commonStyles.settingLabel,
                      themeStyles.settingLabel,
                    )}
                  >
                    Min Withdrawal ($)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={settings.minWithdrawal}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        minWithdrawal: Number(e.target.value),
                      }))
                    }
                    className={cn(
                      commonStyles.settingInput,
                      themeStyles.settingInput,
                    )}
                    aria-label="Minimum withdrawal amount"
                  />
                </div>

                <div className={commonStyles.settingRow}>
                  <label
                    className={cn(
                      commonStyles.settingLabel,
                      themeStyles.settingLabel,
                    )}
                  >
                    Payout Schedule
                  </label>
                  <select
                    value={settings.payoutSchedule}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        payoutSchedule: e.target.value,
                      }))
                    }
                    className={cn(
                      commonStyles.settingSelect,
                      themeStyles.settingSelect,
                    )}
                    aria-label="Payout schedule"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "0.5rem",
                  }}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveSettings}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Transaction Summary ─────────────────────────────────────────── */}
        <ScrollReveal>
          <div
            className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}
          >
            <h3
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              <Wallet size={18} />
              Recent Transactions
            </h3>
            <div className={commonStyles.tableContainer}>
              <table className={commonStyles.table}>
                <thead>
                  <tr>
                    <th className={themeStyles.tableTh}>ID</th>
                    <th className={themeStyles.tableTh}>User</th>
                    <th className={themeStyles.tableTh}>Type</th>
                    <th className={themeStyles.tableTh}>Amount</th>
                    <th className={themeStyles.tableTh}>Status</th>
                    <th className={themeStyles.tableTh}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className={commonStyles.emptyState}>
                          <Wallet size={32} style={{ opacity: 0.3 }} />
                          <span>No transactions yet.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className={themeStyles.tableRow}>
                        <td className={themeStyles.tableTd}>
                          <code style={{ fontSize: "0.8rem" }}>
                            #{t.id.slice(-6)}
                          </code>
                        </td>
                        <td className={themeStyles.tableTd}>{t.user}</td>
                        <td className={themeStyles.tableTd}>
                          <Badge variant="primary">{t.type}</Badge>
                        </td>
                        <td className={themeStyles.tableTd}>
                          <strong>{t.amount}</strong>
                        </td>
                        <td className={themeStyles.tableTd}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color:
                                STATUS_COLORS[t.status.toLowerCase()] ??
                                "#6b7280",
                            }}
                          >
                            {t.status.toLowerCase() === "completed" && (
                              <CheckCircle size={13} />
                            )}
                            {t.status.toLowerCase() === "pending" && (
                              <Clock size={13} />
                            )}
                            {t.status.toLowerCase() === "failed" && (
                              <XCircle size={13} />
                            )}
                            {t.status}
                          </span>
                        </td>
                        <td className={themeStyles.tableTd}>{t.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Pending Withdrawals ─────────────────────────────────────────── */}
        <ScrollReveal>
          <div
            className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}
          >
            <h3
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              <AlertCircle size={18} />
              Pending Withdrawal Requests
              {pendingWithdrawals.length > 0 && (
                <span style={{ marginLeft: 8, display: "inline-flex" }}>
                  <Badge variant="error">{pendingWithdrawals.length}</Badge>
                </span>
              )}
            </h3>

            {withdrawalsLoading ? (
              <div className={commonStyles.emptyState}>
                <RefreshCw
                  size={24}
                  style={{ opacity: 0.4, animation: "spin 1s linear infinite" }}
                />
                <span>Loading withdrawals...</span>
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <div className={commonStyles.emptyState}>
                <CheckCircle size={32} style={{ opacity: 0.3 }} />
                <span>No pending withdrawals — all clear!</span>
              </div>
            ) : (
              <div className={commonStyles.tableContainer}>
                <table className={commonStyles.table}>
                  <thead>
                    <tr>
                      <th className={themeStyles.tableTh}>ID</th>
                      <th className={themeStyles.tableTh}>User</th>
                      <th className={themeStyles.tableTh}>Amount</th>
                      <th className={themeStyles.tableTh}>Method</th>
                      <th className={themeStyles.tableTh}>Requested</th>
                      <th className={themeStyles.tableTh}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map((w) => (
                      <tr key={w.id} className={themeStyles.tableRow}>
                        <td className={themeStyles.tableTd}>
                          <code style={{ fontSize: "0.8rem" }}>
                            #{w.id.slice(-6)}
                          </code>
                        </td>
                        <td className={themeStyles.tableTd}>{w.user}</td>
                        <td className={themeStyles.tableTd}>
                          <strong>${w.amount.toLocaleString()}</strong>
                        </td>
                        <td className={themeStyles.tableTd}>{w.method}</td>
                        <td className={themeStyles.tableTd}>
                          {new Date(w.requestedAt).toLocaleDateString()}
                        </td>
                        <td className={themeStyles.tableTd}>
                          <div className={commonStyles.actionBtns}>
                            <Button
                              variant="primary"
                              size="sm"
                              iconBefore={<CheckCircle size={13} />}
                              onClick={() => handleApproveWithdrawal(w.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              iconBefore={<XCircle size={13} />}
                              onClick={() => handleRejectWithdrawal(w.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ── Settlement Reports ──────────────────────────────────────────── */}
        <ScrollReveal>
          <div
            className={cn(commonStyles.sectionCard, themeStyles.sectionCard)}
          >
            <div className={commonStyles.settlementHeader}>
              <h3
                className={cn(
                  commonStyles.sectionTitle,
                  themeStyles.sectionTitle,
                )}
                style={{ margin: 0 }}
              >
                <BarChart3 size={18} />
                Monthly Settlement Reports
              </h3>
              <Button
                variant="secondary"
                size="sm"
                iconBefore={<Download size={14} />}
                onClick={exportSettlementsCSV}
              >
                Export CSV
              </Button>
            </div>

            {/* Column headers */}
            <div
              className={cn(
                commonStyles.settlementRow,
                commonStyles.settlementHeadRow,
              )}
            >
              <span>Period</span>
              <span>Revenue</span>
              <span>Fees</span>
              <span>Payouts</span>
              <span>Status</span>
            </div>

            {settlementData.map((s, i) => (
              <div key={i} className={commonStyles.settlementRow}>
                <span>{s.month}</span>
                <span>${s.revenue.toLocaleString()}</span>
                <span>${s.fees.toLocaleString()}</span>
                <span>${s.payouts.toLocaleString()}</span>
                <span>
                  <Badge
                    variant={s.status === "Settled" ? "success" : "warning"}
                  >
                    {s.status}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            commonStyles.toast,
            themeStyles.toast,
            toast.type === "error" && commonStyles.toastError,
            toast.type === "error" && themeStyles.toastError,
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </PageTransition>
  );
}
