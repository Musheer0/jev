import type { ShoppingResponse } from "./response";
import { logAction, type ActionHandler } from "./actions";
import { TextBlockView } from "./text-block-view";
import { ProductCard } from "./product-card";
import { LinkCard } from "./link-card";
import { QuestionView } from "./question-view";
import { TableView } from "./table-view";

export function ShoppingResponseView({ response, onAction = logAction }: { response: ShoppingResponse; onAction?: ActionHandler }) {
  return (
    <div className="flex w-full flex-col gap-3">
      {response.blocks.map((block, index) => {
        switch (block.type) {
          case "text": return <TextBlockView key={index} block={block} />;
          case "product": return <ProductCard key={index} block={block} onAction={onAction} />;
          case "link": return <LinkCard key={index} block={block} onAction={onAction} />;
          case "question": return <QuestionView key={index} block={block} onAction={onAction} />;
          case "table": return <TableView key={index} block={block} />;
        }
      })}
    </div>
  );
}
