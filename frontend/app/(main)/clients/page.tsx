// @AI-HINT: Clients directory - for companies looking to hire talent — fully theme-aware via 3-file CSS module system
"use client";
import React from "react";
import Image from "next/image";
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
        {/* Client Workspace screenshot */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
          <Image
            src="/images/hero/client-workspace.png"
            alt="MegiLance Client Workspace — manage projects, track progress, communicate with freelancers"
            width={900}
            height={540}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
            style={{ width: '100%', maxWidth: '900px', height: 'auto', borderRadius: '20px', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.15)' }}
          />
        </div>
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

      {/* Client Trust Visual */}
      <section style={{ padding: '2rem', textAlign: 'center', background: 'transparent' }}>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          <Image
            src="/images/sections/client-trust.png"
            alt="Trusted by global clients — 100+ happy clients, from startups to enterprises"
            width={460}
            height={380}
            sizes="(max-width: 640px) 100vw, 460px"
            style={{ width: '100%', maxWidth: '460px', height: 'auto' }}
          />
          <Image
            src="/images/sections/client-manage.png"
            alt="Find and manage clients — connect with trusted clients and manage projects professionally"
            width={420}
            height={360}
            sizes="(max-width: 640px) 100vw, 420px"
            style={{ width: '100%', maxWidth: '420px', height: 'auto' }}
          />
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
