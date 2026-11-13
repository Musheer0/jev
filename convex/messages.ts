
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    response: v.optional(v.any()),
    metadata: v.optional(
      v.object({
        agentId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const now = Date.now();

    const messageId = await ctx.db.insert("messages", {
      ...args,
      createdAt: now,
    });

    await ctx.db.patch(args.chatId, {
      updatedAt: now,
    });

    return messageId;
  },
});

export const list = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) =>
        q.eq("chatId", args.chatId),
      )
      .order("asc")
      .collect();
  },
});

export const get = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.messageId);
  },
});

export const update = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.optional(v.string()),
    response: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { messageId, ...updates } = args;

    const message = await ctx.db.get(messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.patch(messageId, updates);

    return await ctx.db.get(messageId);
  },
});

export const remove = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    await ctx.db.delete(args.messageId);

    return { success: true };
  },
});
