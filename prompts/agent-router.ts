"use server"

import {AgentId, agentRegistry} from "../agent/registry";

const SUBQ_URL = "https://api.subq.ai/v1/systemone";

export async function routeAgent(userQuery: string) {
  const criteria = Object.fromEntries(
    Object.entries(agentRegistry).map(([id, agent]) => [
      id,
      `${agent.name}: ${agent.description}`,
    ])
  );

  const response = await fetch(SUBQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUBQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "subq-snap-1.2",

      state: {
        user_query: userQuery,
        available_agents: criteria,
      },

      questions: {
        selected_agent: {
          type: "choice",

          instructions:
            "Which available agent is best suited to handle the user's primary shopping intent?",

          criteria,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`SubQ routing failed: ${response.status}`);
  }

  const result = await response.json();

  const decision = result.answers.selected_agent;

  const agentId :AgentId=decision.confidence < 0.6 ? "general":!(decision.choice in agentRegistry) ? "general": decision.choice ;

  const agent =  agentRegistry.find((agent)=>agent.id==agentId)
  return {
    agentId,
    confidence: decision.confidence,
    probabilities: decision.probabilities,
    agent,
  };
}