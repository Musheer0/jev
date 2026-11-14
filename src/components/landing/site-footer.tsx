import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/mascot.png"
            alt=""
            width={36}
            height={36}
            className="size-8 object-contain"
          />
          <div>
            <p className="text-sm font-semibold tracking-tight">Jev</p>
            <p className="text-xs text-muted-foreground">
              Shopping research that checks.
            </p>
          </div>
        </div>

        <nav
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
          aria-label="Footer"
        >
          <Link
            href="/chat/new"
            className="transition-colors hover:text-foreground"
          >
            Start a chat
          </Link>
          <Link
            href="/demo"
            className="transition-colors hover:text-foreground"
          >
            Live demo
          </Link>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-foreground"
          >
            How it works
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {year} Jev · Built with Next.js and Convex
        </p>
      </div>
    </footer>
  );
}
