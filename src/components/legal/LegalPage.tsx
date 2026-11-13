import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LEGAL_UPDATED, type LegalDoc } from "@/content/legal";
import "@/styles/legal.css";

/** A plain reading page for the terms, privacy and refund documents. */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <header className="lp-bar">
        <div className="shell lp-bar-in">
          <Link href="/" aria-label="Vythea home" className="lp-home">
            <Wordmark />
          </Link>
          <Link href="/" className="micro lp-back">
            Back to the site
          </Link>
        </div>
      </header>

      <main id="main" className="lp">
        <div className="shell lp-in">
          <p className="micro lp-kicker">{"Vythea // Legal"}</p>
          <h1>{doc.title}</h1>
          <p className="lp-date micro">Last updated {LEGAL_UPDATED}</p>
          <p className="lp-intro">{doc.intro}</p>

          {doc.sections.map((s, i) => (
            <section key={s.heading} className="lp-sec">
              <h2>
                <span className="micro">{String(i + 1).padStart(2, "0")}</span>
                {s.heading}
              </h2>
              {s.blocks.map((b, j) =>
                Array.isArray(b) ? (
                  <ul key={j}>
                    {b.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={j}>{b}</p>
                ),
              )}
            </section>
          ))}

          <nav className="lp-more micro" aria-label="Other legal pages">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/refunds">Refund Policy</Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
