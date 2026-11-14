import Image from "next/image";

const SAMPLE_PICKS = [
  {
    name: "Flagship noise cancelling",
    detail: "30 h battery, 250 g",
    price: "₹24,990",
  },
  {
    name: "Comfort-first noise cancelling",
    detail: "24 h battery, 254 g",
    price: "₹23,900",
  },
  {
    name: "Marathon noise cancelling",
    detail: "60 h battery, 293 g",
    price: "₹22,990",
  },
];

export function ChatPreview() {
  return (
    <figure
      className="relative rounded-xl border border-border bg-card"
      aria-label="Example conversation with Jev"
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Image
          src="/mascot.png"
          alt=""
          width={24}
          height={24}
          className="size-6 object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-none">Jev</p>
          <p className="mt-1 text-xs text-muted-foreground">Tech Nerd</p>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Sample answer
        </span>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-lg bg-muted px-3.5 py-2.5 text-[13px] leading-5">
            Noise-cancelling headphones under ₹25,000 for long flights
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[13px] leading-5 text-muted-foreground">
            I read three listings and compared what was on the page. They are
            close on price, so battery and weight decide it.
          </p>

          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {SAMPLE_PICKS.map((pick) => (
              <li
                key={pick.name}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <span
                  className="size-9 shrink-0 rounded-md bg-muted"
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">
                    {pick.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {pick.detail}
                  </span>
                </span>
                <span className="text-[13px] font-medium tabular-nums">
                  {pick.price}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-[13px] leading-5">
            For flights I would take the 30-hour pair. It is the quietest of the
            three and still ₹10 under your limit.
          </p>

          <p className="text-xs text-muted-foreground">
            Preference saved: budget ₹25,000
          </p>
        </div>
      </div>

      <figcaption className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
        Example response. Sample data, not live pricing.
      </figcaption>
    </figure>
  );
}
