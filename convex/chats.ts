
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    sessionId: v.string(),
    agentId: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("chats", {
      sessionId: args.sessionId,
      agentId: args.agentId,
      title: args.title,
      status: "active",
      updatedAt: now,
    });
  },
});

export const list = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_session", (q) =>
        q.eq("sessionId", args.sessionId),
      )
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.chatId);
  },
});

export const update = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    agentId: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("active"), v.literal("archived")),
    ),
  },
  handler: async (ctx, args) => {
    const { chatId, ...updates } = args;

    const chat = await ctx.db.get(chatId);
    if (!chat) throw new Error("Chat not found");

    const patch: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.agentId !== undefined) patch.agentId = updates.agentId;
    if (updates.status !== undefined) patch.status = updates.status;

    await ctx.db.patch(chatId, patch);

    return await ctx.db.get(chatId);
  },
});

export const remove = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    // Delete associated messages first.
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) =>
        q.eq("chatId", args.chatId),
      )
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.chatId);

    return { success: true };
  },
});
