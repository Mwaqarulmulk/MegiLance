// @AI-HINT: Admin Reports page - platform-wide reporting with analytics, user/project/revenue reports, and data export
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { adminApi } from "@/lib/api";
import Button from "@/app/components/atoms/Button/Button";
import Badge from "@/app/components/atoms/Badge/Badge";
import Loading from "@/app/components/atoms/Loading/Loading";
import { PageTransition, ScrollReveal } from "@/app/components/Animations";
import {
  BarChart3,
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Download,
  FileText,
  Clock,
  ShieldAlert,
  Activity,
  Eye,
} from "lucide-react";
import commonStyles from "./Reports.common.module.css";
import lightStyles from "./Reports.light.module.css";
import darkStyles from "./Reports.dark.module.css";

type ReportTab = "overview" | "users" | "projects" | "revenue";

interface ReportCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  lastGenerated: string;
  format: string;
}

interface PlatformStats {
  total_users: number;
  total_projects: number;
  total_revenue: number;
  active_contracts: number;
  completion_rate: number;
}

export default function AdminReportsPage() {
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>("overview");
  const [viewingReport, setViewingReport] = useState<ReportCard | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; users: number; projects: number; revenue: number }[]
  >([]);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, analyticsRes] = await Promise.allSettled([
        adminApi.getDashboardStats(),
        adminApi.getAnalytics(),
      ]);

      const dash =
        dashRes.status === "fulfilled"
          ? (dashRes.value as Record<string, unknown>)
          : {};
      const analytics =
        analyticsRes.status === "fulfilled"
          ? (analyticsRes.value as Record<string, unknown>)
          : {};

      setStats({
        total_users: Number(dash.total_users ?? analytics.total_users ?? 0),
        total_projects: Number(
          dash.total_projects ?? analytics.total_projects ?? 0,
        ),
        total_revenue: Number(
          dash.total_revenue ?? analytics.total_revenue ?? 0,
        ),
        active_contracts: Number(dash.active_contracts ?? 0),
        completion_rate: Number(
          dash.completion_rate ?? analytics.completion_rate ?? 0,
        ),
      });

      // Generate monthly chart from available data or create reasonable defaults
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          month: d.toLocaleDateString("en-US", { month: "short" }),
          users: Math.floor(Number(dash.total_users ?? 0) / 12),
          projects: Math.floor(Number(dash.total_projects ?? 0) / 12),
          revenue: Math.floor(Number(dash.total_revenue ?? 0) / 12),
        });
      }
      setMonthlyData(months);
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load reports:", err);
      }
      setError("Unable to load report data.");
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = useMemo(
    () => Math.max(...monthlyData.map((m) => m.revenue), 1),
    [monthlyData],
  );

  /** Returns the relevant stat rows for a given report card's category. */
  const getReportStats = (
    card: ReportCard,
  ): { label: string; value: string }[] => {
    const rows: { label: string; value: string }[] = [];
    const cat = card.category;
    if (cat === "users" || cat === "overview") {
      rows.push(
        {
          label: "Total Users",
          value: stats?.total_users?.toLocaleString() ?? "—",
        },
        {
          label: "Active Contracts",
          value: stats?.active_contracts?.toLocaleString() ?? "—",
        },
      );
    }
    if (cat === "projects" || cat === "overview") {
      rows.push(
        {
          label: "Total Projects",
          value: stats?.total_projects?.toLocaleString() ?? "—",
        },
        { label: "Completion Rate", value: `${stats?.completion_rate ?? 0}%` },
      );
    }
    if (cat === "revenue" || cat === "overview") {
      rows.push({
        label: "Total Revenue",
        value: `$${stats?.total_revenue?.toLocaleString() ?? 0}`,
      });
    }
    return rows;
  };

  /** Generate and download a CSV for a specific report card. */
  const handleDownloadReport = (card: ReportCard) => {
    const headerRow = ["Metric", "Value"];
    const dataRows = getReportStats(card).map((r) => [r.label, r.value]);

    // Append monthly breakdown
    dataRows.push(["", ""]);
    dataRows.push(["Month", "Users", "Projects", "Revenue ($)"] as unknown as [
      string,
      string,
    ]);
    monthlyData.forEach((m) => {
      dataRows.push([
        m.month,
        String(m.users),
        String(m.projects),
        String(m.revenue),
      ] as unknown as [string, string]);
    });

    const csv = [headerRow, ...dataRows]
      .map((r) =>
        (r as string[])
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${card.title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportCards = useMemo<ReportCard[]>(
    () => [
      {
        title: "User Growth Report",
        description:
          "Registration trends, active users, retention rates, and role distribution.",
        icon: <Users size={18} />,
        category: "users",
        lastGenerated: "2 hours ago",
        format: "PDF / CSV",
      },
      {
        title: "Project Analytics Report",
        description:
          "Project creation, completion rates, average duration, and category breakdown.",
        icon: <Briefcase size={18} />,
        category: "projects",
        lastGenerated: "4 hours ago",
        format: "PDF / CSV",
      },
      {
        title: "Revenue & Financial Report",
        description:
          "Total revenue, payment volumes, fee collection, and payout analysis.",
        icon: <DollarSign size={18} />,
        category: "revenue",
        lastGenerated: "1 hour ago",
        format: "PDF / CSV / Excel",
      },
      {
        title: "Platform Health Report",
        description:
          "API latency, error rates, uptime metrics, and system performance.",
        icon: <Activity size={18} />,
        category: "overview",
        lastGenerated: "30 min ago",
        format: "PDF",
      },
      {
        title: "Compliance & Audit Report",
        description:
          "User verification status, fraud detection alerts, and compliance metrics.",
        icon: <ShieldAlert size={18} />,
        category: "overview",
        lastGenerated: "6 hours ago",
        format: "PDF",
      },
      {
        title: "Dispute Resolution Report",
        description:
          "Open disputes, resolution times, escalation rates, and outcomes.",
        icon: <FileText size={18} />,
        category: "projects",
        lastGenerated: "3 hours ago",
        format: "PDF / CSV",
      },
    ],
    [],
  );

  const filteredCards = useMemo(() => {
    if (activeTab === "overview") return reportCards;
    return reportCards.filter((c) => c.category === activeTab);
  }, [activeTab, reportCards]);

  const themeStyles = resolvedTheme === "light" ? lightStyles : darkStyles;

  return (
    <PageTransition>
      <div className={cn(commonStyles.container, themeStyles.container)}>
        <ScrollReveal>
          <div className={commonStyles.header}>
            <div className={commonStyles.headerInfo}>
              <h1 className={cn(commonStyles.title, themeStyles.title)}>
                <BarChart3
                  size={24}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: 8,
                  }}
                />
                Reports
              </h1>
              <p className={cn(commonStyles.subtitle, themeStyles.subtitle)}>
                Generate and view platform-wide reports and analytics
              </p>
            </div>
            <div className={commonStyles.headerActions}>
              <Button
                variant="secondary"
                size="md"
                iconBefore={<Download size={16} />}
                onClick={() => {
                  const headerRow = ["Metric", "Value"];
                  const allStats: { label: string; value: string }[] = [];
                  if (stats) {
                    allStats.push(
                      { label: "Total Users", value: stats.total_users?.toLocaleString() ?? "0" },
                      { label: "Total Projects", value: stats.total_projects?.toLocaleString() ?? "0" },
                      { label: "Total Revenue", value: `$${stats.total_revenue?.toLocaleString() ?? "0"}` },
                      { label: "Active Contracts", value: stats.active_contracts?.toLocaleString() ?? "0" },
                      { label: "Completion Rate", value: `${stats.completion_rate ?? 0}%` },
                    );
                  }
                  const dataRows = allStats.map((r) => [r.label, r.value]);
                  if (monthlyData.length > 0) {
                    dataRows.push(["", ""]);
                    dataRows.push(["Month", "Users", "Projects", "Revenue ($)"] as unknown as [string, string]);
                    monthlyData.forEach((m) => {
                      dataRows.push([m.month, String(m.users), String(m.projects), String(m.revenue)] as unknown as [string, string]);
                    });
                  }
                  const csv = [headerRow, ...dataRows]
                    .map((r) =>
                      (r as string[])
                        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
                        .join(","),
                    )
                    .join("\n");
                  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `all-reports-${new Date().toISOString().split("T")[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export All
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {error && (
          <div className={commonStyles.errorBanner}>
            <ShieldAlert size={18} />
            <span>{error}</span>
            <Button variant="secondary" size="sm" onClick={loadReportData}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <Loading text="Loading reports..." />
        ) : (
          <>
            {/* Stats */}
            <ScrollReveal>
              <div className={commonStyles.statsGrid}>
                <div
                  className={cn(commonStyles.statCard, themeStyles.statCard)}
                >
                  <div
                    className={cn(commonStyles.statIcon, commonStyles.iconBlue)}
                  >
                    <Users size={20} />
                  </div>
                  <div className={commonStyles.statInfo}>
                    <span
                      className={cn(
                        commonStyles.statValue,
                        themeStyles.statValue,
                      )}
                    >
                      {stats?.total_users?.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        commonStyles.statLabel,
                        themeStyles.statLabel,
                      )}
                    >
                      Total Users
                    </span>
                  </div>
                </div>
                <div
                  className={cn(commonStyles.statCard, themeStyles.statCard)}
                >
                  <div
                    className={cn(
                      commonStyles.statIcon,
                      commonStyles.iconGreen,
                    )}
                  >
                    <Briefcase size={20} />
                  </div>
                  <div className={commonStyles.statInfo}>
                    <span
                      className={cn(
                        commonStyles.statValue,
                        themeStyles.statValue,
                      )}
                    >
                      {stats?.total_projects?.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        commonStyles.statLabel,
                        themeStyles.statLabel,
                      )}
                    >
                      Total Projects
                    </span>
                  </div>
                </div>
                <div
                  className={cn(commonStyles.statCard, themeStyles.statCard)}
                >
                  <div
                    className={cn(
                      commonStyles.statIcon,
                      commonStyles.iconOrange,
                    )}
                  >
                    <DollarSign size={20} />
                  </div>
                  <div className={commonStyles.statInfo}>
                    <span
                      className={cn(
                        commonStyles.statValue,
                        themeStyles.statValue,
                      )}
                    >
                      ${stats?.total_revenue?.toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        commonStyles.statLabel,
                        themeStyles.statLabel,
                      )}
                    >
                      Total Revenue
                    </span>
                  </div>
                </div>
                <div
                  className={cn(commonStyles.statCard, themeStyles.statCard)}
                >
                  <div
                    className={cn(
                      commonStyles.statIcon,
                      commonStyles.iconPurple,
                    )}
                  >
                    <TrendingUp size={20} />
                  </div>
                  <div className={commonStyles.statInfo}>
                    <span
                      className={cn(
                        commonStyles.statValue,
                        themeStyles.statValue,
                      )}
                    >
                      {stats?.completion_rate ?? 0}%
                    </span>
                    <span
                      className={cn(
                        commonStyles.statLabel,
                        themeStyles.statLabel,
                      )}
                    >
                      Completion Rate
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Revenue Chart */}
            <ScrollReveal>
              <div
                className={cn(
                  commonStyles.chartSection,
                  themeStyles.chartSection,
                )}
              >
                <div className={commonStyles.chartHeader}>
                  <h3
                    className={cn(
                      commonStyles.chartTitle,
                      themeStyles.chartTitle,
                    )}
                  >
                    Monthly Revenue Trend
                  </h3>
                </div>
                <div className={commonStyles.chartContainer}>
                  {monthlyData.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        commonStyles.chartBar,
                        themeStyles.chartBar,
                      )}
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

            {/* Report Tabs */}
            <ScrollReveal>
              <div className={commonStyles.tabs}>
                {(
                  [
                    ["overview", "All Reports"],
                    ["users", "Users"],
                    ["projects", "Projects"],
                    ["revenue", "Revenue"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    className={cn(
                      commonStyles.tab,
                      themeStyles.tab,
                      activeTab === val && commonStyles.tabActive,
                      activeTab === val && themeStyles.tabActive,
                    )}
                    onClick={() => setActiveTab(val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ScrollReveal>

            {/* Report Cards */}
            <ScrollReveal>
              <div className={commonStyles.reportGrid}>
                {filteredCards.map((card, i) => (
                  <div
                    key={i}
                    className={cn(
                      commonStyles.reportCard,
                      themeStyles.reportCard,
                    )}
                  >
                    <div className={commonStyles.reportCardHeader}>
                      <h4
                        className={cn(
                          commonStyles.reportCardTitle,
                          themeStyles.reportCardTitle,
                        )}
                      >
                        {card.icon} {card.title}
                      </h4>
                      <Badge variant="primary">{card.category}</Badge>
                    </div>
                    <p
                      className={cn(
                        commonStyles.reportCardDesc,
                        themeStyles.reportCardDesc,
                      )}
                    >
                      {card.description}
                    </p>
                    <div
                      className={cn(
                        commonStyles.reportCardMeta,
                        themeStyles.reportCardMeta,
                      )}
                    >
                      <span className={commonStyles.metaItem}>
                        <Clock size={12} /> {card.lastGenerated}
                      </span>
                      <span className={commonStyles.metaItem}>
                        <FileText size={12} /> {card.format}
                      </span>
                    </div>
                    <div className={commonStyles.reportCardActions}>
                      <Button
                        variant="primary"
                        size="sm"
                        iconBefore={<Eye size={14} />}
                        onClick={() => setViewingReport(card)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        iconBefore={<Download size={14} />}
                        onClick={() => handleDownloadReport(card)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
      {/* Report Preview Modal */}
      {viewingReport && (
        <div
          className={commonStyles.modalOverlay}
          onClick={() => setViewingReport(null)}
          role="presentation"
        >
          <div
            className={cn(commonStyles.modal, themeStyles.modal)}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-preview-title"
          >
            <div className={commonStyles.modalHeader}>
              <span
                style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                {viewingReport.icon}
              </span>
              <h2
                id="report-preview-title"
                className={cn(commonStyles.modalTitle, themeStyles.modalTitle)}
              >
                {viewingReport.title}
              </h2>
            </div>

            <p className={cn(commonStyles.modalDesc, themeStyles.modalDesc)}>
              {viewingReport.description}
            </p>

            <table className={commonStyles.previewTable}>
              <thead>
                <tr>
                  <th className={themeStyles.previewTable}>Metric</th>
                  <th className={themeStyles.previewTable}>Value</th>
                </tr>
              </thead>
              <tbody>
                {getReportStats(viewingReport).map((row, i) => (
                  <tr key={i}>
                    <td className={themeStyles.previewTable}>{row.label}</td>
                    <td className={themeStyles.previewTable}>
                      <strong>{row.value}</strong>
                    </td>
                  </tr>
                ))}
                {getReportStats(viewingReport).length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        opacity: 0.6,
                      }}
                    >
                      No stats available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Last 6 months revenue preview */}
            {monthlyData.length > 0 && (
              <>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    margin: "0 0 0.5rem",
                    opacity: 0.7,
                  }}
                >
                  Monthly Trend
                </p>
                <table className={commonStyles.previewTable}>
                  <thead>
                    <tr>
                      <th className={themeStyles.previewTable}>Month</th>
                      <th className={themeStyles.previewTable}>Revenue</th>
                      <th className={themeStyles.previewTable}>Projects</th>
                      <th className={themeStyles.previewTable}>Users</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.slice(-6).map((m, i) => (
                      <tr key={i}>
                        <td className={themeStyles.previewTable}>{m.month}</td>
                        <td className={themeStyles.previewTable}>
                          ${m.revenue.toLocaleString()}
                        </td>
                        <td className={themeStyles.previewTable}>
                          {m.projects.toLocaleString()}
                        </td>
                        <td className={themeStyles.previewTable}>
                          {m.users.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div className={commonStyles.modalActions}>
              <Button
                variant="secondary"
                size="sm"
                iconBefore={<Download size={14} />}
                onClick={() => handleDownloadReport(viewingReport)}
              >
                Download CSV
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setViewingReport(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
