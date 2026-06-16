// @AI-HINT: Root contracts page - redirects to role-specific contracts view using useAuth to avoid localStorage race conditions
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/app/components/atoms/Loading/Loading";

export default function ContractsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    const role = user?.user_type || user?.role || "client";
    if (role === "freelancer") {
      router.replace("/freelancer/contracts");
    } else if (role === "admin") {
      router.replace("/admin/projects");
    } else {
      router.replace("/client/contracts");
    }
  }, [user, isLoading, router]);

  return <Loading text="Loading contracts..." />;
}
