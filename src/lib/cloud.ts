import { admin } from "@/lib/gateway/admin";
import { json, signedOut, whoIs } from "@/lib/gateway/device";

export type RunRow = {
  id: string;
  thread: string;
  tier: string;
  status: string;
  prompt: string;
  answer: string;
  error: string;
  seconds: number;
  created_at: string;
  preview: string | null;
  repo?: string | null;
  branch?: string | null;
  model?: string | null;
  files?: string | null;
};

/** A run in the shape the app reads: times in whole seconds since the epoch. */
export const runJson = (r: RunRow) => ({
  id: r.id,
  thread: r.thread,
  tier: r.tier,
  status: r.status,
  prompt: r.prompt,
  answer: r.answer,
  error: r.error,
  seconds: r.seconds,
  created_at: Math.floor(new Date(r.created_at).getTime() / 1000),
  preview: r.preview,
});

/** The person behind an app request, or the answer to send back when there is none. */
export async function person(request: Request) {
  const who = await whoIs(request);
  return who ? { who } : { refusal: signedOut() };
}

/** The server behind an agent request: its token is a device token with a machine row. */
export async function machine(request: Request) {
  const who = await whoIs(request);
  if (!who) return { refusal: signedOut() };
  const { data } = await admin().from("cloud_machines").select("id,user_id").eq("api_key_id", who.id).maybeSingle();
  if (!data) return { refusal: json({ error: "This token is not a connected server." }, 403) };
  return { machine: { id: data.id as string, userId: data.user_id as string } };
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
