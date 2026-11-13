function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  // Read lazily so importing this file never throws at module load.
  get firecrawlApiKey() {
    return required("FIRECRAWL_API_KEY");
  },
  get supermemoryApiKey() {
    return required("SUPERMEMORY_API_KEY");
  },
  model: process.env.SHOPPING_AGENT_MODEL ?? "openai/gpt-oss-120b",
  maxSteps: 12,
  maxScrapeChars: 8000,
  searchLimit: 5,
};