import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Billing" };

export default async function Page() {
  const me = await requireUser("/dashboard/billing");
  return (
    <Soon
      kicker="Billing"
      title={me ? "Billing." : "Not available yet."}
      text={me ? "Plans, credits and invoices." : "Accounts aren't switched on for this site yet."}
      note={
        me
          ? "Everything is free during the alpha. Paid plans come later, and you will see them here first."
          : undefined
      }
    />
  );
}
