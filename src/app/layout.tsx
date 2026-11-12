import type { Metadata, Viewport } from "next";
import { OS_DETECT_SCRIPT, SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s — Vythea" },
  description: SITE.description,
  icons: {
    icon: [{ url: "/assets/app-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/assets/app-192.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: "/assets/og-3.jpg",
        width: 1200,
        height: 630,
        alt: "The Vythea portrait in a blue dithered field.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/assets/og-3.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0040FF",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Which desktop this is, before the first paint, so the download button is right from the start. */}
        <script dangerouslySetInnerHTML={{ __html: OS_DETECT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
