import { routeAgent } from "./prompts/agent-router";
const prompt = "i want to buy shoes my eid "

console.log("running descision")
const decision =await routeAgent(prompt)
console.log({decision})
import { createShoppingAgent } from "./agent/create-shopping-agent";
import { agentRegistry } from "./agent/registry";

const agent = await createShoppingAgent(
  decision.agent?.prompt|| agentRegistry[2].prompt,
  "user_4f8a",
);

console.log("preparing reuslt")
const result = await agent.generate({
  prompt,
});

console.log(result.text);