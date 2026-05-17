// @AI-HINT: Improved Notifications UI with Framer Motion, real-time polling, and premium design system.
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/app/components/molecules/EmptyState/EmptyState";
import { celebrationAnimation } from "@/app/components/Animations/LottieAnimation";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import {
  Loader2,
  Bell,
  CheckCircle2,
  Archive,
  Activity,
  RefreshCw,
} from "lucide-react";
import { notificationsApi, realtimeApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import common from "./Notifications.common.module.css";
import light from "./Notifications.light.module.css";
import dark from "./Notifications.dark.module.css";

const ALL = "All";
const CATEGORIES = [
  "All",
  "Proposals",
  "Contracts",
  "Milestones",
  "Messages",
  "Payments",
  "Disputes",
  "System",
] as const;

type CategoryValue = Exclude<(typeof CATEGORIES)[number], "All">;

const getCategory = (type: string): CategoryValue => {
  const t = (type || "").toLowerCase();
  if (t.includes("proposal")) return "Proposals";
  if (t.includes("contract")) return "Contracts";
  if (t.includes("milestone")) return "Milestones";
  if (t.includes("message") || t.includes("chat")) return "Messages";
  if (
    t.includes("payment") ||
    t.includes("invoice") ||
    t.includes("wallet") ||
    t.includes("escrow")
  )
    return "Payments";
  if (t.includes("dispute")) return "Disputes";
  return "System";
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  category: CategoryValue;
  time: string;
  unread: boolean;
  action_url?: string;
};

interface RawNotification {
  id?: number | string;
  notification_type?: string;
  type?: string;
  title?: string;
  content?: string;
  message?: string;
  body?: string;
  created_at?: string;
  is_read?: boolean;
  unread?: boolean;
  action_url?: string;
}

export default function Notifications() {
  const { resolvedTheme } = useTheme();
  const themed = resolvedTheme === "dark" ? dark : light;
  const { notify } = useToaster();
  const router = useRouter();

  const [selected, setSelected] = useState<(typeof CATEGORIES)[number]>(ALL);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch logic wrapped in useCallback so we can poll
  const fetchNotifications = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setError(null);
      const data = await notificationsApi.list(1, 50);

      const typedData = data as any;
      const rawItems: RawNotification[] = Array.isArray(typedData)
        ? typedData
        : typedData.notifications || typedData.items || [];

      const parsedNotifications: NotificationItem[] = rawItems.map((n, idx) => {
        const category: CategoryValue = getCategory(
          n.notification_type || n.type || "",
        );
        const timeStr = n.created_at
          ? formatTimeAgo(new Date(n.created_at))
          : "Recently";
        return {
          id: String(n.id || idx),
          title: n.title || n.notification_type || "Notification",
          body: n.content || n.message || n.body || "",
          category,
          time: timeStr,
          unread: n.is_read === false || n.unread === true,
          action_url: n.action_url,
        };
      });

      // Filter out duplicate IDs or outdated state if necessary
      setNotifs(parsedNotifications);
    } catch (fetchErr) {
      if (process.env.NODE_ENV === "development")
        console.warn("[Notifications] fetch error:", fetchErr);
      if (!isBackground)
        setError("Failed to load notifications. Please try again.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial Load + Polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      setIsPolling(true);
      fetchNotifications(true).finally(() => {
        setTimeout(() => setIsPolling(false), 800); // Visual feedback
      });
    }, 25000); // Poll every 25s

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const formatTimeAgo = (date: Date): string => {
    const diffMs = new Date().getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filtered = useMemo(
    () =>
      selected === ALL ? notifs : notifs.filter((i) => i.category === selected),
    [selected, notifs],
  );

  const unreadCount = useMemo(
    () => notifs.filter((n) => n.unread).length,
    [notifs],
  );

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
      notify({
        title: "Inbox Cleared",
        description: "All notifications marked as read.",
        variant: "success",
      });
    } catch {
      notify({
        title: "Error",
        description: "Could not mark all as read.",
        variant: "error",
      });
    }
  };

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    } catch {
      // Local fallback
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      );
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Fire-and-forget: optimistic removal regardless of backend response
    notificationsApi
      .delete(id)
      .catch((archiveErr: unknown) =>
        process.env.NODE_ENV === "development"
          ? console.warn("[Notifications] Archive failed:", archiveErr)
          : archiveErr,
      );
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    notify({
      title: "Archived",
      description: "Notification removed.",
      variant: "info",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05, duration: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 350, damping: 25 } as const,
    },
    exit: { opacity: 0, x: -10, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (loading && notifs.length === 0) {
    return (
      <main className={cn(common.page, themed.themeWrapper)}>
        <div className={common.fullCenter}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={common.loadingContainer}
          >
            <div className={common.spinnerOrb} />
            <p>Syncing notifications...</p>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className={cn(common.page, themed.themeWrapper)}>
      <div className={common.container}>
        {/* Header */}
        <header className={common.header}>
          <div className={common.headerMain}>
            <h1 className={common.title}>
              Inbox
              {unreadCount > 0 && (
                <span className={common.badge}>{unreadCount}</span>
              )}
            </h1>

            <div className={common.actionsBar}>
              {isPolling && (
                <span className={common.pollingIndicator}>
                  <RefreshCw size={14} className={common.spinIcon} />
                  Syncing
                </span>
              )}
              <button
                type="button"
                className={cn(common.ghostButton, themed.ghostButton)}
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle2 size={16} /> Mark all read
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className={common.filters} role="toolbar">
            <AnimatePresence>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn(
                    common.chip,
                    themed.chip,
                    selected === c && common.chipActive,
                  )}
                  onClick={() => setSelected(c)}
                >
                  {c === selected && (
                    <motion.span
                      layoutId="activeFilter"
                      className={common.chipIndicator}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className={common.chipText}>{c}</span>
                </button>
              ))}
            </AnimatePresence>
          </div>
        </header>

        {error && (
          <div className={cn(common.errorBanner, themed.errorBanner)}>
            {error}
            <button
              onClick={() => fetchNotifications()}
              className={common.retryBtn}
            >
              Retry
            </button>
          </div>
        )}

        {/* List Area */}
        <div className={common.content}>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={common.emptyWrapper}
            >
              <EmptyState
                title={
                  selected === ALL
                    ? "No notifications"
                    : `No ${selected.toLowerCase()} notifications`
                }
                description="When you receive updates, they'll appear here."
                animationData={celebrationAnimation}
                animationWidth={180}
                animationHeight={180}
              />
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={common.list}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((n) => (
                  <motion.div
                    key={n.id}
                    layout
                    variants={itemVariants}
                    exit="exit"
                    className={cn(
                      common.card,
                      themed.card,
                      n.unread && common.cardUnread,
                    )}
                    onClick={() => n.action_url && router.push(n.action_url)}
                    style={{ cursor: n.action_url ? "pointer" : "default" }}
                  >
                    <div className={common.cardMeta}>
                      <div
                        className={cn(
                          common.dot,
                          n.unread ? common.dotUnread : common.dotRead,
                        )}
                      />
                    </div>

                    <div className={common.cardBody}>
                      <h3 className={common.cardTitle}>{n.title}</h3>
                      <p className={common.cardText}>{n.body}</p>
                      <span className={common.cardTime}>
                        {n.time} • {n.category}
                      </span>
                    </div>

                    <div className={common.cardActions}>
                      {n.unread && (
                        <button
                          className={common.iconBtn}
                          onClick={(e) => handleMarkRead(n.id, e)}
                          aria-label="Mark read"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                      )}
                      <button
                        className={cn(common.iconBtn, common.iconBtnDanger)}
                        onClick={(e) => handleArchive(n.id, e)}
                        aria-label="Archive"
                      >
                        <Archive size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
