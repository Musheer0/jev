# Shopping agent UI update

## What changed

- The shopping chat now uses `useChat` from `@ai-sdk/react` with `DefaultChatTransport`.
- The server adapter converts incoming AI SDK UI messages to model messages, runs the existing `ToolLoopAgent`, validates its structured output, and sends a typed `data-shopping-response` part to the client.
- The React UI renders the structured response blocks with Tailwind and shadcn/ui primitives. Inline `style` objects and the old style-token file have been removed.
- Clarification prompts are less blocking: the agent asks only when a missing detail materially changes the search, and otherwise researches immediately.
- Tool failures and invalid structured output are surfaced rather than silently producing an empty response.

## Integration notes

1. Keep these files under your existing `src/agent` and `src/prompts` directories.
2. Expose the handler from your Next.js route, for example:

   ```ts
   // src/app/api/shop/route.ts
   export { POST } from "@/agent/ui/shop";
   ```

3. Render `ShoppingChat` from a client component and pass the authenticated user's ID:

   ```tsx
   <ShoppingChat userId={user.id} />
   ```

4. The UI expects the shadcn/ui components `avatar`, `badge`, `button`, `card`, `input`, `scroll-area`, and `table`, plus `lucide-react`.
5. This archive did not include `package.json`, the app route tree, tsconfig, or installed shadcn components, so dependency/version-specific compilation could not be run here. The code targets the AI SDK API exposing `DefaultChatTransport`, `convertToModelMessages`, `createUIMessageStream`, and `createUIMessageStreamResponse`.
