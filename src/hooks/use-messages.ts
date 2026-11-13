
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface UseMessagesOptions {
  chatId?: Id<"chats">;
}

export function useMessages({ chatId }: UseMessagesOptions) {
  const messages = useQuery(
    api.messages.list,
    chatId ? { chatId } : "skip"
  );

  return {
    messages: messages ?? [],
    isLoading: chatId ? messages === undefined : false,
  };
}
