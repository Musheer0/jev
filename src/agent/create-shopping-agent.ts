
import { ToolLoopAgent, Output, isStepCount } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

import { config } from "./config";
import { buildInstructions } from "../prompts/base";
import { RESPONSE_FORMAT_RULES } from "../prompts/response-format";
import { shoppingResponseSchema } from "./ui/response";
import { getUserMemories } from "./services/supermemory";
import { searchProducts, scrapeProductPage } from "./firecrawl";
import { createRememberTool } from "./memory";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

const model = openrouter.chat("xiaomi/mimo-v2.6-flash-20260921");

export async function createShoppingAgent(
  personalityPrompt: string,
  userId: string,
) {
  const memories = await getUserMemories(userId);

  return new ToolLoopAgent({
    model,

    instructions: `
${buildInstructions(personalityPrompt, memories)}

${RESPONSE_FORMAT_RULES}

SHOPPING SEARCH RULES:
- For product discovery requests, you MUST call searchProducts.
- Never claim that you searched unless searchProducts was actually executed.
- Never invent product names, prices, ratings, availability, or specifications.
- Use the actual searchProducts results to make recommendations.
- Use scrapeProductPage when more product details are needed.
- If searchProducts returns no results, clearly say that no products were found.
`,

    tools: {
      searchProducts,
      scrapeProductPage,
      rememberUserFact: createRememberTool(userId),
    },

    // Force actual product search on the first model step.
    // Allow the model to choose tools normally afterwards.
    prepareStep: ({ stepNumber }) => {
      if (stepNumber === 0) {
        return {
          toolChoice: {
            type: "tool",
            toolName: "searchProducts",
          },
        };
      }

      return {
        toolChoice: "auto",
      };
    },

    output: Output.object({
      schema: shoppingResponseSchema,
    }),

    stopWhen: isStepCount(config.maxSteps),
  });
}
