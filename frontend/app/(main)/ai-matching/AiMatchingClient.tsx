// @AI-HINT: AI Matching page — showcase AI capabilities with interactive search demo; theme-aware via 3-file CSS modules
"use client";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/app/components/molecules/Toast/use-toast";
import { useMounted } from "@/app/hooks/useMounted";
import commonStyles from "./AIMatching.common.module.css";
import lightStyles from "./AIMatching.light.module.css";
import darkStyles from "./AIMatching.dark.module.css";

export default function AiMatchingClient() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const t = (mounted && resolvedTheme === "dark") ? darkStyles : lightStyles;

  const handleMatch = () => {
    if (!query.trim()) {
      toast({
        title: "Enter a description",
        description: "Please describe your project to find matching talent.",
        variant: "warning",
      });
      return;
    }
    toast({
      title: "AI Matching — Demo Mode",
      description:
        "AI matching is not available in demo mode. Create a project to get started!",
    });
    router.push("/create-project");
  };

  return (
    <main className={commonStyles.container}>
      <div className={cn(commonStyles.hero, t.hero)}>
        <div className={commonStyles.heroInner}>
          <div className={cn(commonStyles.badge, t.badge)}>
            🤖 Powered by Advanced Machine Learning
          </div>

          <h1 className={commonStyles.heroTitle}>Objective Capability Mapping</h1>

          <p className={cn(commonStyles.heroDesc, t.heroDesc)}>
            Bypass resume inflation and screening bias. Describe your project requirements,
            and our machine learning engine will map them directly to freelancers' verified code history,
            technical assessments, and past client reviews, delivering a shortlist based purely on capability.
          </p>

          <div className={cn(commonStyles.searchBox, t.searchBox)}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMatch()}
              placeholder="e.g. I need a Next.js developer who knows Turso..."
              className={cn(commonStyles.searchInput, t.searchInput)}
              aria-label="Describe your project for AI talent matching"
            />
            <button
              onClick={handleMatch}
              className={commonStyles.searchBtn}
              aria-label="Find matching talent"
            >
              Match Me
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
