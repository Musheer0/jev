import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "What you get" },
  { href: "#modes", label: "Modes" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          aria-label="Jev home"
        >
          <Image
            src="/mascot.png"
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
            priority
          />
          <span className="text-base font-semibold tracking-tight">Jev</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/chat/new"
          className="rounded-md px-2 py-2 text-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
        >
          Start a chat
        </Link>
      </div>
    </header>
  );
}
