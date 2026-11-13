import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Team" };

export default async function Page() {
  const me = await requireUser("/dashboard/team");
  return (
    <Soon
      kicker="Team"
      title={me ? "Team." : "Not available yet."}
      text={
        me
          ? "Share a workspace and keys with other people."
          : "Accounts aren't switched on for this site yet."
      }
      note={me ? "Teams aren't available yet." : undefined}
    />
  );
}
