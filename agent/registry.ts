// agents/types.ts
export const agentIds = ["tech-nerd", "fashion-stylist", "general"] as const;

export type AgentId = (typeof agentIds)[number];

export interface AgentDefinition {
  readonly id: AgentId;
  readonly name: string;
  readonly description: string;
  readonly prompt: string;
}

// agents/registry.ts
import { fashion_prompt } from "@/prompts/fashion";
import { general_prompt } from "@/prompts/general";
import { tech_prompt } from "@/prompts/tech";


export const agentRegistry: AgentDefinition[] = [
  {
    id: "tech-nerd",
    name: "Tech Nerd",
    description:
      "PC components, laptops, electronics, peripherals, " +
      "hardware compatibility and technical shopping.",
    prompt: tech_prompt,
  },
  {
    id: "fashion-stylist",
    name: "Fashion Stylist",
    description:
      "Clothing, footwear, accessories, fabrics, sizing and styling.",
    prompt: fashion_prompt,
  },
  {
    id: "general",
    name: "Jev General",
    description:
      "General shopping across home, kitchen, appliances, fitness, books and other categories.",
    prompt: general_prompt,
  },
];

export function getAgent(id: AgentId): AgentDefinition {
  const agent = agentRegistry.find((a) => a.id === id);
  if (!agent) throw new Error(`Unknown agent: ${id}`);
  return agent;
}