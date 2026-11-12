"use client";

import { useRouter } from "next/navigation";

/**
 * A guide page's body. The markup comes from the captured guide content (our own files in
 * src/content/docs), so it is rendered as HTML; clicks on in-site links are handed to the router.
 */
export function DocArticle({ html }: { html: string }) {
  const router = useRouter();

  return (
    <div
      className="docs-page"
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = (e.target as HTMLElement).closest("a");
        const href = a?.getAttribute("href");
        if (!a || !href || !href.startsWith("/") || a.target === "_blank") return;
        e.preventDefault();
        router.push(href);
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
