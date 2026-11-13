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
    .select("id,user_id,kind")
    .eq("key_hash", await sha256Hex(token))
    .is("revoked_at", null)
    .maybeSingle();
  return data ? { id: data.id as string, userId: data.user_id as string, kind: data.kind as string } : null;
}

export const signedOut = () => json({ error: "This computer is signed out." }, 401);
