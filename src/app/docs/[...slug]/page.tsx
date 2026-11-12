import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocArticle } from "@/components/docs/DocArticle";
import { docSlugs, getDoc, tocOf } from "@/lib/docs";

type Props = { params: Promise<{ slug: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return docSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = getDoc((await params).slug.join("/"));
  return doc ? { title: `${doc.title} · Guide`, description: doc.description } : {};
}

export default async function DocPage({ params }: Props) {
  const doc = getDoc((await params).slug.join("/"));
  if (!doc) notFound();
  const toc = tocOf(doc);

  return (
    <>
      <DocArticle html={doc.html} />
      {toc.length > 0 && (
        <aside className="docs-toc" aria-label="On this page">
          <p className="micro">On this page</p>
          {toc.map((t) => (
            <a key={t.href} href={t.href}>
              {t.label}
            </a>
          ))}
        </aside>
      )}
    </>
  );
}
