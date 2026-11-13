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
  searchParams: Promise<{ next?: string; error?: string; mode?: string; ref?: string }>;
}) {
  const { next, error, mode, ref } = await searchParams;
  const to = safeNext(next);
  // An invite code is a short run of letters and digits; anything else in the link is ignored.
  const refCode = ref && /^[a-z0-9]{4,16}$/i.test(ref) ? ref.toLowerCase() : "";

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

  return (
    <LoginCard
      next={to}
      failed={Boolean(error)}
      signup={mode === "signup" || Boolean(refCode)}
      refCode={refCode}
    />
  );
}
