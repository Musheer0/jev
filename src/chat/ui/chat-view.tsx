"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowUp, Loader2, Square } from "lucide-react";

import type { ShoppingResponse } from "@/agent/ui/response";
import { ShoppingResponseView } from "@/agent/ui/shoping-response-view";
import { useSendMessage } from "@/hooks/use-send-message";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DotSquare } from "@/components/dot-square";

import type { Id } from "../../../convex/_generated/dataModel";
import { useShoppingChatStore } from "@/agent/ui/store";
import { Thinking } from "./thinking-text";

interface ChatViewProps {
  chatId: Id<"chats">;
}

const NEAR_BOTTOM_PX = 120;

function formatUpdatedAt(timestamp: number) {
  const date = new Date(timestamp);
  const sameDay = date.toDateString() === new Date().toDateString();

  return new Intl.DateTimeFormat(undefined, sameDay
    ? { hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }
  ).format(date);
}

// "shopping-agent" / "shopping_agent" -> "Shopping agent"
function formatAgentName(agentId: string) {
  const text = agentId.replace(/[-_]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function ChatView({ chatId }: ChatViewProps) {
   const input = useShoppingChatStore((s) => s.input);
 const setInput = useShoppingChatStore((s) => s.setInput);
 const clearInput = useShoppingChatStore((s) => s.clearInput);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Prevents the ?prompt= query from being sent more than once.
  const initialPromptHandledRef = useRef(false);
  // Used to jump (not animate) to the bottom the first time messages render.
  const hasInitialScrolledRef = useRef(false);

  const { chat, messages, isLoading, isSending, error, sendMessage } =
    useSendMessage(chatId);

  /* ---------------------------------------------------------------- */
  /* Reset per-chat state when switching conversations                 */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    initialPromptHandledRef.current = false;
    hasInitialScrolledRef.current = false;
    setInput("");
    setIsNearBottom(true);
  }, [chatId]);

  /* ---------------------------------------------------------------- */
  /* Send the initial prompt from the URL (once)                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (isLoading || !chat || initialPromptHandledRef.current) return;

    initialPromptHandledRef.current = true;

    const url = new URL(window.location.href);
    const prompt = url.searchParams.get("prompt")?.trim();
    if (!prompt) return;

    url.searchParams.delete("prompt");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    setIsNearBottom(true);
    void sendMessage({ prompt }).catch(() => setInput(prompt));
  }, [isLoading, chat, sendMessage]);

  /* ---------------------------------------------------------------- */
  /* Scrolling                                                         */
  /* ---------------------------------------------------------------- */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // Old conversation: land at the latest message instantly, no animation.
  useLayoutEffect(() => {
    if (isLoading || !chat || messages.length === 0) return;
    if (hasInitialScrolledRef.current) return;
    hasInitialScrolledRef.current = true;
    scrollToBottom("auto");
  }, [isLoading, chat, messages.length, scrollToBottom]);

  // New messages / generation started: follow only if the user is at the bottom.
  useEffect(() => {
    if (!hasInitialScrolledRef.current || !isNearBottom) return;
    scrollToBottom("smooth");
  }, [messages, isSending, isNearBottom, scrollToBottom]);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsNearBottom(distance < NEAR_BOTTOM_PX);
  }

  /* ---------------------------------------------------------------- */
  /* Composer                                                          */
  /* ---------------------------------------------------------------- */
  // Auto-grow the textarea up to its max height.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const prompt = input.trim();
    if (!prompt || isSending) return;

    setInput("");
    setIsNearBottom(true);

    try {
      await sendMessage({ prompt });
    } catch {
      setInput(prompt); // let the user retry
    }

    textareaRef.current?.focus();
  }

  /* ---------------------------------------------------------------- */
  /* States                                                            */
  /* ---------------------------------------------------------------- */
  if (isLoading) {
    return (
      <main className="flex h-dvh items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading conversation…
        </div>
      </main>
    );
  }

  if (!chat) {
    return (
      <main className="flex h-dvh items-center justify-center bg-background p-4">
        <Card className="max-w-md p-6 text-center">
          <h2 className="font-semibold">Chat not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This conversation was deleted or you don&apos;t have access to it.
          </p>
        </Card>
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* Header: chat details */}
      <header className="z-10 shrink-0 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-medium">
              {chat.title || "Untitled chat"}
            </h1>
            <p
              className="truncate text-xs text-muted-foreground"
              title={`Session ${chat.sessionId}`}
            >
              {formatAgentName(chat.agentId)}
              <span aria-hidden> · </span>
              Updated {formatUpdatedAt(chat.updatedAt)}
            </p>
          </div>

          {chat.status === "archived" && (
            <Badge variant="secondary" className="shrink-0">
              Archived
            </Badge>
          )}
        </div>
      </header>

      {/* Thread + floating scroll button share one relative wrapper */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto overscroll-contain"
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pb-6 pt-6">
            {messages.length === 0 && !isSending && (
              <p className="py-24 text-center text-sm text-muted-foreground">
                No messages yet. Ask for anything you&apos;re looking to buy.
              </p>
            )}

            {messages.map((message) => {
              if (message.role === "user") {
                return (
                  <div key={message._id} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-3xl bg-muted px-4 py-2.5 text-[15px] leading-6 text-foreground sm:max-w-[75%]">
                      {message.content}
                    </div>
                  </div>
                );
              }

              const response = message.response as ShoppingResponse | undefined;

              return (
                <div key={message._id} className="min-w-0">
                  {response ? (
                    <ShoppingResponseView response={response} />
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-[15px] leading-7">
                      {message.content}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Agent is working */}
            {isSending && (
              <div
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <DotSquare
                  animation="think"
                  size={22}
                  density={5}
                  dotSize={2.2}
                  scale={1.6}
                  duration={1.2}
                  color="#a1a1aa"
                  minOpacity={0.3}
                  aria-hidden
                  className="shrink-0"
                />
             <Thinking/>
              </div>
            )}

            {error && (
              <Card role="alert" className="border-destructive/40 p-4">
                <p className="text-sm font-medium text-destructive">
                  That request didn&apos;t go through.
                </p>
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  {error}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Send your message again to retry.
                </p>
              </Card>
            )}

            <div ref={bottomRef} className="h-px shrink-0" />
          </div>
        </div>

        {!isNearBottom && messages.length > 0 && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="absolute bottom-4 left-1/2 size-9 -translate-x-1/2 rounded-full bg-background shadow-md"
            aria-label="Scroll to latest message"
            onClick={() => {
              setIsNearBottom(true);
              scrollToBottom("smooth");
            }}
          >
            <ArrowDown className="size-4" />
          </Button>
        )}
      </div>

      {/* Composer */}
      <footer className="shrink-0 bg-background px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-3xl border bg-card py-1.5 pl-4 pr-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring/20"
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Reply…"
            aria-label="Message shopping assistant"
            rows={1}
            className="max-h-40 min-h-10 flex-1 resize-none border-0 bg-transparent px-0 py-2 text-[15px] leading-6 shadow-none focus-visible:ring-0"
          />

          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-full"
            disabled={isSending || !input.trim()}
            aria-label={isSending ? "Generating response" : "Send message"}
          >
            {isSending ? (
              <Square className="size-3.5 fill-current" />
            ) : (
              <ArrowUp className="size-4" />
            )}
          </Button>
        </form>

        <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">
          Check product details and prices before you buy.
        </p>
      </footer>
    </main>
  );
}