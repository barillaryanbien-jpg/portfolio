import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/supabase/config";
import { createSessionClient } from "@/lib/supabase/server";

export const getAdmin = cache(async () => {
  if (!supabaseConfig()) return null;
  const client = await createSessionClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  const { data: allowed, error: accessError } =
    await client.rpc("is_portfolio_admin");
  if (accessError || !allowed) return null;
  return { client, user };
});

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
