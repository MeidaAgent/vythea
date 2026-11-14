import { admin } from "@/lib/gateway/admin";
import { json } from "@/lib/gateway/device";
import { preflight } from "@/lib/gateway/http";
import { machine, type RunRow } from "@/lib/cloud";

export const dynamic = "force-dynamic";

/** POST: the server asking for work. Answers with the next waiting run, or none. Every call also says "I'm here". */
export async function POST(request: Request) {
  const m = await machine(request);
  if (m.refusal) return m.refusal;
  const { data, error } = await admin().rpc("cloud_claim_run", { p_machine: m.machine.id });
  if (error) return json({ error: "Please try again." }, 500);
  const run = ((data ?? []) as RunRow[])[0];
  return json({
    run: run
      ? {
          id: run.id,
          thread: run.thread,
          tier: run.tier,
          prompt: run.prompt,
          repo: run.repo ?? "",
          branch: run.branch ?? "",
          model: run.model ?? "",
          files: run.files ?? "",
        }
      : null,
  });
}

export const OPTIONS = preflight;
