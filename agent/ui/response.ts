import { z } from "zod";

const url = z.string().url();

/** Plain text message. No markdown. */
export const textBlockSchema = z.object({
  type: z.literal("text"),
  text: z.string().describe("Plain text only. No markdown, no tables, no bullet syntax."),
});

/** Full product card: only use when img and price were seen on a real page. */
export const productBlockSchema = z.object({
  type: z.literal("product"),
  title: z.string(),
  link: url,
  img: url.describe("Image URL taken from a page you scraped. Never guess."),
  price: z.string().describe("Price with currency exactly as seen, e.g. '$119.99'"),
});

/** Link-only result: use when you found a page but could not verify img or price. */
export const linkBlockSchema = z.object({
  type: z.literal("link"),
  link: url,
  label: z.string().optional().describe("Short label for the link"),
});

/** Multiple choice question to collect missing info. */
export const questionBlockSchema = z.object({
  type: z.literal("question"),
  id: z.string().describe("Stable short id, e.g. 'budget' or 'recipient'"),
  question: z.string(),
  multiple: z.boolean().describe("true if the user may pick more than one option"),
  options: z
    .array(z.object({ id: z.string(), label: z.string() }))
    .min(2)
    .max(6),
});

/** Comparison table. */
export const tableBlockSchema = z.object({
  type: z.literal("table"),
  headers: z.array(z.string()).min(2),
  rows: z.array(z.array(z.string())),
}).superRefine((table, ctx) => {
  table.rows.forEach((row, rowIndex) => {
    if (row.length !== table.headers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Row ${rowIndex + 1} must contain exactly ${table.headers.length} cells.`,
        path: ["rows", rowIndex],
      });
    }
  });
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  productBlockSchema,
  linkBlockSchema,
  questionBlockSchema,
  tableBlockSchema,
]);

/** Root must be an object for structured output. */
export const shoppingResponseSchema = z.object({
  blocks: z.array(blockSchema).min(1),
});

export type TextBlock = z.infer<typeof textBlockSchema>;
export type ProductBlock = z.infer<typeof productBlockSchema>;
export type LinkBlock = z.infer<typeof linkBlockSchema>;
export type QuestionBlock = z.infer<typeof questionBlockSchema>;
export type TableBlock = z.infer<typeof tableBlockSchema>;
export type ShoppingBlock = z.infer<typeof blockSchema>;
export type ShoppingResponse = z.infer<typeof shoppingResponseSchema>;

/** Flatten a response to plain text, for conversation history. */
export function responseToText(response: ShoppingResponse): string {
  return response.blocks
    .map((b) => {
      switch (b.type) {
        case "text":
          return b.text;
        case "product":
          return `${b.title} - ${b.price} - ${b.link}`;
        case "link":
          return `${b.label ?? "Link"}: ${b.link}`;
        case "question":
          return `${b.question} Options: ${b.options.map((o) => o.label).join(", ")}`;
        case "table":
          return [b.headers.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
      }
    })
    .join("\n");
}