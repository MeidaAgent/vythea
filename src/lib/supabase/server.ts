import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** True when the Supabase URL and key are set; without them accounts are switched off. */
export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

/** Supabase client for server components and route handlers, signed in as whoever the cookies say. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Called from a server component, which can't set cookies; the middleware refreshes them.
          }
        },
      },
    },
  );
}
