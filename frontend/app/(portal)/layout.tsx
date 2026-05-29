// @AI-HINT: This is the layout for all authenticated user portals. It uses the AppLayout component to provide a consistent shell with a sidebar and navbar.
// CRITICAL: This layout requires authentication - unauthenticated users are redirected to login.

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import AppLayout from "../components/templates/AppLayout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { UnreadCountProvider } from "@/contexts/UnreadCountContext";
import Loading from "@/app/components/atoms/Loading/Loading";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import commonStyles from "./PortalLayout.common.module.css";
import lightStyles from "./PortalLayout.light.module.css";
import darkStyles from "./PortalLayout.dark.module.css";

// Lazy-load notification bell so it doesn't block initial auth render
const RealTimeNotifications = dynamic(
  () =>
    import("@/app/components/AdvancedFeatures/RealTimeNotifications/RealTimeNotifications"),
  { ssr: false },
);

// Lazy-load the AI Client Assistant (client-only, SSR disabled — uses browser APIs)
const ClientAssistant = dynamic(
  () => import("@/app/components/organisms/ClientAssistant/ClientAssistant"),
  { ssr: false },
);

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user: hookUser,
    isAuthenticated: useAuthIsAuthed,
    isLoading: authLoading,
  } = useAuth();

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ── Auth gate state ────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // ── Theme mount guard ───────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Email verification banner state ────────────────────────────────────────
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // ── Auth effect ────────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Try to get user from hook, fallback to localStorage for immediate layout check during redirect/refresh
    let user = hookUser;
    if (!user && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) user = JSON.parse(stored);
      } catch (e) {
        console.warn("Failed to parse stored user", e);
      }
    }

    const isAuthed = !!user;

    // If hook is still loading and we have no cached user, wait
    if (authLoading && !isAuthed) return;

    if (!isAuthed) {
      const currentPath = pathname || "/client/dashboard";
      setIsAuthenticated(false);
      router.replace(`/login?returnTo=${encodeURIComponent(currentPath)}`);
      return;
    }

    // SECURITY: Use API-provided role as the source of truth, NOT localStorage.
    // localStorage ml_user_role can be tampered with by users to escalate privileges.
    // The API response (user.role / user.user_type) is the authoritative role.
    const apiRole = (user!.user_type || user!.role || "client").toLowerCase();
    const role = ["admin", "freelancer", "client"].includes(apiRole) ? apiRole : "client";

    // Strict portal-area access: each role stays in their own area.
    if (pathname?.startsWith("/admin") && role !== "admin") {
      router.replace(`/${role}/dashboard`);
      return;
    }
    if (pathname?.startsWith("/client") && role !== "client") {
      router.replace(`/${role}/dashboard`);
      return;
    }
    if (pathname?.startsWith("/freelancer") && role !== "freelancer") {
      router.replace(`/${role}/dashboard`);
      return;
    }

    // Ensure session properties match
    window.localStorage.setItem("portal_area", role);
    setIsAuthenticated(true);
  }, [pathname, router, useAuthIsAuthed, authLoading, hookUser]);

  // ── Email verification banner effect ────────────────────────────────────────────────
  // Show the banner only if user is loaded and email is explicitly NOT verified.
  // Treat email_verified === false (boolean false, not undefined) as unverified.
  useEffect(() => {
    if (hookUser && hookUser.email_verified === false) {
      setShowVerifyBanner(true);
    } else {
      setShowVerifyBanner(false);
    }
  }, [hookUser]);

  const handleResendVerification = useCallback(async () => {
    setResendLoading(true);
    setResendMessage(null);
    try {
      await api.auth.resendVerification();
      setResendMessage("Verification email sent! Check your inbox.");
    } catch {
      setResendMessage(
        "Could not send verification email. Please try again later.",
      );
    } finally {
      setResendLoading(false);
    }
  }, []);

  // ── Loading / auth gate guards ─────────────────────────────────────────────
  const hasUser =
    !!hookUser ||
    (typeof window !== "undefined" && !!localStorage.getItem("user"));
  if ((authLoading && !hasUser) || isAuthenticated === null) {
    return <Loading size="lg" text="Verifying authentication..." fullscreen />;
  }

  // Don't render if not authenticated (redirecting)
  if (!isAuthenticated) {
    return null;
  }

  let user: typeof hookUser = hookUser;
  if (!user && typeof window !== "undefined") {
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      // Malformed JSON in localStorage — ignore
    }
  }

  const themeStyles =
    mounted && resolvedTheme === "dark" ? darkStyles : lightStyles;

  // ── Onboarding gate (P0-5) ────────────────────────────────────────────
  // Non-dismissible: shown until profile_completed is truthy.
  const needsOnboarding =
    !!hookUser &&
    !hookUser.profile_completed &&
    !pathname?.startsWith("/onboarding");

  return (
    <UnreadCountProvider>
      <AppLayout>
        {/* ── Email Verification Banner ─────────────────────────────────────
            Non-blocking: just a sticky top warning. Dismissible via the × button.
            Auto-shows when email_verified is explicitly false; hides otherwise. */}
        {showVerifyBanner && (
          <div
            role="alert"
            aria-live="polite"
            className={cn(commonStyles.verifyBanner, themeStyles.verifyBanner)}
          >
            <span className={commonStyles.verifyBannerText}>
              ⚠️ <strong>Please verify your email address.</strong> Check your
              inbox for a verification link.
              {resendMessage && (
                <span style={{ marginLeft: 8, fontStyle: "italic" }}>
                  {resendMessage}
                </span>
              )}
            </span>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              aria-label="Resend email verification link"
              className={cn(
                commonStyles.verifyResendBtn,
                themeStyles.verifyResendBtn,
              )}
            >
              {resendLoading ? "Sending…" : "Resend verification email"}
            </button>
            <button
              onClick={() => setShowVerifyBanner(false)}
              aria-label="Dismiss email verification banner"
              className={cn(
                commonStyles.verifyDismissBtn,
                themeStyles.verifyDismissBtn,
              )}
            >
              ×
            </button>
          </div>
        )}

        {/* ── Onboarding Banner (P0-5) ──────────────────────────────────────
            Non-dismissible: guides user to complete their profile.
            Stays below the email verification banner if both are shown. */}
        {needsOnboarding && (
          <div
            role="alert"
            style={{
              position: "sticky",
              top: showVerifyBanner ? "48px" : 0,
              zIndex: 9998,
              background: "#EBF5FF",
              borderBottom: "1px solid #BFDBFE",
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "0.875rem",
              color: "#1E40AF",
            }}
          >
            <span style={{ flex: 1 }}>
              👋 <strong>Complete your profile</strong> to start using MegiLance
              — post projects, submit proposals, and more.
            </span>
            <a
              href={
                hookUser?.user_type === "client"
                  ? "/onboarding/client"
                  : "/onboarding"
              }
              style={{
                padding: "4px 14px",
                borderRadius: "6px",
                background: "#1E40AF",
                color: "white",
                fontWeight: 600,
                fontSize: "0.8125rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Complete Profile →
            </a>
          </div>
        )}

        {children}

        {/* Global real-time notification bell — mounts once for the entire portal */}
        {user?.id && (
          <RealTimeNotifications
            userId={String(user.id)}
            maxDisplayed={8}
            autoMarkAsRead={false}
          />
        )}

        {/* AI Client Assistant Widget — floating chatbot, clients only */}
        {(user?.user_type === "client" || user?.role === "client") && (
          <ClientAssistant />
        )}
      </AppLayout>
    </UnreadCountProvider>
  );
}
