import { Capabilities } from "@/components/home/Capabilities";
import { CloudSection } from "@/components/home/CloudSection";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Platforms } from "@/components/home/Platforms";
import { Pricing } from "@/components/home/Pricing";
import { TeaserVideo } from "@/components/home/TeaserVideo";
import { Dock } from "@/components/layout/Dock";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RevealScope } from "@/components/ui/RevealScope";

export default function HomePage() {
  return (
    <>
      <Dock />
      <main id="main">
        <Hero />
        <TeaserVideo />
        <Capabilities />
        <CloudSection />
        <Platforms />
        <Faq />
        <Pricing />
      </main>
      <SiteFooter />
      <RevealScope sheets={["base", "home"]} />
    </>
  );
}
