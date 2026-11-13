import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = { title: "Privacy Policy", description: PRIVACY.description };

export default function Page() {
  return <LegalPage doc={PRIVACY} />;
}
