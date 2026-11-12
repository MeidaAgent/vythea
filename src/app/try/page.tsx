import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Playground } from "@/components/try/Playground";
import "@/styles/try.css";

export const metadata: Metadata = {
  title: "Playground",
  description: "Watch Vythea work through a task: a recorded session you can replay in the browser.",
};

export default function TryPage() {
  return (
    <>
      <main id="main" className="try paper">
        <div className="shell try-in" style={{ maxWidth: "var(--max)" }}>
          <Link href="/" className="try-home" aria-label="Vythea home">
            <Wordmark />
          </Link>
          <p className="micro">Try Vythea</p>
          <h1 style={{ margin: "14px 0 0", fontSize: "clamp(48px, 7vw, 112px)", lineHeight: 0.9 }}>
            Ask it
            <br />
            something.
          </h1>
          <p className="max-w-[52ch] font-light leading-normal text-ink-mute">
            A playback of real-shaped sessions: the plan, each tool call, what came back. It is a recording,
            not a live model, so nothing you type is sent anywhere.
          </p>

          <Playground />

          <p className="try-fine">
            Want the real thing? <Link href="/dashboard/download">Get the app</Link> ·{" "}
            <Link href="/price">See what every model costs</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
