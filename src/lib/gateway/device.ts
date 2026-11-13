import { NextResponse } from "next/server";
import { admin, sha256Hex } from "@/lib/gateway/admin";
import { cors } from "@/lib/gateway/http";

/** An answer in the account API's shape: JSON, never cached, open to the app's requests. */
export function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: cors({ "Cache-Control": "no-store" }),
  });
}

/** The token a request carries, and the key or device it belongs to, if it is still good. */
export async function whoIs(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data } = await admin()
    .from("api_keys")
    .select("id,user_id,kind,team_id")
    .eq("key_hash", await sha256Hex(token))
    .is("revoked_at", null)
    .maybeSingle();
  return data
    ? { id: data.id as string, userId: data.user_id as string, kind: data.kind as string, teamId: (data.team_id as string | null) ?? null }
    : null;
}

export type TeamInfo = { id: string; name: string; credits: number; role: string };

/** The teams a person is in, in the shape the app reads: credit in whole cents. */
export async function teamsOf(userId: string): Promise<TeamInfo[]> {
  const { data } = await admin()
    .from("team_members")
    .select("role,teams(id,name,credits_usd)")
    .eq("user_id", userId);
  return (data ?? []).flatMap((row) => {
    const t = (Array.isArray(row.teams) ? row.teams[0] : row.teams) as { id: string; name: string; credits_usd: number } | null;
    return t ? [{ id: t.id, name: t.name, credits: Math.floor(Number(t.credits_usd) * 100), role: row.role as string }] : [];
  });
}

export const signedOut = () => json({ error: "This computer is signed out." }, 401);
