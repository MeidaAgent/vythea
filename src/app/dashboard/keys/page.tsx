import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Keys } from "@/components/account/Keys";
import { createClient, hasSupabase } from "@/lib/supabase/server";
import "@/styles/account.css";

export const metadata: Metadata = { title: "API keys" };

export default async function KeysPage() {
  if (!hasSupabase) {
    return (
      <div className="dash-top">
        <p className="micro">API keys</p>
        <h1 className="dash-title">Not available yet.</h1>
        <p className="dash-sub">Accounts aren&apos;t switched on for this site yet.</p>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/keys");

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id,name,prefix,created_at,last_used_at")
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  const username = String(user.user_metadata?.user_name ?? user.email ?? "your account");

  return (
    <div>
      <div className="dash-top">
        <p className="micro">API keys</p>
        <h1 className="dash-title">Your keys.</h1>
        <p className="dash-sub">One key per app or machine. Revoke any of them whenever you like.</p>
      </div>
      <Keys initial={keys ?? []} username={username} />
    </div>
  );
}
