import { type ActionHandler, openExternalAction } from "./actions";
import { LinkCard } from "./link-card";
import { ProductCard } from "./product-card";
import { QuestionView } from "./question-view";
import type { ShoppingResponse } from "./response";
import { TableView } from "./table-view";
import { TextBlockView } from "./text-block-view";

export function ShoppingResponseView({
  response,
  onAction = openExternalAction,
}: {
  response: ShoppingResponse;
  onAction?: ActionHandler;
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {response.blocks.map((block, index) => {
        switch (block.type) {
          case "text":
            return <TextBlockView key={index} block={block} />;
          case "product":
            return (
              <ProductCard key={index} block={block} onAction={onAction} />
            );
          case "link":
            return <LinkCard key={index} block={block} onAction={onAction} />;
          case "question":
            return (
              <QuestionView key={index} block={block} onAction={onAction} />
            );
          case "table":
            return <TableView key={index} block={block} />;
        }
      })}
    </div>
  );
}
