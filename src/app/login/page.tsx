import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginCard } from "@/components/account/LoginCard";
import { safeNext } from "@/lib/auth";
import { createClient, hasSupabase } from "@/lib/supabase/server";
import "@/styles/account.css";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const to = safeNext(next);

  if (!hasSupabase) {
    return (
      <div className="acct-wrap">
        <main id="main" className="acct-card">
          <h1>Sign in</h1>
          <p>Accounts aren&apos;t switched on for this site yet.</p>
        </main>
      </div>
    );
  }

  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (user) redirect(to);

  return <LoginCard next={to} failed={Boolean(error)} />;
}
