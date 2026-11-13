import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { REFUNDS } from "@/content/legal";

export const metadata: Metadata = { title: "Refund Policy", description: REFUNDS.description };

export default function Page() {
  return <LegalPage doc={REFUNDS} />;
}
