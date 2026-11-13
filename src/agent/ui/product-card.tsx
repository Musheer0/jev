import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProductBlock } from "./response";
import type { ActionHandler } from "./actions";

export function ProductCard({ block, onAction }: { block: ProductBlock; onAction: ActionHandler }) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="flex gap-4 p-3 sm:p-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
          {/* Product images are supplied by the product source. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.img} alt={block.title} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <Badge variant="secondary">Product</Badge>
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 sm:text-base">{block.title}</h3>
          <p className="font-semibold tabular-nums">{block.price}</p>
          <Button size="sm" variant="outline" className="mt-auto" onClick={() => onAction({ type: "open_product", link: block.link, title: block.title })}>
            View product <ExternalLink className="ml-2 size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
