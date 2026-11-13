import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keeps the sign-in session fresh on the pages that use it. */
export async function middleware(request: NextRequest) {
  // If the sign-in provider sends people to the front page instead of /auth/callback (its list of allowed
  // addresses decides that), the one-time code arrives here: pass it on so they still end up signed in.
  const { pathname, searchParams } = request.nextUrl;
  if (pathname === "/" && searchParams.has("code")) {
    const to = request.nextUrl.clone();
    to.pathname = "/auth/callback";
    return NextResponse.redirect(to);
  }
  if (pathname === "/") return NextResponse.next();

  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ["/", "/dashboard/:path*", "/login"] };
