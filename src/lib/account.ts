import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient, hasSupabase } from "@/lib/supabase/server";

const shorten = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** The wallet address of someone who signed in with a wallet, if they did. */
export function walletAddress(user: User): string | null {
  const web3 = user.identities?.find((i) => i.provider === "web3");
  const address = web3?.identity_data?.address ?? user.user_metadata?.custom_claims?.address;
  return typeof address === "string" ? address : null;
}

/** A readable name whichever way the person signed in: GitHub name, email, or a short wallet address. */
export function displayName(user: User): string {
  const wallet = walletAddress(user);
  return String(user.user_metadata?.user_name ?? user.email ?? (wallet ? shorten(wallet) : "your account"));
}

const METHOD: Record<string, string> = { github: "GitHub", google: "Google", email: "Email", web3: "Wallet" };

/** The ways this account can sign in, for the settings page. */
export function signInMethods(user: User): string[] {
  const found = (user.identities ?? []).map((i) => METHOD[i.provider] ?? i.provider);
  return found.length ? found : ["Email"];
}

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
  return { supabase, user, name: displayName(user) };
}
