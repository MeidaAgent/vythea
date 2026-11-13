import { json, signedOut, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/** POST /devices/team: teams aren't open yet. */
export async function POST(request: Request) {
  if (!(await whoIs(request))) return signedOut();
  return json({ error: "Teams aren't open yet." }, 400);
}

export const OPTIONS = preflight;
