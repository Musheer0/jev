
"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { api } from "../../convex/_generated/api";
import { generateChatTitle } from "@/agent/create-chat-title";
import { routeAgent } from "@/prompts/agent-router";

type CreateChatInput = {
  prompt: string;
};

export function useCreateChat() {
  const router = useRouter();
  const createChatMutation = useMutation(api.chats.create);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate requests before React updates state.
  const isCreatingRef = useRef(false);

  const create = async ({ prompt }: CreateChatInput) => {
    if (isCreatingRef.current) return null;

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a message.");
      return null;
    }

    isCreatingRef.current = true;
    setIsCreating(true);
    setError(null);

    try {
      // Reuse the anonymous session ID across conversations.
      let sessionId = localStorage.getItem("shopping-session-id");

      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("shopping-session-id", sessionId);
      }

      // Automatically select the agent based on the prompt.
      const decision = await routeAgent(trimmedPrompt);

      if (!decision?.agentId) {
        throw new Error("Couldn't determine the right agent. Please try again.");
      }

      const title =await  generateChatTitle(trimmedPrompt)

      const chatId = await createChatMutation({
        sessionId,
        agentId: decision.agentId,
        title,
      });

      router.push(`/chat/${chatId}?prompt=${prompt}`);

     
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong while creating your chat.";

      setError(message);
      throw err;
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  };

  return {
    createChat: create,
    isCreating,
    error,
  };
}
