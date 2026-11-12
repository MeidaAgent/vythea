import { DashShell } from "@/components/dashboard/DashShell";
import "@/styles/download.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashShell>{children}</DashShell>;
}
