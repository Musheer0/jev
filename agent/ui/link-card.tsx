import { cn } from "cn";
import { ExternalLink, Link as LinkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type ActionHandler, externalHref } from "./actions";
import type { LinkBlock } from "./response";

function hostname(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

export function LinkCard({
  block,
  onAction,
}: {
  block: LinkBlock;
  onAction: ActionHandler;
}) {
  const href = externalHref(block.link);
  const label = block.label ?? hostname(block.link);

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <LinkIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {hostname(block.link)}
          </p>
        </div>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onAction({ type: "open_link", link: block.link })}
            aria-label={`Open ${label} in a new tab`}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Unavailable</span>
        )}
      </CardContent>
    </Card>
  );
}
