"use client";

import { useEffect, useState } from "react";
import { Loader2, Menu, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateChat } from "@/hooks/use-create-chat";
import { ChatList } from "./chat-lists";

const AGENT_NAME = "Jev";

const CATEGORIES = [
  { label: "Tech Nerd", img: "/tech.png" },
  { label: "Fashion Nerd", img: "/fashion.png" },
  { label: "Jack of All Trades", img: "/general.png" },
] as const;

interface NewChatViewProps {
  userName?: string;
}

/** The PNG itself is the folder, so we just render it with a caption. */
function FolderCard({
  label,
  img,
  glowing = false,
}: {
  label: string;
  img: string;
  glowing?: boolean;
}) {
  return (
    <button
      type="button"
      className="group flex w-28 flex-col items-center gap-1 sm:w-36"
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img}
        alt=""
        draggable={false}
        className={[
          "aspect-square w-full object-contain transition-all duration-500 ease-in-out",
          "group-hover:-translate-y-1.5",
          glowing
            ? "scale-105 brightness-110 drop-shadow-[0_0_18px_rgba(250,204,21,0.95)] motion-reduce:scale-100"
            : "drop-shadow-md",
        ].join(" ")}
      />
      <span
        className={`text-xs font-medium transition-colors duration-500 ${
          glowing ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function NewChatView({ userName = "Azmir" }: NewChatViewProps) {
  const [message, setMessage] = useState("");
  const [mascotFailed, setMascotFailed] = useState(false);
  const { createChat, isCreating, error } = useCreateChat();
  const [sessionId, setSessionId] = useState<string | null>(null);
const [activeIndex, setActiveIndex] = useState<number | null>(null);

// Randomly glow one folder at a time while the chat is being created.
useEffect(() => {
  if (!isCreating) {
    setActiveIndex(null);
    return;
  }

  let prev = -1;
  const pickNext = () => {
    let next: number;
    do {
      next = Math.floor(Math.random() * CATEGORIES.length);
    } while (next === prev && CATEGORIES.length > 1);
    prev = next;
    setActiveIndex(next);
  };

  pickNext(); // start immediately
  const id = setInterval(pickNext, 900);
  return () => clearInterval(id);
}, [isCreating]);
  // localStorage is browser-only, so read it after mount instead of during
  // render (render also runs during prerendering on the server).
  useEffect(() => {
    setSessionId(localStorage.getItem("shopping-session-id"));
  }, []);

  const canSend = message.trim().length > 0 && !isCreating;

  async function handleSubmit() {
    const prompt = message.trim();
    if (!prompt || isCreating) return;

    try {
      await createChat({ prompt });
      // Clear only after successful creation.
      setMessage("");
    } catch {
      // The hook exposes the error. Keep the prompt for retry.
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background px-6 py-12 text-foreground sm:py-16">
      {/* Menu trigger, pinned top-left */}
      <Sheet>
        <SheetTrigger >
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 size-10 rounded-full sm:left-6 sm:top-6"
            aria-label="Open recent chats"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-80 sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Recent chats</SheetTitle>
            <SheetDescription className="sr-only">
              Your recent conversations with {AGENT_NAME}.
            </SheetDescription>
          </SheetHeader>
            <div className="flex-1 overflow-y-auto p-3">
      <ChatList sessionId={sessionId} />
    </div>
        </SheetContent>
      </Sheet>

      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        {/* Mascot */}
        {!mascotFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/mascot.png"
            alt={`${AGENT_NAME}, your AI shopping assistant`}
            className="size-28 object-contain sm:size-32"
            onError={() => setMascotFailed(true)}
          />
        )}

        {/* Intro */}
        <section className="flex flex-col items-center gap-3">
          <h1 className="text-base font-medium tracking-tight">
            Hey, I&apos;m {AGENT_NAME}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            I&apos;m {AGENT_NAME}, your AI-powered shopping assistant. I help
            you research products, compare options, check compatibility, and
            make smarter buying decisions without the guesswork.
          </p>
        </section>

        {/* Folders */}
        <section
          aria-label="Shopping personalities"
          className="flex flex-wrap items-start justify-center gap-4 sm:gap-6"
        >
        {CATEGORIES.map((c, i) => (
  <FolderCard
    key={c.label}
    label={c.label}
    img={c.img}
    glowing={activeIndex === i}
  />
))}
        </section>
      </div>

      {/* Chat input */}
      <div className="mt-10 w-full max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          className="flex items-center gap-2 rounded-full border border-border bg-background py-2 pl-6 pr-2 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-4 ring-muted/70 transition-shadow focus-within:ring-ring/30"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isCreating}
            placeholder={
              isCreating ? "Creating your chat..." : `Ask ${AGENT_NAME} anything...`
            }
            aria-label={`Message ${AGENT_NAME}`}
            autoComplete="off"
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-70"
          />

          <button
            type="submit"
            disabled={!canSend}
            aria-label={isCreating ? "Creating chat" : "Send message"}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-60 enabled:bg-primary enabled:text-primary-foreground"
          >
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </button>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default NewChatView;