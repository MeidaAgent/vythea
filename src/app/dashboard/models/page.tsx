import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Models" };

export default async function Page() {
  const me = await requireUser("/dashboard/models");
  return (
    <Soon
      kicker="Models"
      title={me ? "Models." : "Not available yet."}
      text={
        me
          ? "The models you can call through one endpoint."
          : "Accounts aren't switched on for this site yet."
      }
      note={me ? "The model list is published when the gateway opens." : undefined}
    />
  );
}
