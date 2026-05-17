// @AI-HINT: Client contract detail view, connecting proposal flow to escrow
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { portalApi } from "@/lib/api";
import { useToaster } from "@/app/components/molecules/Toast/ToasterProvider";
import Button from "@/app/components/atoms/Button/Button";
import { PageTransition } from "@/app/components/Animations/PageTransition";
import { DollarSign, ArrowLeft, Shield } from "lucide-react";
import common from "./ContractDetail.common.module.css";
import light from "./ContractDetail.light.module.css";
import dark from "./ContractDetail.dark.module.css";

interface ContractDetailProps {
  params: {
    id: string;
  };
}

export default function ContractDetail({ params }: ContractDetailProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [themeStyles, setThemeStyles] = useState(light);
  const toaster = useToaster();

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resolvedTheme === "dark") setThemeStyles(dark);
    else if (resolvedTheme === "light") setThemeStyles(light);
  }, [resolvedTheme]);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        // Fetch contract directly by ID
        const { contractsApi } = await import("@/lib/api/projects");
        const found = await contractsApi.get(params.id);
        if (found) setContract(found as any);
        else toaster.error("Contract not found");
      } catch (err: any) {
        toaster.error(err.message || "Failed to load contract");
      } finally {
        setLoading(false);
      }
    };
    fetchContract();
  }, [params.id]);

  if (!resolvedTheme) return null;

  if (loading) {
    return (
      <div className={cn(common.container, themeStyles.container)}>
        <div className={common.loadingState}>
          <p>Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className={cn(common.container, themeStyles.container)}>
        <div className={cn(common.emptyState, themeStyles.emptyState)}>
          <h2>Contract Not Found</h2>
          <Button
            variant="primary"
            onClick={() => router.push("/client/contracts")}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className={cn(common.container, themeStyles.container)}>
        <div className={common.header}>
          <div className={common.titleGroup}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1>Contract Details</h1>
            <span className={cn(common.badge, themeStyles.badge)}>
              {contract.status || "Active"}
            </span>
          </div>
          <div className={common.actions}>
            <Button
              variant="success"
              onClick={() => router.push("/client/escrow")}
            >
              <Shield className="w-4 h-4 mr-2" /> Fund Escrow
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/contracts/${contract?.id}/workroom`)}
            >
              Go To Workroom
            </Button>
          </div>
        </div>

        <div className={cn(common.card, themeStyles.card)}>
          <div className={common.statsGrid}>
            <div className={common.statBox}>
              <span className={cn(common.statLabel, themeStyles.statLabel)}>
                Total Amount
              </span>
              <span className={cn(common.statValue, themeStyles.statValue)}>
                <DollarSign className="w-5 h-5" />
                {contract.amount || contract.terms?.price || 0}
              </span>
            </div>
            <div className={common.statBox}>
              <span className={cn(common.statLabel, themeStyles.statLabel)}>
                Freelancer ID
              </span>
              <span className={cn(common.statValue, themeStyles.statValue)}>
                {contract.freelancer_id}
              </span>
            </div>
          </div>
        </div>

        <div className={cn(common.card, themeStyles.card)}>
          <div className={common.section}>
            <h2>Terms & Description</h2>
            <div>
              {contract.terms?.description || "No specific terms described."}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
