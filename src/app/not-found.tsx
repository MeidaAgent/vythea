import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

export default function NotFound() {
  return (
    <main id="main" className="lost">
      <div className="shell">
        <Link href="/" aria-label="Vythea home" className="text-on-blue no-underline">
          <Wordmark />
        </Link>
        <p className="micro mt-10">404</p>
        <h1 className="mt-4">Nothing here.</h1>
        <p className="hero-sub" style={{ opacity: 1, animation: "none" }}>
          This page is not part of this build. Head back to the start, or open the guide.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="btn btn-fill">
            Back home
          </Link>
          <Link href="/docs" className="btn btn-hollow">
            Read the guide
          </Link>
        </div>
      </div>
    </main>
  );
}
