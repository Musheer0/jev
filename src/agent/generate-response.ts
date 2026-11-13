
"use server";

import { routeAgent } from "@/prompts/agent-router";
import { createShoppingAgent } from "@/agent/create-shopping-agent";
import { agentRegistry, type AgentId } from "@/agent/registry";
import {
  shoppingResponseSchema,
  type ShoppingResponse,
} from "@/agent/ui/response";

export type ShoppingTurnResult =
  | {
      ok: true;
      response: ShoppingResponse;
      agentId: AgentId;
      agentName: string;
    }
  | { ok: false; error: string };

export async function runShoppingTurn(
  prompt: string,
  agentId?: AgentId | null,
  chatId?: string,
): Promise<ShoppingTurnResult> {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return { ok: false, error: "Enter something you want to shop for." };
  }

  try {
    const selectedAgent = agentId
      ? agentRegistry.find((agent) => agent.id === agentId)
      : (await routeAgent(trimmedPrompt)).agent ??
        agentRegistry.find((agent) => agent.id === "general");

    if (!selectedAgent) {
      throw new Error("Invalid agent ID or no shopping agent is configured.");
    }

    const agent = await createShoppingAgent(
      selectedAgent.prompt,
      chatId ?? "anonymous",
    );

    const result = await agent.generate({
      prompt: trimmedPrompt,
    });

    const response = shoppingResponseSchema.parse(result.output);

    return {
      ok: true,
      response,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
    };
  } catch (error) {
    console.error("[shopping] Agent turn failed:", error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The shopping agent encountered an unexpected error.",
    };
  }
}
