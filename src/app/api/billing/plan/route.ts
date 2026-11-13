import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** POST { plan, period }: buy a plan from the account's credit. */
export async function POST(request: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Accounts are not switched on." }, { status: 503 });
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { plan?: unknown; period?: unknown } | null;
  if (body?.plan !== "pro" || (body.period !== "month" && body.period !== "year")) {
    return NextResponse.json({ error: "Choose Pro, monthly or yearly." }, { status: 400 });
  }

  const { data, error } = await admin().rpc("buy_plan", { p_user: user.id, p_plan: body.plan, p_period: body.period });
  if (error) {
    const short = error.code === "P0002" || /insufficient credit/i.test(error.message);
    return NextResponse.json(
      { error: short ? "Not enough credit for this plan. Add credit first." : "Please try again." },
      { status: short ? 402 : 500 },
    );
  }
  return NextResponse.json({ plan: body.plan, until: data });
}
