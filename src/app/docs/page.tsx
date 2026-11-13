import type { Metadata } from "next";
import Link from "next/link";
import { docsIndex, hasDoc } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "How to use Vythea: getting started, the app, the terminal, gateways, hosted models, teams, VYTH and your data.",
};

export default function DocsIndexPage() {
  return (
    <div className="docs-page">
      <p className="micro">Guide</p>
      <h1 className="docs-title">How to use Vythea</h1>
      <p className="docs-lede">
        From making an account to the terminal&apos;s every command. Something missing? Write to
        support@vythea.com.
      </p>
      {docsIndex.map((group) => (
        <section className="docs-index-g" key={group.title}>
          <p className="micro">{group.title}</p>
          <ul className="docs-index">
            {group.items.map((item) => {
              const body = (
                <>
                  <span className="docs-index-t">{item.title}</span>
                  <span className="docs-index-d">{item.desc}</span>
                </>
              );
              return (
                <li key={item.href}>
                  {hasDoc(item.href) ? (
                    <Link href={item.href}>{body}</Link>
                  ) : (
                    // Listed in the original guide, but its page was not captured for this build.
                    <a className="is-missing" aria-disabled="true">
                      {body}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
