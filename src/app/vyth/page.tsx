import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { VythContent } from "@/components/vyth/VythContent";
import { RevealScope } from "@/components/ui/RevealScope";
import "@/styles/vyth.css";

export const metadata: Metadata = {
  title: "VYTH: the Vythea token",
  description:
    "VYTH turns into the thing you actually use: AI credit, every day, for the agent and Vythea Cloud.",
};

export default function VythPage() {
  return (
    <>
      <VythContent />
      <SiteFooter />
      <RevealScope sheets={["vyth"]} />
    </>
  );
}
