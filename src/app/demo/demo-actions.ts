
"use server";

import { routeAgent } from "@/prompts/agent-router";
import { createShoppingAgent } from "@/agent/create-shopping-agent";
import { agentRegistry, type AgentId } from "@/agent/registry";
import {
  shoppingResponseSchema,
  type ShoppingResponse,
} from "@/agent/ui/response";

export type ShoppingHistoryItem = {
  role: "user" | "assistant";
  text: string;
};

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
  history: ShoppingHistoryItem[],
  agentId?: AgentId|null,
): Promise<ShoppingTurnResult> {
  const trimmedPrompt = prompt.trim();

  if (!trimmedPrompt) {
    return { ok: false, error: "Enter something you want to shop for." };
  }

  try {
    // Reuse the selected agent on follow-up messages.
    // Only route the first message.
    const selectedAgent = agentId
      ? agentRegistry.find((agent) => agent.id === agentId)
      : (await routeAgent(trimmedPrompt)).agent ??
        agentRegistry.find((agent) => agent.id === "general");

    if (!selectedAgent) {
      throw new Error("Invalid agent ID or no shopping agent is configured.");
    }

    const agent = await createShoppingAgent(
      selectedAgent.prompt,
      "user_4f8eftrhafre",
    );

    // Include previous turns as context.
    const conversation = history
      .map(
        (message) =>
          `${message.role === "user" ? "User" : "Assistant"}: ${message.text}`,
      )
      .join("\n\n");

    const contextualPrompt = conversation
      ? `${conversation}\n\nUser: ${trimmedPrompt}`
      : trimmedPrompt;

    const result = await agent.generate({
      prompt: contextualPrompt,
    });

    const response = shoppingResponseSchema.parse(result.output);

    return {
      ok: true,
      response,
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
    };
  } catch (error) {
    console.error("[shopping-demo] Agent turn failed:", error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The shopping agent encountered an unexpected error.",
    };
  }
}
