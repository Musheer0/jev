import { create } from "zustand";
import type { AgentId } from "@/agent/registry";

type ShoppingChatState = {
  input: string;
  agentId: AgentId | null;

  setInput: (input: string) => void;
  clearInput: () => void;

  setAgentId: (agentId: AgentId | null) => void;

  appendAnswer: (question: string, answer: string | string[]) => void;
};

export const useShoppingChatStore = create<ShoppingChatState>((set) => ({
  input: "",
  agentId: null,

  setInput: (input) => set({ input }),
  clearInput: () => set({ input: "" }),

  setAgentId: (agentId) => set({ agentId }),

  appendAnswer: (question, answer) =>
    set((state) => {
      const formatted = Array.isArray(answer)
        ? answer.join(", ")
        : answer;

      const entry = `${question}: ${formatted}`;

      return {
        input: state.input.trim()
          ? `${state.input.trim()}\n${entry}`
          : entry,
      };
    }),
}));