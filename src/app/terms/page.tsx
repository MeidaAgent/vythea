import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = { title: "Terms of Service", description: TERMS.description };

export default function Page() {
  return <LegalPage doc={TERMS} />;
}
