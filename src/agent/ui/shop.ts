import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createShoppingAgent } from "../create-shopping-agent";
import { shoppingResponseSchema, responseToText } from "./response";

const PERSONALITY = "Friendly, concise, a little witty. Honest about trade-offs. Never pushy.";

const bodySchema = z.object({
  userId: z.string().min(1),
  messages: z.array(z.unknown()).min(1),
});

const fallback = (text: string) => ({ blocks: [{ type: "text" as const, text }] });

/** Next.js route handler for the AI SDK useChat DefaultChatTransport. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Expected a userId and at least one chat message." }, { status: 400 });
  }

  const { userId, messages } = parsed.data;

  try {
    // useChat sends UI messages. Convert them to model messages before passing
    // them into ToolLoopAgent; passing UIMessage objects directly is incorrect.
    const modelMessages = convertToModelMessages(messages as UIMessage[]);
    const agent = await createShoppingAgent(PERSONALITY, userId);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = await agent.generate({ messages: modelMessages });
        const response = shoppingResponseSchema.parse(result.output);

        // The typed data part is what the React block renderer consumes.
        writer.write({ type: "data-shopping-response", data: response });

        // Keep a text representation in the UI message for accessibility,
        // transcript persistence, and clients that do not render custom data.
        const textId = "shopping-response-text";
        writer.write({ type: "text-start", id: textId });
        writer.write({ type: "text-delta", id: textId, delta: responseToText(response) });
        writer.write({ type: "text-end", id: textId });
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[shop] agent request failed:", error);
    const response = fallback("I hit a problem while working on that. Please try again in a moment.");
    return Response.json(response, { status: 500 });
  }
}
