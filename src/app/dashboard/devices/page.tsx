import type { Metadata } from "next";
import { Devices, type DeviceRow } from "@/components/account/Devices";
import { Soon } from "@/components/account/Soon";
import { requireUser } from "@/lib/account";

export const metadata: Metadata = { title: "Devices" };

export default async function Page() {
  const me = await requireUser("/dashboard/devices");
  if (!me) {
    return <Soon kicker="Devices" title="Not available yet." text="Accounts aren't switched on for this site yet." />;
  }

  const { data } = await me.supabase
    .from("api_keys")
    .select("id,name,client,created_at,last_used_at")
    .eq("kind", "device")
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="dash-top">
        <p className="micro">Devices</p>
        <h1 className="dash-title">Devices.</h1>
        <p className="dash-sub">The computers signed in to your account. Sign any of them out whenever you like.</p>
      </div>
      <Devices devices={(data ?? []) as DeviceRow[]} />
    </div>
  );
}
