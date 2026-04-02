import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SalesRole = "vendedor" | "financeiro" | "admin";

export interface SalesUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: SalesRole;
  active: boolean;
}

export function useSalesAuth() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [salesUser, setSalesUser] = useState<SalesUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setSalesUser(null);
      setLoading(false);
      return;
    }

    const fetchSalesUser = async () => {
      const { data } = await (supabase.from as any)("sales_users")
        .select("*")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle();

      if (data) {
        setSalesUser(data as SalesUser);
      }
      setLoading(false);
    };

    fetchSalesUser();
  }, [user, authLoading]);

  return {
    user,
    salesUser,
    loading: authLoading || loading,
    signOut,
    isAdmin: salesUser?.role === "admin",
    isFinanceiro: salesUser?.role === "financeiro",
    isVendedor: salesUser?.role === "vendedor",
    canManage: salesUser?.role === "admin" || salesUser?.role === "financeiro",
  };
}
