import { Supermemory } from "supermemory";
import { config } from "../config";

let client: Supermemory | null = null;

function getClient(): Supermemory {
  if (!client) client = new Supermemory({ apiKey: config.supermemoryApiKey });
  return client;
}

/** Store something the agent learned about a user (preferences, budget, sizes, etc.). */
export async function saveMemory(userId: string, content: string) {
  await getClient().add(userId, { content });
}

/**
 * Returns what Supermemory currently knows about the user as plain strings.
 * Supermemory resolves contradictions over time (e.g. "works at Google" -> "works at Stripe"),
 * so we just read the resulting profile.
 */
export async function getUserMemories(userId: string): Promise<string[]> {
  try {
    const { profile } = await getClient().profile(userId);
    return profile.static.map((m) => m.memory);
  } catch (err) {
    // Memory should never take the whole agent down.
    console.error("[supermemory] failed to load profile:", err);
    return [];
  }
}