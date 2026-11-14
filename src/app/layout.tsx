import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";

// Self-hosted Host Grotesk variable font (latin).
// Fetching from Google Fonts at build time breaks offline/proxied builds,
// so the woff2 file is committed in src/app/fonts instead.
const hostGrotesk = localFont({
  src: "./fonts/HostGrotesk-Variable-latin.woff2",
  weight: "300 800",
  style: "normal",
  display: "swap",
  variable: "--font-sans",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Jev: shopping research that checks",
  description:
    "Jev reads real product pages, compares verified ₹ prices side by side, and tells you which one it would pick.",
  applicationName: "Jev",
  keywords: [
    "AI shopping assistant",
    "product research",
    "price comparison",
    "India shopping",
  ],
  openGraph: {
    title: "Jev: shopping research that checks",
    description:
      "Stop guessing which one to buy. Jev reads product pages, verifies ₹ prices and compares the options for you.",
    siteName: "Jev",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${hostGrotesk.className} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
