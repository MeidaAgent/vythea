import type { Metadata } from "next";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Devices" };

export default async function Page() {
  const me = await requireUser("/dashboard/devices");
  return (
    <Soon
      kicker="Devices"
      title={me ? "Devices." : "Not available yet."}
      text={
        me ? "The computers signed in to your account." : "Accounts aren't switched on for this site yet."
      }
      note={me ? "Computers appear here once you can sign in from the app. That isn't open yet." : undefined}
    />
  );
}
