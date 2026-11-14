const ROWS = [
  ["Flagship", "₹24,990", "30 h", "250 g", "Quietest"],
  ["Comfort-first", "₹23,900", "24 h", "254 g", "Lightest"],
  ["Marathon", "₹22,990", "60 h", "293 g", "Battery"],
];

export function AnswerPreview() {
  return (
    <figure className="min-w-0" aria-label="Example structured answer from Jev">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm font-medium">Comparison, 3 picks</p>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Sample
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <p className="text-[13px] leading-5 text-muted-foreground">
            All three fit the budget. Battery and weight are the real
            differences.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Option
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Price
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Battery
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    Weight
                  </th>
                  <th scope="col" className="pb-2 font-medium">
                    Best for
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row[0]} className="border-t border-border align-top">
                    <th
                      scope="row"
                      className="py-2.5 pr-4 text-left font-medium"
                    >
                      {row[0]}
                    </th>
                    <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                      {row[1]}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                      {row[2]}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-muted-foreground">
                      {row[3]}
                    </td>
                    <td className="py-2.5 text-muted-foreground">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[13px] leading-5">
            Closest match: the flagship pair. You trade some battery for the
            quietest ride in the group.
          </p>

          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium">
              Mostly flights, or an open office?
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Flights", "Open office", "Both"].map((option) => (
                <span
                  key={option}
                  className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          Example response. Sample data, not live pricing.
        </p>
      </div>
    </figure>
  );
}
