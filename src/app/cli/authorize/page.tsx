import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthorizeCard } from "@/components/account/AuthorizeCard";
import { displayName } from "@/lib/account";
import { createClient, hasSupabase } from "@/lib/supabase/server";
import "@/styles/account.css";

export const metadata: Metadata = { title: "Sign in to Vythea" };

/** Where the app sends the browser to sign a computer in: /cli/authorize?callback=…&state=…&client=… */
export default async function AuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ callback?: string; state?: string; client?: string }>;
}) {
  const { callback = "", state = "", client = "" } = await searchParams;
  const valid =
    /^http:\/\/127\.0\.0\.1:\d{1,5}\/$/.test(callback) && /^[0-9a-f]{32}$/.test(state) && (client === "cli" || client === "app");

  if (!hasSupabase || !valid) {
    return (
      <div className="acct-wrap">
        <main id="main" className="acct-card">
          <h1>Sign in to Vythea</h1>
          <p>This link isn&apos;t valid. Start the sign-in again from Vythea on your computer.</p>
        </main>
      </div>
    );
  }

  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) {
    const back = `/cli/authorize?${new URLSearchParams({ callback, state, client })}`;
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  return (
    <div className="acct-wrap">
      <main id="main" className="acct-card">
        <AuthorizeCard callback={callback} state={state} client={client as "cli" | "app"} name={displayName(user)} />
      </main>
    </div>
  );
}
