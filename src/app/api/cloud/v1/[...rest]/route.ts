import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { person } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/**
 * Parts of the cloud that a server of your own doesn't have: the run's live event stream (the app asks
 * the run every two seconds instead), hosted apps and workers, and the chat relay.
 */
async function notHere(request: Request, ctx: { params: Promise<{ rest: string[] }> }) {
  const p = await person(request);
  if (p.refusal) return p.refusal;
  const { rest } = await ctx.params;
  const path = rest.join("/");
  if (path === "apps") return json({ apps: [] });
  if (/^runs\/[^/]+\/support$/.test(path)) return json({ ok: true });
  return json({ error: "That isn't available on your own server." }, 404);
}

export const GET = notHere;
export const POST = notHere;
export const OPTIONS = preflight;
