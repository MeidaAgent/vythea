import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Cloud" };

export default async function Page() {
  const me = await requireUser("/dashboard/cloud");
  return (
    <Soon
      kicker="Cloud"
      title={me ? "Cloud." : "Not available yet."}
      text={
        me
          ? "Where your agent's projects run and get their live links."
          : "Accounts aren't switched on for this site yet."
      }
      note={me ? "Vythea Cloud isn't open yet." : undefined}
    />
  );
}
