import { tool } from "ai";
import { z } from "zod";
import { searchWeb, scrapePage } from "./services/firecrawl";

export const searchProducts = tool({
  description:
    "Search the web for products, prices, reviews, and comparisons. " +
    "Returns titles, URLs, and short descriptions. Use scrapeProductPage afterwards for details.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("A focused shopping search, e.g. 'best budget noise cancelling headphones 2026'"),
    limit: z.number().int().min(1).max(10).optional().describe("Number of results (default 5)"),
  }),
  execute: async ({ query, limit }) => {
    try {
      return { results: await searchWeb(query, limit) };
    } catch (err) {
      return { error: `Search failed: ${(err as Error).message}` };
    }
  },
});

export const scrapeProductPage = tool({
  description:
    "Fetch a product or review page and return its content as markdown. " +
    "Use to confirm price, specs, availability, or read a review in full.",
  inputSchema: z.object({
    url: z.string().url().describe("The full URL of the page to read"),
  }),
  execute: async ({ url }) => {
    try {
      return await scrapePage(url);
    } catch (err) {
      return { error: `Scrape failed: ${(err as Error).message}` };
    }
  },
});