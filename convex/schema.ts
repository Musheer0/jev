
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chats: defineTable({
    sessionId: v.string(),
    title: v.optional(v.string()),
    agentId: v.string(),
    status: v.union(v.literal("active"), v.literal("archived")),
    updatedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
    ),
    content: v.string(),
    response: v.optional(v.any()),
    metadata: v.optional(
      v.object({
        agentId: v.string(),
      }),
    ),
    createdAt: v.number(),
  }).index("by_chat", ["chatId"]),
});
