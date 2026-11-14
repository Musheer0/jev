"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Tech", "Fashion", "Home", "A gift"] as const;
const BUDGETS = [
  "Under ₹2,000",
  "₹2,000 to ₹5,000",
  "₹5,000 to ₹15,000",
  "₹15,000+",
] as const;
const PRIORITIES = [
  "Best value",
  "Best quality",
  "Fast delivery",
  "Should last",
] as const;

type Category = (typeof CATEGORIES)[number];
type Budget = (typeof BUDGETS)[number];
type Priority = (typeof PRIORITIES)[number];

function Choice({
  group,
  label,
  checked,
  onSelect,
}: {
  group: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label className="relative">
      <input
        type="radio"
        name={group}
        value={label}
        checked={checked}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span className="flex min-h-11 cursor-pointer items-center rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-foreground peer-focus-visible:ring-offset-2">
        {label}
      </span>
    </label>
  );
}

export function BriefBuilder() {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("Tech");
  const [budget, setBudget] = useState<Budget>("₹5,000 to ₹15,000");
  const [priority, setPriority] = useState<Priority>("Best value");
  const [isStarting, setIsStarting] = useState(false);
  const [applyError, setApplyError] = useState(false);

  const subject = category === "A gift" ? "a gift" : category.toLowerCase();
  const brief = `I'm shopping for ${subject}. Budget: ${budget}. What matters most: ${priority.toLowerCase()}. Compare a few real options, check the ₹ price on each product page, and tell me which one you would pick.`;

  function choose<T>(set: (value: T) => void, value: T) {
    set(value);
    setApplyError(false);
  }

  async function startChat() {
    setIsStarting(true);
    setApplyError(false);

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(brief);
    } catch {
      setIsStarting(false);
      setApplyError(true);
      return;
    }

    router.push("/chat/new");
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-medium">What are you buying?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.map((option) => (
              <Choice
                key={option}
                group="brief-category"
                label={option}
                checked={category === option}
                onSelect={() => choose(setCategory, option)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">What is the budget?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {BUDGETS.map((option) => (
              <Choice
                key={option}
                group="brief-budget"
                label={option}
                checked={budget === option}
                onSelect={() => choose(setBudget, option)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">What matters most?</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRIORITIES.map((option) => (
              <Choice
                key={option}
                group="brief-priority"
                label={option}
                checked={priority === option}
                onSelect={() => choose(setPriority, option)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Your brief
        </p>
        <p
          aria-live="polite"
          className="mt-3 min-h-24 text-sm leading-6 [overflow-wrap:anywhere]"
        >
          {brief}
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={startChat}
            disabled={isStarting}
            aria-busy={isStarting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-contrast)] shadow-sm transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            <Copy className="size-4" aria-hidden />
            {isStarting ? "Opening chat" : "Copy brief and start a chat"}
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Copies the brief, then opens a new chat. Paste it as your first
          message.
        </p>

        {applyError ? (
          <div role="alert" className="mt-2 space-y-1 text-xs leading-5">
            <p className="text-destructive">
              Your browser blocked clipboard access, so the brief was not
              copied.
            </p>
            <p className="text-muted-foreground">
              Select the text above to copy it, or{" "}
              <Link
                href="/chat/new"
                className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
              >
                open a new chat
              </Link>{" "}
              and type it yourself.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
