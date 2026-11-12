import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TokenomicsContent } from "@/components/tokenomics/TokenomicsContent";
import { TokenomicsStage } from "@/components/tokenomics/TokenomicsStage";
import "@/styles/tokenomics.css";

export const metadata: Metadata = {
  title: "VYTH tokenomics",
  description:
    "VYTH is tied to how much Vythea is used: half of the margin on hosted models buys it back, and spending it or leaving a stake early burns it, in public.",
};

export default function TokenomicsPage() {
  return (
    <>
      <TokenomicsContent />
      <TokenomicsStage />
      <SiteFooter />
    </>
  );
}
