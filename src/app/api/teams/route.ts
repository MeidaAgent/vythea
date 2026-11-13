import { json, signedOut, whoIs } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";

export const dynamic = "force-dynamic";

/** GET /teams: teams aren't open yet, so the list is empty. */
export async function GET(request: Request) {
  if (!(await whoIs(request))) return signedOut();
  return json([]);
}

export const OPTIONS = preflight;
