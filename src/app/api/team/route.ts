import { NextResponse } from "next/server";
import { admin } from "@/lib/gateway/admin";
import { createClient, hasSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });
const uuid = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);

/** What a database refusal means to the person, in words. */
function why(message: string): { text: string; status: number } {
  const m = message.toLowerCase();
  if (m.includes("already in a team")) return { text: "You're already in a team.", status: 409 };
  if (m.includes("not the owner") || m.includes("not allowed")) return { text: "Only the team owner can do that.", status: 403 };
  if (m.includes("insufficient team credit")) return { text: "The team doesn't have that much credit.", status: 402 };
  if (m.includes("insufficient credit")) return { text: "You don't have that much credit.", status: 402 };
  if (m.includes("team is full")) return { text: "The team is full. Buy more seats to add people.", status: 409 };
  if (m.includes("fewer seats than members")) return { text: "You have more members than that many seats.", status: 409 };
  if (m.includes("unknown plan")) return { text: "Choose 2 to 5 seats, monthly or yearly.", status: 400 };
  if (m.includes("invite not valid")) return { text: "This invite link has expired or was already used.", status: 410 };
  if (m.includes("owner cannot be removed")) return { text: "The owner can't be removed.", status: 409 };
  if (m.includes("bad amount")) return { text: "Enter an amount.", status: 400 };
  return { text: "Please try again.", status: 500 };
}

/** POST { action, ... }: everything a person does to a team. The signed-in person is always the actor. */
export async function POST(request: Request) {
  if (!hasSupabase) return reply({ error: "Accounts are not switched on." }, 503);
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return reply({ error: "Sign in first." }, 401);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const action = body?.action;
  const db = admin();

  // The team this person belongs to, and their part in it.
  const mine = await db.from("team_members").select("team_id,role").eq("user_id", user.id).maybeSingle();
  const teamId = mine.data?.team_id as string | undefined;

  const fail = (message: string) => {
    const w = why(message);
    return reply({ error: w.text }, w.status);
  };

  switch (action) {
    case "create": {
      const name = typeof body?.name === "string" ? body.name.trim() : "";
      if (name.length < 2 || name.length > 60) return reply({ error: "Give the team a name of 2 to 60 characters." }, 400);
      const { error } = await db.rpc("team_create", { p_user: user.id, p_name: name });
      return error ? fail(error.message) : reply({ ok: true });
    }
    case "invite": {
      if (!teamId) return reply({ error: "You're not in a team." }, 404);
      const { data, error } = await db.rpc("team_invite_create", { p_team: teamId, p_user: user.id });
      if (error || typeof data !== "string") return fail(error?.message ?? "");
      const origin = new URL(request.url).origin;
      return reply({ link: `${origin}/team/join?token=${data}` });
    }
    case "credit": {
      if (!teamId) return reply({ error: "You're not in a team." }, 404);
      const amount = Number(body?.amount);
      if (!Number.isFinite(amount) || amount === 0) return reply({ error: "Enter an amount." }, 400);
      const { data, error } = await db.rpc("team_move_credit", {
        p_team: teamId,
        p_user: user.id,
        p_amount: Math.round(amount * 1e6) / 1e6,
      });
      return error ? fail(error.message) : reply({ pool: Number(data) });
    }
    case "plan": {
      if (!teamId) return reply({ error: "You're not in a team." }, 404);
      const seats = Number(body?.seats);
      const period = body?.period;
      if (!Number.isInteger(seats) || (period !== "month" && period !== "year")) {
        return reply({ error: "Choose 2 to 5 seats, monthly or yearly." }, 400);
      }
      const { data, error } = await db.rpc("team_buy_plan", { p_team: teamId, p_user: user.id, p_seats: seats, p_period: period });
      return error ? fail(error.message) : reply({ until: data });
    }
    case "limit": {
      if (!teamId || !uuid(body?.member)) return reply({ error: "Choose a member." }, 400);
      const raw = body?.limit;
      const limit = raw === null || raw === "" ? null : Number(raw);
      if (limit !== null && (!Number.isFinite(limit) || limit < 0)) return reply({ error: "Enter a limit in dollars." }, 400);
      const { error } = await db.rpc("team_member_limit", {
        p_team: teamId,
        p_actor: user.id,
        p_member: body.member,
        p_limit: limit,
      });
      return error ? fail(error.message) : reply({ ok: true });
    }
    case "remove": {
      if (!teamId || !uuid(body?.member)) return reply({ error: "Choose a member." }, 400);
      const { error } = await db.rpc("team_member_remove", { p_team: teamId, p_actor: user.id, p_member: body.member });
      return error ? fail(error.message) : reply({ ok: true });
    }
    case "leave": {
      if (!teamId) return reply({ error: "You're not in a team." }, 404);
      const { error } = await db.rpc("team_member_remove", { p_team: teamId, p_actor: user.id, p_member: user.id });
      return error ? fail(error.message) : reply({ ok: true });
    }
    case "join": {
      const token = typeof body?.token === "string" ? body.token : "";
      if (!/^vti-[0-9a-f]{48}$/.test(token)) return reply({ error: "This invite link isn't valid." }, 400);
      const { error } = await db.rpc("team_invite_accept", { p_user: user.id, p_token: token });
      return error ? fail(error.message) : reply({ ok: true });
    }
    default:
      return reply({ error: "Unknown action." }, 400);
  }
}
