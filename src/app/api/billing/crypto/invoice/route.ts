import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { CHAINS, PAY_ADDRESS, isChain } from "@/lib/crypto";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** POST { chain, amount }: a new top-up request, with the exact amount to send and where. */
export async function POST(request: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Accounts are not switched on." }, { status: 503 });
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { chain?: unknown; amount?: unknown } | null;
  const amount = Number(body?.amount);
  if (!isChain(body?.chain) || !Number.isFinite(amount) || amount < 5 || amount > 1000) {
    return NextResponse.json({ error: "Choose a network and an amount from $5 to $1,000." }, { status: 400 });
  }

  const { data, error } = await admin().rpc("create_invoice", {
    p_user: user.id,
    p_base: Math.round(amount * 100) / 100,
    p_chain: body.chain,
  });
  if (error || !data?.[0]) {
    const many = error?.message.includes("too many");
    return NextResponse.json(
      { error: many ? "You have several open top-ups already. Finish or wait for them to expire." : "Please try again." },
      { status: many ? 429 : 500 },
    );
  }
  const invoice = data[0] as { id: string; amount_usd: string | number; expires_at: string };
  return NextResponse.json({
    id: invoice.id,
    chain: body.chain,
    network: CHAINS[body.chain].name,
    tokens: CHAINS[body.chain].tokens.map((t) => t.symbol),
    address: PAY_ADDRESS,
    amount: Number(invoice.amount_usd).toFixed(6),
    expires: invoice.expires_at,
  });
}
