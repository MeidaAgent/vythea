import { redirect } from "next/navigation";
import { createClient, hasSupabase } from "@/lib/supabase/server";

/**
 * The signed-in person for a dashboard page, or a redirect to /login that brings them back to
 * `next`. Returns null when accounts aren't switched on for this site.
 */
export async function requireUser(next: string) {
  if (!hasSupabase) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  const name = String(user.user_metadata?.user_name ?? user.email ?? "your account");
  return { supabase, user, name };
}
