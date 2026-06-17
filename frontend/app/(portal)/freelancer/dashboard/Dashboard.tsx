// @AI-HINT: Redesigned Freelancer Dashboard with modern UI/UX, quick actions, seller stats, sparklines, timeline, progress rings
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useFreelancerData } from "@/hooks/useFreelancer";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api/core";
import Button from "@/app/components/atoms/Button/Button";
import Loading from "@/app/components/atoms/Loading/Loading";
import EmptyState from "@/app/components/molecules/EmptyState/EmptyState";
import ErrorBanner from "@/app/components/molecules/ErrorBanner/ErrorBanner";
import { useToast } from "@/app/components/molecules/Toast/use-toast";
import {
  searchingAnimation,
  emptyBoxAnimation,
} from "@/app/components/Animations/LottieAnimation";
import StatCard from "@/app/components/molecules/StatCard/StatCard";
import SellerStats, {
  SellerStatsData,
} from "@/app/components/organisms/SellerStats/SellerStats";
import ActivityTimeline, {
  type TimelineEvent,
} from "@/app/components/molecules/ActivityTimeline/ActivityTimeline";
import ProgressRing from "@/app/components/atoms/ProgressRing/ProgressRing";
import ProfileCompleteness from "@/app/components/organisms/ProfileCompleteness/ProfileCompleteness";
import EarningsChart from "./components/EarningsChart/EarningsChart";
import {
  Briefcase,
  DollarSign,
  FileText,
  Eye,
  Search,
  ArrowRight,
  Package,
  MessageSquare,
  User,
  BarChart3,
  Circle,
  CheckCircle2,
  Zap,
  Star,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import commonStyles from "./Dashboard.common.module.css";
import lightStyles from "./Dashboard.light.module.css";
import darkStyles from "./Dashboard.dark.module.css";

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  new_seller: "Welcome! Complete orders and build your reputation to level up.",
  bronze: "Rising seller with a proven track record.",
  silver: "Experienced seller delivering great results.",
  gold: "Top-rated seller with an outstanding reputation.",
  platinum: "Elite seller — among the very best on the platform.",
};

const BASE_COMMISSION = 20;

/** Map flat backend /seller-stats/me response → SellerStatsData expected by <SellerStats>. */
function transformSellerStats(raw: Record<string, unknown>): SellerStatsData {
  const level = (raw.level as string) || "new_seller";
  const benefits = (raw.benefits ?? {}) as Record<string, unknown>;
  const levelProgress = raw.level_progress as Record<string, unknown> | null;

  return {
    userId: raw.user_id as number,
    level: {
      level: level as SellerStatsData["level"]["level"],
      jssScore: (raw.jss_score as number) ?? 0,
      benefits: {
        commissionRate:
          BASE_COMMISSION - ((benefits.reduced_fees as number) ?? 0),
        featuredGigs: (benefits.featured_gigs as number) ?? 0,
        prioritySupport: (benefits.priority_support as boolean) ?? false,
        badges: (raw.badges as string[]) ?? (benefits.badges as string[]) ?? [],
        description: LEVEL_DESCRIPTIONS[level] ?? LEVEL_DESCRIPTIONS.new_seller,
      },
      ...(levelProgress
        ? {
            levelProgress: {
              nextLevel: levelProgress.next_level as string,
              requirements: levelProgress.requirements as Record<
                string,
                { current: number; required: number; percent: number }
              >,
            },
          }
        : {}),
    },
    totalOrders: (raw.total_orders as number) ?? 0,
    completedOrders: (raw.completed_orders as number) ?? 0,
    cancelledOrders: (raw.cancelled_orders as number) ?? 0,
    averageRating: (raw.average_rating as number) ?? 0,
    totalReviews: (raw.total_reviews as number) ?? 0,
    completionRate: (raw.completion_rate as number) ?? 100,
    onTimeDeliveryRate: (raw.on_time_delivery_rate as number) ?? 100,
    responseRate: (raw.response_rate as number) ?? 100,
    avgResponseTimeHours: (raw.avg_response_time_hours as number) ?? 0,
    totalEarnings: (raw.total_earnings as number) ?? 0,
    uniqueClients: (raw.unique_clients as number) ?? 0,
    repeatClients: (raw.repeat_clients as number) ?? 0,
    repeatClientRate: (raw.repeat_client_rate as number) ?? 0,
  };
}
const Dashboard: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { analytics, recommendedJobs, loading, error } =
    useFreelancerData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);
  const [sellerStats, setSellerStats] = useState<SellerStatsData | null>(null);
  const [earningsData, setEarningsData] = useState<
    { month: string; amount: number }[]
  >([]);

  useEffect(() => {
    setMounted(true);

    const fetchSellerStats = async () => {
      try {
        const data = await apiFetch("/portal/freelancer/seller-stats");
        setSellerStats(transformSellerStats(data as Record<string, unknown>));
      } catch {
        // Seller stats are optional - don't block dashboard
      }
    };

    const fetchEarnings = async () => {
      try {
        const data = (await apiFetch(
          "/portal/freelancer/earnings/monthly?months=6",
        )) as { earnings?: { month: string; amount: number }[] };
        const earningsArray = data.earnings || [];

        // Show chart even with no data (will display empty state)
        if (earningsArray.length === 0) {
          // Generate empty months for past 6 months
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const now = new Date();
          const emptyData = [];
          for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            emptyData.push({
              month: monthNames[date.getMonth()],
              amount: 0,
            });
          }
          setEarningsData(emptyData);
        } else {
          setEarningsData(earningsArray);
        }
      } catch {
        // Show empty chart on error
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const now = new Date();
        const emptyData = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          emptyData.push({
            month: monthNames[date.getMonth()],
            amount: 0,
          });
        }
        setEarningsData(emptyData);
      }
    };

    fetchSellerStats();
    fetchEarnings();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isNewUser = !localStorage.getItem("onboarding_complete");
    setShowWelcomeBanner(isNewUser);
  }, []);

  const themeStyles =
    mounted && resolvedTheme === "dark" ? darkStyles : lightStyles;

  const metrics = useMemo(
    () => ({
      earnings: analytics?.totalEarnings || "$0",
      earningsNum: parseFloat(
        String(analytics?.totalEarnings || "0").replace(/[$,]/g, ""),
      ),
      activeJobs: analytics?.activeProjects || 0,
      proposalsSent: analytics?.pendingProposals || 0,
      profileViews: analytics?.profileViews || 0,
      inquiryRate: Math.round(((analytics?.profileViews || 0) > 0 ? (analytics?.activeProjects || 0) / (analytics?.profileViews || 1) : 0) * 100),
      winRate: Math.round(((analytics?.pendingProposals || 0) > 0 ? (analytics?.activeProjects || 0) / (analytics?.pendingProposals || 1) : 0) * 100),
      completionRate: sellerStats?.completionRate ?? 100,
      responseRate: sellerStats?.responseRate ?? 100,
      onTimeRate: sellerStats?.onTimeDeliveryRate ?? 100,
      jssScore: sellerStats?.level.jssScore ?? 0,
      profileCompleteness: analytics?.profileCompleteness ?? 0,
    }),
    [analytics, sellerStats],
  );

  // Generate sparkline data from earnings history
  const earningsSparkline = useMemo(() => {
    if (earningsData.length === 0) return [0, 0, 0, 0, 0, 0];
    return earningsData.slice(-7).map((d) => d.amount);
  }, [earningsData]);

  // Forecast next month's earnings based on recent average
  const forecastEarnings = useMemo(() => {
    if (earningsData.length < 2) return 0;
    const recentValues = earningsData.slice(-3).map(d => d.amount);
    const avg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    return avg * 1.1; // 10% expected growth
  }, [earningsData]);

  // Generate activity timeline from invitations/matches
  const recentActivity = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    if (recommendedJobs && recommendedJobs.length > 0) {
      recommendedJobs.slice(0, 3).forEach((job) => {
        events.push({
          id: `match-${job.id}`,
          actor: "AI",
          action: "matched you with",
          target: job.title,
          targetHref: "/freelancer/invitations",
          timestamp: job.postedTime || new Date().toISOString(),
          type: job.matchScore ? "success" : "info",
          badge: job.matchScore ? `${job.matchScore}% fit` : undefined,
        });
      });
    }

    return events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);
  }, [recommendedJobs]);
  // Generate performance alerts
  const performanceAlerts = useMemo(() => {
    const alerts = [];

    if (metrics.jssScore < 70) {
      alerts.push({
        id: "jss-score",
        type: "warning" as const,
        title: "Low Job Success Score",
        message: `Your JSS is ${metrics.jssScore}%. Focus on on-time delivery and client satisfaction.`,
        action: { label: "View My Contracts", href: "/freelancer/contracts" },
      });
    }

    if (metrics.inquiryRate < 5) {
      alerts.push({
        id: "inquiry-rate",
        type: "info" as const,
        title: "Boost Your Profile Impressions",
        message: `Your inquiry rate is ${metrics.inquiryRate}%. Optimize your profile and portfolio to win more clicks.`,
        action: { label: "Edit Profile", href: "/freelancer/profile" },
      });
    }

    if (metrics.completionRate < 85) {
      alerts.push({
        id: "completion-rate",
        type: "warning" as const,
        title: "Low Completion Rate",
        message: `Your completion rate is ${metrics.completionRate}%. Avoid cancellations to maintain your reputation.`,
        action: { label: "View My Active Jobs", href: "/freelancer/projects" },
      });
    }

    if (metrics.responseRate < 90) {
      alerts.push({
        id: "response-rate",
        type: "info" as const,
        title: "Response Rate Below Target",
        message: `Clients expect responses within 24 hours. Current rate: ${metrics.responseRate}%.`,
        action: { label: "Check Messages", href: "/freelancer/messages" },
      });
    }

    if (metrics.profileCompleteness < 70) {
      alerts.push({
        id: "profile-completeness",
        type: "info" as const,
        title: "Complete Your Profile",
        message: `Your profile is ${metrics.profileCompleteness}% complete. Add more details to attract clients.`,
        action: { label: "Complete Profile", href: "/freelancer/profile" },
      });
    }

    return alerts;
  }, [metrics]);

  // Quick actions for the grid
  const quickActions = [
    {
      label: "Find Work",
      href: "/freelancer/projects",
      icon: Search,
      color: "primary" as const,
      desc: "Browse projects",
    },
    {
      label: "My Gigs",
      href: "/freelancer/earnings",
      icon: Package,
      color: "success" as const,
      desc: "Manage offerings",
    },
    {
      label: "Proposals",
      href: "/freelancer/invitations",
      icon: FileText,
      color: "info" as const,
      desc: `${metrics.proposalsSent} sent`,
    },
    {
      label: "Messages",
      href: "/freelancer/messages",
      icon: MessageSquare,
      color: "purple" as const,
      desc: "Chat with clients",
    },
    {
      label: "Earnings",
      href: "/freelancer/earnings",
      icon: BarChart3,
      color: "warning" as const,
      desc: "View insights",
    },
    {
      label: "AI Suite",
      href: "/ai",
      icon: Zap,
      color: "primary" as const,
      desc: "Smart tools & insights",
    },
    {
      label: "Profile",
      href: "/freelancer/profile",
      icon: User,
      color: "danger" as const,
      desc: `${metrics.profileCompleteness}% complete`,
    },
  ];

  if (!mounted) {
    return (
      <div
        className={cn(
          commonStyles.dashboardContainer,
          commonStyles.loadingContainer,
        )}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div
      className={cn(
        commonStyles.dashboardContainer,
        themeStyles.dashboardContainer,
      )}
    >
      {error && !dismissedError && (
        <ErrorBanner
          title="Failed to load dashboard"
          message="We couldn't load your dashboard data. Check your connection and try again."
          onRetry={() => {
            setDismissedError(false);
            window.location.reload();
          }}
          onDismiss={() => setDismissedError(true)}
          showGoHome={false}
        />
      )}
      {/* Header Section */}
      <div className={commonStyles.headerSection}>
        <div className={cn(commonStyles.welcomeText, themeStyles.welcomeText)}>
          <div className={commonStyles.welcomeRow}>
            <h1>
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            {analytics?.availabilityStatus === "available" && (
              <span
                className={cn(
                  commonStyles.availabilityBadge,
                  themeStyles.availabilityBadge,
                )}
                aria-label="Status: Available"
              >
                <Circle size={8} fill="#27AE60" aria-hidden="true" /> Available
              </span>
            )}
          </div>
          {analytics?.headline ? (
            <p>{analytics.headline}</p>
          ) : (
            <p>You have new job matches waiting for you.</p>
          )}
          {analytics?.profileCompleteness != null &&
            analytics.profileCompleteness < 80 && (
              <div className={commonStyles.profileProgressRow}>
                <div
                  className={cn(
                    commonStyles.progressTrack,
                    themeStyles.progressTrack,
                  )}
                  role="progressbar"
                  aria-valuenow={analytics.profileCompleteness || 0}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Profile ${analytics.profileCompleteness}% complete`}
                >
                  <div
                    className={cn(
                      commonStyles.progressFill,
                      analytics.profileCompleteness >= 60
                        ? commonStyles.progressFillGreen
                        : commonStyles.progressFillYellow,
                    )}
                    // NOSONAR
                    style={{ width: `${analytics.profileCompleteness}%` }}
                  />
                </div>
                <span
                  className={cn(
                    commonStyles.progressLabel,
                    themeStyles.progressLabel,
                  )}
                >
                  Profile {analytics.profileCompleteness}% complete
                </span>
                <Link
                  href="/freelancer/profile"
                  className={cn(
                    commonStyles.progressLink,
                    themeStyles.progressLink,
                  )}
                >
                  Complete it <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </div>
            )}
        </div>
        <div className={commonStyles.headerActions}>
          <Link href="/freelancer/earnings">
            <Button
              variant="outline"
              size="lg"
              iconBefore={<Package size={18} />}
            >
              My Gigs
            </Button>
          </Link>
          <Link href="/freelancer/projects">
            <Button
              variant="primary"
              size="lg"
              iconBefore={<Search size={18} />}
            >
              Find Work
            </Button>
          </Link>
        </div>
      </div>

      {/* Welcome Banner — shown only to new users who haven't completed onboarding */}
      {showWelcomeBanner && (
        <div className={cn(commonStyles.welcomeBanner, themeStyles.welcomeBanner)}>
          <div className={commonStyles.welcomeBannerContent}>
            <h3 className={cn(commonStyles.welcomeBannerTitle, themeStyles.welcomeBannerTitle)}>
              🎉 Welcome to MegiLance,{" "}
              {user?.name?.split(" ")[0] || "Freelancer"}!
            </h3>
            <p className={cn(commonStyles.welcomeBannerText, themeStyles.welcomeBannerText)}>
              Complete your profile to get discovered by top clients and land
              your first project.
            </p>
          </div>
          <div className={commonStyles.welcomeBannerActions}>
            <Link href="/onboarding" className={cn(commonStyles.welcomeBannerPrimaryAction, themeStyles.welcomeBannerPrimaryAction)}>
              Complete Profile
            </Link>
            <button
              onClick={() => {
                localStorage.setItem("onboarding_complete", "dismissed");
                setShowWelcomeBanner(false);
              }}
              className={cn(commonStyles.welcomeBannerDismissAction, themeStyles.welcomeBannerDismissAction)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Performance Alerts Section */}
      {performanceAlerts.length > 0 && (
        <section
          aria-label="Performance alerts"
          className={commonStyles.alertsSection}
        >
          <div className={commonStyles.alertsGrid}>
            {performanceAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  commonStyles.alertCard,
                  themeStyles.alertCard,
                  commonStyles[`alertCard-${alert.type}`],
                  themeStyles[`alertCard-${alert.type}`],
                )}
                role="status"
                aria-live="polite"
              >
                <div className={commonStyles.alertContent}>
                  <AlertCircle
                    size={18}
                    className={commonStyles.alertIcon}
                    aria-hidden="true"
                  />
                  <div className={commonStyles.alertText}>
                    <h3 className={commonStyles.alertTitle}>{alert.title}</h3>
                    <p className={commonStyles.alertMessage}>{alert.message}</p>
                  </div>
                </div>
                {alert.action && (
                  <Link
                    href={alert.action.href}
                    className={cn(
                      commonStyles.alertAction,
                      themeStyles.alertAction,
                    )}
                  >
                    {alert.action.label}{" "}
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Seller Stats Section */}
      {sellerStats && <SellerStats stats={sellerStats} />}

      {/* Stats Grid — with sparklines */}
      <section aria-label="Performance statistics">
        <div className={commonStyles.statsGrid}>
          <StatCard
            title="Total Earnings"
            value={metrics.earnings}
            icon={DollarSign}
            sparklineData={earningsSparkline}
            sparklineColor="success"
            href="/freelancer/earnings"
          />
          <StatCard
            title="Forecast (Next 30D)"
            value={`$${Math.round(forecastEarnings).toLocaleString()}`}
            icon={TrendingUp}
            sparklineColor="primary"
          />
          <StatCard
            title="Proposal Win Rate"
            value={`${metrics.winRate}%`}
            icon={CheckCircle2}
            href="/freelancer/invitations"
          />
          <StatCard
            title="Inquiry Rate"
            value={`${metrics.inquiryRate}%`}
            icon={Eye}
            sparklineColor="warning"
            href="/freelancer/earnings"
          />
        </div>
      </section>

      {/* Performance Metrics — Progress Rings */}
      <section aria-label="Performance metrics">
        <div className={commonStyles.metricsRow}>
          <div className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
            <ProgressRing
              value={metrics.completionRate}
              label="Completion Rate"
              size="lg"
              color="success"
            />
            <span
              className={cn(commonStyles.metricHint, themeStyles.metricHint)}
            >
              % of orders delivered vs. total accepted
            </span>
          </div>
          <div className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
            <ProgressRing
              value={metrics.responseRate}
              label="Response Rate"
              size="lg"
              color="primary"
            />
            <span
              className={cn(commonStyles.metricHint, themeStyles.metricHint)}
            >
              % of messages responded to within 24h
            </span>
          </div>
          <div className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
            <ProgressRing
              value={metrics.onTimeRate}
              label="On-Time Delivery"
              size="lg"
              color="warning"
            />
            <span
              className={cn(commonStyles.metricHint, themeStyles.metricHint)}
            >
              % of orders delivered before deadline
            </span>
          </div>
          <div className={cn(commonStyles.metricCard, themeStyles.metricCard)}>
            <div className={commonStyles.metricStats}>
              <div className={commonStyles.metricStatItem}>
                <Star size={16} className={commonStyles.metricIconWarning} />
                <span
                  className={cn(
                    commonStyles.metricStatValue,
                    themeStyles.metricStatValue,
                  )}
                >
                  {sellerStats?.averageRating?.toFixed(1) ?? "—"}
                </span>
                <span
                  className={cn(
                    commonStyles.metricStatLabel,
                    themeStyles.metricStatLabel,
                  )}
                >
                  Rating
                </span>
              </div>
              <div className={commonStyles.metricStatItem}>
                <TrendingUp
                  size={16}
                  className={commonStyles.metricIconSuccess}
                />
                <span
                  className={cn(
                    commonStyles.metricStatValue,
                    themeStyles.metricStatValue,
                  )}
                >
                  {metrics.jssScore}%
                </span>
                <span
                  className={cn(
                    commonStyles.metricStatLabel,
                    themeStyles.metricStatLabel,
                  )}
                  title="Job Success Score (0-100) — updated weekly based on completion, on-time delivery, and client ratings"
                >
                  JSS Score
                </span>
              </div>
              <div className={commonStyles.metricStatItem}>
                <Zap size={16} className={commonStyles.metricIconPrimary} />
                <span
                  className={cn(
                    commonStyles.metricStatValue,
                    themeStyles.metricStatValue,
                  )}
                >
                  {sellerStats?.totalOrders ?? 0}
                </span>
                <span
                  className={cn(
                    commonStyles.metricStatLabel,
                    themeStyles.metricStatLabel,
                  )}
                >
                  Total Orders
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Chart - Always show, displays empty state if no data */}
      <div className={commonStyles.sectionContainer}>
        <h2 className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}>
          Monthly Earnings
        </h2>
        <EarningsChart data={earningsData} />
      </div>

      {/* Quick Actions */}
      <section aria-label="Quick actions">
        <div className={commonStyles.quickActionsSection}>
          <h2
            className={cn(commonStyles.sectionTitle, themeStyles.sectionTitle)}
          >
            Quick Actions
          </h2>
          <div className={commonStyles.quickActionsGrid}>
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  commonStyles.quickActionCard,
                  themeStyles.quickActionCard,
                )}
                aria-label={`${action.label}: ${action.desc}`}
              >
                <div
                  className={cn(
                    commonStyles.quickActionIcon,
                    commonStyles[`quickActionIcon-${action.color}`],
                  )}
                  aria-hidden="true"
                >
                  <action.icon size={20} />
                </div>
                <span
                  className={cn(
                    commonStyles.quickActionLabel,
                    themeStyles.quickActionLabel,
                  )}
                >
                  {action.label}
                </span>
                <span
                  className={cn(
                    commonStyles.quickActionDesc,
                    themeStyles.quickActionDesc,
                  )}
                >
                  {action.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className={commonStyles.mainContentGrid}>
        {/* Left Column */}
        <div className={commonStyles.sectionContainer}>
          <div className={commonStyles.sectionHeader}>
            <h2
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              Recommended Jobs
            </h2>
            <Link
              href="/freelancer/projects"
              className={cn(commonStyles.viewAllLink, themeStyles.viewAllLink)}
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className={commonStyles.jobList}>
            {loading ? (
              <Loading />
            ) : recommendedJobs && recommendedJobs.length > 0 ? (
              recommendedJobs
                .slice(0, 3)
                .map((job: any) => (
                  <Link key={job.id} href="/freelancer/invitations">
                    <div className={commonStyles.jobCard}>
                      <h4 className={commonStyles.jobTitle}>{job.title || 'AI-Matched Project'}</h4>
                      <p className={commonStyles.jobBudget}>
                        ${job.budget_min || 0} - ${job.budget_max || 0}
                      </p>
                    </div>
                  </Link>
                ))
            ) : (
              <EmptyState
                title="No matching projects found"
                description="When clients create projects matching your skills, you'll see them here."
                animationData={searchingAnimation}
                animationWidth={120}
                animationHeight={120}
                action={
                  <Link href="/freelancer/invitations">
                    <Button variant="outline" size="sm">
                      View Invitations
                    </Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Activity Timeline */}
          <div
            className={cn(
              commonStyles.timelineSection,
              themeStyles.timelineSection,
            )}
          >
            <h3
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              Recent Activity
            </h3>
            <ActivityTimeline
              events={recentActivity}
              maxItems={5}
              emptyMessage="No recent activity"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className={commonStyles.sectionContainer}>
          <div className={commonStyles.sectionHeader}>
            <h2
              className={cn(
                commonStyles.sectionTitle,
                themeStyles.sectionTitle,
              )}
            >
              Recent Invitations
            </h2>
            <Link
              href="/freelancer/invitations"
              className={cn(commonStyles.viewAllLink, themeStyles.viewAllLink)}
            >
              View All
            </Link>
          </div>

          <div className={commonStyles.proposalList}>
            {recommendedJobs && recommendedJobs.length > 0 ? (
              recommendedJobs.slice(0, 5).map((job) => {
                return (
                  <Link
                    key={job.id}
                    href="/freelancer/invitations"
                    className={cn(
                      commonStyles.proposalCard,
                      themeStyles.proposalCard,
                    )}
                  >
                    <div className={commonStyles.proposalInfo}>
                      <h4 className={cn(themeStyles.proposalTitle)}>
                        {job.title}
                      </h4>
                      <span
                        className={cn(
                          commonStyles.proposalDate,
                          themeStyles.proposalDate,
                        )}
                      >
                        {job.matchScore ? `${job.matchScore}% match` : 'AI Matched'}
                      </span>
                    </div>
                    <span
                      className={cn(
                        commonStyles.proposalStatus,
                        themeStyles.proposalStatus,
                        commonStyles.statusPending,
                      )}
                    >
                      Pending
                    </span>
                  </Link>
                );
              })
            ) : (
              <EmptyState
                title="No invitations yet"
                description="When clients create projects matching your skills, you'll receive AI-matched invitations here."
                animationData={emptyBoxAnimation}
                animationWidth={100}
                animationHeight={100}
                action={
                  <Link href="/freelancer/profile">
                    <Button
                      variant="primary"
                      size="sm"
                      iconBefore={<Search size={14} />}
                    >
                      Update Skills
                    </Button>
                  </Link>
                }
              />
            )}
          </div>

          {/* Profile Completeness Widget */}
          <ProfileCompleteness showDetails={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
