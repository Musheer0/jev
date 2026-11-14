import { ArrowRight, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AnswerPreview } from "@/components/landing/answer-preview";
import { BriefBuilder } from "@/components/landing/brief-builder";
import { ChatPreview } from "@/components/landing/chat-preview";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

const STEPS = [
  {
    title: "Describe the purchase",
    body: "A gift under ₹5,000. Running shoes for flat feet. One sentence is enough to start.",
  },
  {
    title: "Jev reads the listings",
    body: "It searches the web, opens product pages and checks the price, specs, image and availability on each one.",
  },
  {
    title: "Compare and decide",
    body: "You get product cards, a comparison table and a recommendation. Ask a follow-up to narrow it further.",
  },
];

const SECONDARY_FEATURES = [
  {
    term: "Side-by-side comparisons",
    detail:
      "A table with the same rows and columns, so specs line up instead of arriving as three separate answers.",
  },
  {
    term: "Memory for your preferences",
    detail:
      "Budgets, sizes and brands you avoid carry into the next conversation. Change them by saying so.",
  },
  {
    term: "Questions only when they matter",
    detail:
      "Multiple choice, four options or fewer, and only when a missing detail would change the search.",
  },
];

const MODES = [
  {
    name: "Tech Nerd",
    focus: "Specs, compatibility, benchmarks",
    starter: "Compare two laptops under ₹70,000",
  },
  {
    name: "Fashion Nerd",
    focus: "Fit, fabric, sizing, occasion",
    starter: "Kurta sets under ₹3,000 for a wedding",
  },
  {
    name: "Jack of All Trades",
    focus: "Gifts, home, everyday essentials",
    starter: "A housewarming gift under ₹1,500",
  },
];

const FAQS = [
  {
    q: "How are prices checked?",
    a: "Jev opens product pages and reads what is on them. A price or image only appears in an answer when it was seen on a live page. If a listing cannot be opened, you get a plain link and a note that it was not verified.",
  },
  {
    q: "Does it only work in India?",
    a: "Rupee budgets and Indian stores are the default. Ask about an international retailer and Jev will tell you what it can verify instead of guessing.",
  },
  {
    q: "What does it remember?",
    a: "Budgets, sizes, brands you trust and notes like “no leather” are saved to your session and used in later chats. You can change any of it by telling Jev.",
  },
  {
    q: "Do I need to know exactly what I want?",
    a: "No. Describe the job, such as a birthday gift for someone who likes coffee, and Jev narrows it down. It asks a question only when the answer changes what it should look for.",
  },
  {
    q: "What happens when a store blocks access?",
    a: "Jev reports the failure and offers the next best step, usually a link to inspect yourself or a different retailer. It does not fill the gap with an invented price.",
  },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

function PrimaryCta({
  href,
  children,
  className,
}: {
  href: ComponentProps<typeof Link>["href"];
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-contrast)] shadow-sm transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 ${className ?? ""}`}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <div className="landing flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14 lg:pb-16">
            <div>
              <Eyebrow>For shoppers in India</Eyebrow>
              <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                Stop guessing which one to buy.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Jev reads real product pages, compares verified ₹ prices side by
                side, and tells you which one it would pick. Ask in plain
                language and get an answer you can act on.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <PrimaryCta href="/chat/new">
                  Start a chat
                  <ArrowRight className="size-4" aria-hidden />
                </PrimaryCta>
                <a
                  href="#sample"
                  className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  See a sample answer
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                {[
                  "Reads the actual product page",
                  "Prices in ₹",
                  "Remembers your budget",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    <Check className="size-3.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-w-0">
              {/* Back layer: neutral shape that crosses into the next section. */}
              <div
                aria-hidden
                className="absolute -inset-x-3 -bottom-16 -top-3 rounded-2xl bg-muted/70"
              />
              <ChatPreview />
            </div>
          </div>
        </section>

        {/* Free sample: shopping brief builder */}
        <section
          id="brief"
          className="scroll-mt-20 pb-16 pt-12 sm:pb-24 sm:pt-16"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Eyebrow>Try it now</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Build your shopping brief.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Three choices produce a short brief. Copy it into a new chat so
                Jev starts with your budget, category and priority already
                stated.
              </p>
            </div>

            <div className="mt-10">
              <BriefBuilder />
            </div>
          </div>
        </section>

        {/* How it works: sequence */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-border bg-muted/30 py-16 sm:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Three steps, then an answer.
              </h2>
            </div>

            <ol className="mt-10 max-w-4xl divide-y divide-border border-y border-border">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-2 py-6 sm:grid-cols-[3rem_1fr_1.3fr] sm:items-baseline sm:gap-6"
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                  <h3 className="text-base font-medium">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-5 max-w-3xl text-xs leading-5 text-muted-foreground">
              Searches marketplaces, brand stores and specialist retailers. If a
              page cannot be opened, Jev says so instead of filling the gap.
            </p>
          </div>
        </section>

        {/* What you get: one dominant block plus a supporting list */}
        <section id="features" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <Eyebrow>Verified research</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                A price you can trace back to a page.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Most shopping tools describe what a product might cost. Jev
                shows what the listing said when it looked, and keeps the
                difference between the two visible.
              </p>
              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {[
                  "The price comes from the product page Jev opened.",
                  "The image comes from the same listing.",
                  "A detail that cannot be verified is marked as unverified.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-6">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Also in every answer
              </h3>
              <dl className="mt-4 divide-y divide-border border-y border-border">
                {SECONDARY_FEATURES.map((feature) => (
                  <div key={feature.term} className="py-4">
                    <dt className="text-sm font-medium">{feature.term}</dt>
                    <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                      {feature.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Sample answer */}
        <section
          id="sample"
          className="scroll-mt-20 border-y border-border bg-muted/30 py-16 sm:py-24"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
            <div>
              <Eyebrow>Example response</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                One answer, already compared.
              </h2>
              <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
                Product cards, a comparison table, a recommendation, and a
                question only where it helps. Prices and specs in this example
                are sample data.
              </p>
              <a
                href="#brief"
                className="mt-5 inline-flex text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Build your own brief
              </a>
            </div>
            <AnswerPreview />
          </div>
        </section>

        {/* Modes: compared in a table, not three equal cards */}
        <section id="modes" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <Eyebrow>Modes</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Three modes, one standard for checking.
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                The mode changes what Jev pays attention to. It does not change
                whether prices get checked.
              </p>
            </div>

            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-y border-border text-left text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    <th scope="col" className="py-3 pr-6 font-medium">
                      Mode
                    </th>
                    <th scope="col" className="py-3 pr-6 font-medium">
                      Focuses on
                    </th>
                    <th scope="col" className="py-3 font-medium">
                      Start with
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MODES.map((mode) => (
                    <tr key={mode.name} className="border-t border-border">
                      <th
                        scope="row"
                        className="py-4 pr-6 text-left font-medium"
                      >
                        {mode.name}
                      </th>
                      <td className="py-4 pr-6 text-muted-foreground">
                        {mode.focus}
                      </td>
                      <td className="py-4 text-muted-foreground">
                        &ldquo;{mode.starter}&rdquo;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Pick a mode when you start a chat.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-20 border-t border-border py-16 sm:py-20"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                The questions worth asking.
              </h2>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {FAQS.map((faq) => (
                <details
                  key={faq.q}
                  className="group [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2">
                    <span className="text-sm font-medium sm:text-[15px]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="pb-4 pr-6 text-sm leading-6 text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
              <div>
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Tell Jev what you need.
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Compare real options, check the ₹ price, decide once.
                </p>
              </div>
              <PrimaryCta href="/chat/new">
                Start a chat
                <ArrowRight className="size-4" aria-hidden />
              </PrimaryCta>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
