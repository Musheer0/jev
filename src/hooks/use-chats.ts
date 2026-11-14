
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UseChatsOptions {
  sessionId: string | null;
}

export function useChats({ sessionId }: UseChatsOptions) {
  const chats = useQuery(
    api.chats.list,
    sessionId ? { sessionId } : "skip",
  );

  return {
    chats: chats ?? [],
    isLoading: !!sessionId && chats === undefined,
  };
}
