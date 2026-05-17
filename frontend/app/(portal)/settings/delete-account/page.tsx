// @AI-HINT: Account deletion page — password confirmation, data warning, irreversible delete with auth clear + redirect
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { apiFetch, clearAuthData } from "@/lib/api";
import Button from "@/app/components/atoms/Button/Button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import commonStyles from "./DeleteAccount.common.module.css";
import lightStyles from "./DeleteAccount.light.module.css";
import darkStyles from "./DeleteAccount.dark.module.css";

export default function DeleteAccountPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const themeStyles = resolvedTheme === "dark" ? darkStyles : lightStyles;

  const handleDelete = async () => {
    if (!confirmed) {
      setError("Please confirm that you understand this action is permanent.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password to confirm.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch("/users/me", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });

      // Clear all auth data
      clearAuthData();
      setSuccess(true);

      // Redirect after brief delay to show success message
      setTimeout(() => {
        router.push("/?account_deleted=true");
      }, 2500);
    } catch (err: any) {
      const status = err?.status;
      if (status === 401 || status === 403) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(
          err?.message ||
            "Failed to delete account. Please try again or contact support.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!resolvedTheme) return null;

  return (
    <div className={cn(commonStyles.page, themeStyles.page)}>
      <div className={cn(commonStyles.card, themeStyles.card)}>
        {/* Back link */}
        <div style={{ marginBottom: "1.25rem" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/settings")}
          >
            <ArrowLeft size={14} />
            &nbsp;Back to Settings
          </Button>
        </div>

        {/* Title */}
        <h1 className={cn(commonStyles.pageTitle, themeStyles.pageTitle)}>
          Delete Account
        </h1>
        <p className={cn(commonStyles.pageSub, themeStyles.pageSub)}>
          This action cannot be undone. Please read below carefully.
        </p>

        {/* Warning banner */}
        <div
          className={cn(
            commonStyles.warningBanner,
            themeStyles.warningBanner,
          )}
          role="alert"
        >
          <span className={commonStyles.warningIcon}>
            <AlertTriangle size={22} color="currentColor" />
          </span>
          <div className={commonStyles.warningContent}>
            <p
              className={cn(
                commonStyles.warningTitle,
                themeStyles.warningTitle,
              )}
            >
              What happens when you delete your account:
            </p>
            <ul
              className={cn(commonStyles.warningList, themeStyles.warningList)}
            >
              <li>Your profile, portfolio, and settings will be permanently removed.</li>
              <li>
                Your identity on active contracts will be anonymized — contract
                records are preserved for legal compliance.
              </li>
              <li>Pending payouts must be completed before deletion.</li>
              <li>You will be immediately logged out.</li>
            </ul>
          </div>
        </div>

        {/* Success state */}
        {success && (
          <div
            className={cn(commonStyles.successMsg, themeStyles.successMsg)}
            role="status"
          >
            ✓ Your account has been deleted. Redirecting…
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className={cn(commonStyles.errorMsg, themeStyles.errorMsg)}
            role="alert"
          >
            {error}
          </div>
        )}

        {!success && (
          <>
            {/* Password field */}
            <div className={commonStyles.fieldGroup}>
              <label
                htmlFor="del-password"
                className={cn(commonStyles.label, themeStyles.label)}
              >
                Confirm your password
              </label>
              <input
                id="del-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your current password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className={cn(commonStyles.input, themeStyles.input)}
                disabled={submitting}
                aria-required="true"
              />
            </div>

            {/* Confirmation checkbox */}
            <label className={commonStyles.checkboxRow}>
              <input
                type="checkbox"
                className={commonStyles.checkbox}
                checked={confirmed}
                onChange={(e) => {
                  setConfirmed(e.target.checked);
                  if (error) setError(null);
                }}
                disabled={submitting}
                aria-label="I understand this will permanently delete my account"
              />
              <span
                className={cn(
                  commonStyles.checkboxLabel,
                  themeStyles.checkboxLabel,
                )}
              >
                I understand this will <strong>permanently delete</strong> my
                account and all associated data. This action cannot be reversed.
              </span>
            </label>

            {/* Action buttons */}
            <div className={commonStyles.actions}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => router.push("/settings")}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                isLoading={submitting}
                onClick={handleDelete}
                fullWidth
                disabled={!confirmed || !password.trim()}
              >
                Delete My Account
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
