// @AI-HINT: Clients directory - for companies looking to hire talent — fully theme-aware via 3-file CSS module system
"use client";
import React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import commonStyles from "./Clients.common.module.css";
import lightStyles from "./Clients.light.module.css";
import darkStyles from "./Clients.dark.module.css";

export default function ClientsPage() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  if (!resolvedTheme) return null;
  const t = resolvedTheme === "light" ? lightStyles : darkStyles;

  return (
    <main className={cn(commonStyles.container, t.container)}>
      <header className={cn(commonStyles.hero, t.hero)}>
        <h1 className={commonStyles.heroTitle}>
          Hire the top 1% of freelance talent.
        </h1>
        <p className={cn(commonStyles.heroSubtitle, t.heroSubtitle)}>
          MegiLance connects you with vetted professionals for your most
          important projects. Scale your team on demand.
        </p>
        <div className={commonStyles.heroActions}>
          <button
            className={cn(commonStyles.btnPrimary, t.btnPrimary)}
            onClick={() => router.push("/create-project")}
            aria-label="Post a job on MegiLance"
          >
            Post a Job
          </button>
          <button
            className={cn(commonStyles.btnOutline, t.btnOutline)}
            onClick={() => router.push("/freelancers")}
            aria-label="Browse available talent"
          >
            Browse Talent
          </button>
        </div>
      </header>

      <section className={commonStyles.featuresSection}>
        <h2 className={cn(commonStyles.featuresTitle, t.featuresTitle)}>
          Why companies choose MegiLance
        </h2>
        <div className={commonStyles.featuresGrid}>
          <div className={cn(commonStyles.featureCard, t.featureCard)}>
            <h3
              className={cn(commonStyles.featureCardTitle, t.featureCardTitle)}
            >
              AI Matching
            </h3>
            <p className={cn(commonStyles.featureCardText, t.featureCardText)}>
              Our AI algorithms analyze your project requirements and instantly
              match you with the best candidates.
            </p>
          </div>
          <div className={cn(commonStyles.featureCard, t.featureCard)}>
            <h3
              className={cn(commonStyles.featureCardTitle, t.featureCardTitle)}
            >
              Vetted Talent
            </h3>
            <p className={cn(commonStyles.featureCardText, t.featureCardText)}>
              Every freelancer goes through a rigorous screening process to
              ensure high-quality delivery.
            </p>
          </div>
          <div className={cn(commonStyles.featureCard, t.featureCard)}>
            <h3
              className={cn(commonStyles.featureCardTitle, t.featureCardTitle)}
            >
              Secure Payments
            </h3>
            <p className={cn(commonStyles.featureCardText, t.featureCardText)}>
              Payment is held safely in escrow until you approve the work.
              Milestone-based tracking available.
            </p>
          </div>
        </div>
      </section>

      <section className={cn(commonStyles.ctaSection, t.ctaSection)}>
        <h2 className={cn(commonStyles.ctaTitle, t.ctaTitle)}>
          Ready to build something amazing?
        </h2>
        <button
          className={cn(commonStyles.btnPrimary, t.btnPrimary)}
          onClick={() => router.push("/auth/signup")}
          aria-label="Sign up as a client"
        >
          Sign up as a Client
        </button>
      </section>
    </main>
  );
}
