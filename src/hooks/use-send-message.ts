
"use client";

import { useMutation, useQuery } from "convex/react";
import { useRef, useState } from "react";

import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

import { runShoppingTurn } from "@/agent/generate-response";
import { responseToText } from "@/agent/ui/response";
import type { AgentId } from "@/agent/registry";

type SendMessageInput = {
  prompt: string;
};

export function useSendMessage(chatId: Id<"chats">) {
  const chat = useQuery(api.chats.get, { chatId });
  const messages = useQuery(api.messages.list, { chatId });

  const createMessage = useMutation(api.messages.create);

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sendingRef = useRef(false);

  const sendMessage = async ({ prompt }: SendMessageInput) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || sendingRef.current) return null;

    if (!chat) {
      setError("Chat is still loading.");
      return null;
    }

    sendingRef.current = true;
    setIsSending(true);
    setError(null);

    try {
      // Save the user's message.
      await createMessage({
        chatId,
        role: "user",
        content: trimmedPrompt,
      });
 const conversation = (messages||[])
      .map(
        (message) =>
          `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`,
      )
      .join("\n\n");

    const contextualPrompt = conversation
      ? `${conversation}\n\nUser: ${trimmedPrompt}`
      : trimmedPrompt;

      // Use the agent already assigned to this chat.
      const result = await runShoppingTurn(
        contextualPrompt,
        chat.agentId as AgentId,
        chatId,
      );

      if (!result.ok) {
        throw new Error(result.error);
      }

      // Save the assistant's response.
      await createMessage({
        chatId,
        role: "assistant",
        content: responseToText(result.response),
        response: result.response,
        metadata: {
          agentId: result.agentId,
        },
      });

      return result;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to send message.";

      setError(message);
      throw err;
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    messages: messages ?? [],
    chat,
    isLoading: chat === undefined || messages === undefined,
    isSending,
    error,
  };
}
