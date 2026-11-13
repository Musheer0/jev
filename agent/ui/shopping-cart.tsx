"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useMemo, useState } from "react";
import { ArrowUp, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShoppingResponseView } from "./shoping-response-view";
import type { ShoppingResponse } from "./response";

type ShoppingData = { "shopping-response": ShoppingResponse };
type ShoppingMessage = UIMessage<never, ShoppingData>;

export function ShoppingChat({ userId, endpoint = "/api/shop" }: { userId: string; endpoint?: string }) {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: endpoint, body: { userId } }), [endpoint, userId]);
  const { messages, sendMessage, status, error } = useChat<ShoppingMessage>({ transport });
  const busy = status === "submitted" || status === "streaming";

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    await sendMessage({ text: trimmed });
  }

  return (
    <Card className="mx-auto flex h-[min(820px,calc(100dvh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl shadow-sm">
      <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShoppingBag className="size-5" /></div>
        <div className="min-w-0 flex-1"><h2 className="font-semibold">Jev Shopping Assistant</h2><p className="text-xs text-muted-foreground">Research, compare, and find the right product</p></div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-emerald-500" /> Ready</span>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5 sm:px-6">
          {messages.length === 0 && <div className="flex min-h-[390px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="size-7" /></div>
            <h3 className="text-xl font-semibold tracking-tight">What are we shopping for?</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">Tell Jev what you need. It can research real products, compare options, and help you choose.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">{["I need shoes for Eid", "Find a laptop under ₹70,000", "Help me choose wireless earbuds"].map((suggestion) => <Button key={suggestion} variant="outline" size="sm" onClick={() => void send(suggestion)}>{suggestion}</Button>)}</div>
          </div>}

          {messages.map((message) => {
            const isUser = message.role === "user";
            const text = message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
            const responsePart = message.parts.find((part) => part.type === "data-shopping-response");
            const response = responsePart?.data;
            return <div key={message.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
              <Avatar className="mt-0.5 size-8 shrink-0"><AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>{isUser ? "You" : <ShoppingBag className="size-4" />}</AvatarFallback></Avatar>
              <div className={`min-w-0 max-w-[88%] space-y-3 ${isUser ? "rounded-2xl bg-primary px-4 py-3 text-primary-foreground" : "flex-1"}`}>
                {isUser ? <p className="whitespace-pre-wrap text-sm leading-6">{text}</p> : <>{response ? <ShoppingResponseView response={response} onAction={(action) => {
                  if (action.type === "open_product" || action.type === "open_link") window.open(action.link, "_blank", "noopener,noreferrer");
                  if (action.type === "answer") void send(`For question ${action.questionId}, my answer is: ${action.optionIds.join(", ")}`);
                }} /> : text && <p className="whitespace-pre-wrap text-sm leading-6">{text}</p>}</>}
              </div>
            </div>;
          })}
          {busy && <div className="flex items-center gap-2 pl-11 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Jev is researching...</div>}
          {error && <p role="alert" className="pl-11 text-sm text-destructive">{error.message || "Something went wrong. Please try again."}</p>}
        </div>
      </ScrollArea>

      <form className="border-t bg-background p-3 sm:p-4" onSubmit={(event) => { event.preventDefault(); void send(input); }}>
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-xl border bg-muted/30 p-1.5 pl-3 focus-within:ring-2 focus-within:ring-ring/30">
          <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Describe what you're looking for..." disabled={busy} className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0" />
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-lg" disabled={!input.trim() || busy} aria-label="Send message">{busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}</Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Product details and prices can change. Verify before purchasing.</p>
      </form>
    </Card>
  );
}
