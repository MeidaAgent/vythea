import { createClient } from "@supabase/supabase-js";

/**
 * Supabase as the server itself, with the secret key. Only the gateway uses this, on the server; the key
 * is never sent to a browser or to the app.
 */
export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("gateway is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type Admin = ReturnType<typeof admin>;

/** SHA-256 as lowercase hex: the same function the database used to store a key's hash. */
export async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
