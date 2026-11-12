import { DocsShell } from "@/components/docs/DocsShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { docSlugs, docsIndex, docsNav } from "@/lib/docs";
import "@/styles/docs.css";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const available = ["/docs", ...docSlugs().map((s) => `/docs/${s}`)];
  return (
    <>
      <DocsShell groups={docsNav} entries={docsIndex.flatMap((g) => g.items)} available={available}>
        {children}
      </DocsShell>
      <SiteFooter />
    </>
  );
}
