import type { TextBlock } from "./response";

export function TextBlockView({ block }: { block: TextBlock }) {
  return <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{block.text}</p>;
}
