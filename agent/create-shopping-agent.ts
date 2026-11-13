import { ToolLoopAgent, Output, isStepCount } from "ai";
import { groq } from "@ai-sdk/groq";
import { config } from "./config";
import { buildInstructions } from "../prompts/base";
import { RESPONSE_FORMAT_RULES } from ".././prompts/response-format";
import { shoppingResponseSchema } from "./ui/response";
import { getUserMemories } from "./services/supermemory";
import { searchProducts, scrapeProductPage } from "./firecrawl";
import { createRememberTool } from "./memory";

/**
 * Creates a shopping agent for one user.
 * Final output is always `{ blocks: [...] }` matching shoppingResponseSchema.
 */
export async function createShoppingAgent(personalityPrompt: string, userId: string) {
  const memories = await getUserMemories(userId);

  return new ToolLoopAgent({
    model: groq(config.model),
    instructions: `${buildInstructions(personalityPrompt, memories)}\n\n${RESPONSE_FORMAT_RULES}`,
    tools: {
      searchProducts,
      scrapeProductPage,
      rememberUserFact: createRememberTool(userId),
    },
    output: Output.object({ schema: shoppingResponseSchema }),
    // The structured output is one extra step, so keep a few steps of headroom.
    stopWhen: isStepCount(config.maxSteps),
  });
}