"use client";

import { useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";
import { ArrowUp, Loader2, ShoppingBag, Sparkles, User } from "lucide-react";
import { runShoppingTurn, type ShoppingHistoryItem } from "./demo-actions";
import type { ShoppingResponse } from "@/agent/ui/response";
import { ShoppingResponseView } from "@/agent/ui/shoping-response-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShoppingChatStore } from "@/agent/ui/store";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "assistant";
      response: ShoppingResponse;
      agentName: string;
    };

const SUGGESTIONS = [
  "Find me shoes for Eid",
  "I need a versatile everyday sneaker",
  "Suggest a gift under ₹3,000",
];

export default function ShoppingAgentDemo() {
  const input = useShoppingChatStore((s) => s.input);
const setInput = useShoppingChatStore((s) => s.setInput);
const clearInput = useShoppingChatStore((s) => s.clearInput);
  const {setAgentId, agentId} = useShoppingChatStore()
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const history: ShoppingHistoryItem[] = messages.map((message) =>
    message.role === "user"
      ? { role: "user", text: message.text }
      : {
          role: "assistant",
          text: message.response.blocks
            .map((block) => {
              if (block.type === "text") return block.text;
              if (block.type === "product") return `${block.title} — ${block.price} — ${block.link}`;
              if (block.type === "link") return `${block.label ?? "Link"}: ${block.link}`;
              if (block.type === "question") return `${block.question} Options: ${block.options.map((option) => option.label).join(", ")}`;
              return [block.headers.join(" | "), ...block.rows.map((row) => row.join(" | "))].join("\n");
            })
            .join("\n"),
        },
  );

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = input.trim();

    if (!prompt || isPending) return;

    setError(null);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: prompt },
    ]);

    startTransition(async () => {
      const result = await runShoppingTurn(prompt, history,agentId);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      if(!agentId){
        setAgentId(result.agentId);
      }
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          response: result.response,
          agentName: result.agentName,
        },
      ]);

      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    });
  }

  function useSuggestion(suggestion: string) {
    setInput(suggestion);
    inputRef.current?.focus();
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShoppingBag className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Shopping assistant</p>
            <p className="text-xs text-muted-foreground">Your personal product researcher</p>
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Demo
          </Badge>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
          {messages.length === 0 ? (
            <section className="flex min-h-[55vh] flex-col items-center justify-center text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                What are we shopping for?
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Tell me what you need. I’ll research options, compare products,
                and help you find the right fit.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => useSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </section>
          ) : (
            <div className="space-y-7">
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end gap-3">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                      {message.text}
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                      <User className="size-4" />
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ShoppingBag className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Shopping assistant</span>
                        <Badge variant="outline" className="text-[10px]">
                          {message.agentName}
                        </Badge>
                      </div>
                      <ShoppingResponseView response={message.response} />
                    </div>
                  </div>
                ),
              )}

              {isPending && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-4 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Researching products...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {error && (
            <Card className="border-destructive/40 p-4">
              <p className="text-sm font-medium text-destructive">
                The shopping agent couldn’t complete that request.
              </p>
              <p className="mt-1 break-words text-sm text-muted-foreground">{error}</p>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="sticky bottom-0 border-t bg-background/90 px-4 py-4 backdrop-blur">
        <form
          onSubmit={submitMessage}
          className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/20"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me to find something..."
            aria-label="Message shopping assistant"
            disabled={isPending}
            className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={!input.trim() || isPending}
            aria-label="Send message"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          Product details and prices should be verified before purchasing.
        </p>
      </div>
    </main>
  );
}
