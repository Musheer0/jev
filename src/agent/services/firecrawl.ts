import Firecrawl from "@mendable/firecrawl-js";
import { config } from "../config";

let client: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (!client) client = new Firecrawl({ apiKey: config.firecrawlApiKey });
  return client;
}

export async function searchWeb(query: string, limit = config.searchLimit) {
  const results = await getClient().search(query, { limit });
  return (results.web ?? []).map((r: any) => ({
    title: r.title,
    url: r.url,
    description: r.description,
  }));
}

export async function scrapePage(url: string) {
  const result = await getClient().scrape(url, { formats: ["markdown"] });
  const markdown = result.markdown ?? "";
  return {
    url,
    // Keep the tool result small so it doesn't blow up the context window.
    content: markdown.slice(0, config.maxScrapeChars),
    truncated: markdown.length > config.maxScrapeChars,
  };
}