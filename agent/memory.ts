import { tool } from "ai";
import { z } from "zod";
import { saveMemory } from "./services/supermemory";

/** Bound to a userId so the model can never write to someone else's memory. */
export function createRememberTool(userId: string) {
  return tool({
    description:
      "Save a durable fact about the user for future conversations: budget, sizes, brands " +
      "they like or avoid, dietary needs, who they shop for, etc. " +
      "Only save things the user actually said. Do not save one-off search queries.",
    inputSchema: z.object({
      fact: z.string().describe("A short, self-contained statement, e.g. 'Prefers Sony over Bose. Budget under $300.'"),
    }),
    execute: async ({ fact }) => {
      try {
        await saveMemory(userId, fact);
        return { saved: true };
      } catch (err) {
        return { saved: false, error: (err as Error).message };
      }
    },
  });
}