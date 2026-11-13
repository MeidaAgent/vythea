import { DashShell } from "@/components/dashboard/DashShell";
import { getShellInfo } from "@/lib/account";
import "@/styles/download.css";
import "@/styles/account.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getShellInfo();
  return (
    <DashShell name={me?.name ?? null} avatar={me?.avatar ?? null} credit={me?.credit ?? null}>
      {children}
    </DashShell>
  );
}
