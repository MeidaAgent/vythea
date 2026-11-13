import { json, signedOut, teamsOf, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/** GET /teams: the teams this person is in. */
export async function GET(request: Request) {
  const who = await whoIs(request);
  if (!who) return signedOut();
  return json(await teamsOf(who.userId));
}

export const OPTIONS = preflight;
