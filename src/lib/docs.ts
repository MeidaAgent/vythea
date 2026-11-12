import navData from "@/content/docs/nav.json";
import pagesData from "@/content/docs/pages.json";

export type NavItem = { label: string; href: string; fold: boolean; children: NavItem[] };
export type NavGroup = { title: string; items: NavItem[] };
export type IndexEntry = { href: string; title: string; desc: string };
export type DocPage = { title: string; description: string; html: string; aside: string };

const pages = pagesData as Record<string, DocPage>;

export const docsNav = navData.groups as NavGroup[];
export const docsIndex = navData.index as { title: string; items: IndexEntry[] }[];

export const slugOf = (href: string) => href.replace(/^\/docs\/?/, "").replace(/\/$/, "");

/** Pages whose content was captured from the original guide. Others are listed but not linked. */
export const hasDoc = (href: string) => slugOf(href) in pages;
export const getDoc = (slug: string): DocPage | undefined => pages[slug];
export const docSlugs = () => Object.keys(pages);

/** The "On this page" list, lifted out of the captured markup. */
export function tocOf(page: DocPage): { href: string; label: string }[] {
  return [...page.aside.matchAll(/<a href="(#[^"]+)">(.*?)<\/a>/g)].map((m) => ({
    href: m[1],
    label: m[2].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
  }));
}
