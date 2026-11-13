import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Usage" };

export default async function Page() {
  const me = await requireUser("/dashboard/usage");
  return (
    <Soon
      kicker="Usage"
      title={me ? "Usage." : "Not available yet."}
      text={
        me ? "Requests and tokens for each of your keys." : "Accounts aren't switched on for this site yet."
      }
      note={me ? "Nothing to show yet. The gateway isn't open, so no requests have been made." : undefined}
    />
  );
}
