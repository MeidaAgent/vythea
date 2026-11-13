import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { checkTransaction, isChain } from "@/lib/crypto";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** POST { chain, tx }: look up a payment on the blockchain and, if it matches an open top-up, credit it. */
export async function POST(request: Request) {
  if (!hasSupabase) return NextResponse.json({ error: "Accounts are not switched on." }, { status: 503 });
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { chain?: unknown; tx?: unknown } | null;
  const tx = typeof body?.tx === "string" ? body.tx.trim().toLowerCase() : "";
  if (!isChain(body?.chain) || !/^0x[0-9a-f]{64}$/.test(tx)) {
    return NextResponse.json({ error: "Paste the full transaction hash, starting with 0x." }, { status: 400 });
  }

  let found;
  try {
    found = await checkTransaction(body.chain, tx);
  } catch {
    return NextResponse.json({ error: "Couldn't reach the network. Try again in a moment." }, { status: 502 });
  }
  if (found.state === "unknown") {
    return NextResponse.json({ error: "That transaction isn't on this network yet. Check the network and hash." }, { status: 404 });
  }
  if (found.state === "failed") {
    return NextResponse.json({ error: "That transaction failed on the network, so nothing was sent." }, { status: 422 });
  }
  if (found.state === "waiting") {
    return NextResponse.json(
      { pending: true, error: `Waiting for confirmations (${found.confirmations} of ${found.needed}). Try again in a minute.` },
      { status: 202 },
    );
  }
  if (found.state === "none") {
    return NextResponse.json(
      { error: "That transaction didn't send USDT or USDC to our address on this network." },
      { status: 422 },
    );
  }

  const db = admin();
  let credited = 0;
  let already = false;
  for (const payment of found.payments) {
    const { data: invoice } = await db
      .from("crypto_invoices")
      .select("id")
      .eq("chain", body.chain)
      .eq("amount_usd", payment.amount)
      .eq("status", "open")
      .maybeSingle();
    if (!invoice) continue;
    const { error } = await db.rpc("credit_invoice", {
      p_invoice: invoice.id,
      p_chain: body.chain,
      p_tx: tx,
      p_sender: payment.from,
      p_amount: Number(payment.amount),
    });
    if (!error) credited += Number(payment.amount);
    else if (error.code === "23505") already = true;
  }

  if (credited > 0) return NextResponse.json({ credited });
  if (already) return NextResponse.json({ error: "That payment was already counted." }, { status: 409 });
  return NextResponse.json(
    {
      error:
        "No open top-up matches this payment's exact amount. Amounts must match to the last digit; contact support@vythea.com with the transaction hash.",
    },
    { status: 422 },
  );
}
