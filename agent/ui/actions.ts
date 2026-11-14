export type UIAction =
  | { type: "open_product"; link: string; title: string }
  | { type: "open_link"; link: string }
  | { type: "answer"; questionId: string; optionIds: string[] };

export type ActionHandler = (action: UIAction) => void;

/**
 * Blocks come from model output, so only render links that are real web URLs.
 * Returns null for `javascript:`, `data:` or malformed values.
 */
export function externalHref(link: string): string | null {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Default handler for places that do not need custom behaviour. */
export const logAction: ActionHandler = (action) => {
  console.log("[shopping-ui]", action);
};

/** Opens product and link blocks in a new tab. */
export const openExternalAction: ActionHandler = (action) => {
  if (action.type !== "open_product" && action.type !== "open_link") return;

  const href = externalHref(action.link);
  if (!href) return;

  window.open(href, "_blank", "noopener,noreferrer");
};
