"use client";

import { useRef, useState } from "react";
import {
  ArrowUp,
  ChevronDown,
  Globe,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCreateChat } from "@/hooks/use-create-chat";

const AGENT_NAME = "Jev";
const CONTENT_TYPES = ["Any", "Documents", "Images", "Code"] as const;

type ContentType = (typeof CONTENT_TYPES)[number];

interface NewChatViewProps {
  userName?: string;
}

export function NewChatView({ userName = "Azmir" }: NewChatViewProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
  const [orbFailed, setOrbFailed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createChat, isCreating, error } = useCreateChat();

  const canSend = message.trim().length > 0 && !isCreating;

  function reset() {
    if (isCreating) return;

    setMessage("");
    setFiles([]);
  }

  async function handleSubmit() {
    const prompt = message.trim();

    if (!prompt || isCreating) return;

    try {
      await createChat({ prompt });

      // Clear only after successful creation.
      setMessage("");
      setFiles([]);
    } catch {
      // The hook exposes the error. Keep the prompt for retry.
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-start justify-between px-4 pt-4 sm:px-8 sm:pt-6">
        <div>
          <h1 className="text-xl font-medium tracking-tight">
            Ask <span className="text-muted-foreground">{AGENT_NAME}</span>
          </h1>
         
        </div>

      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-10">
        <div className="grid size-40 place-items-center">
          {orbFailed ? (
            <div
              role="img"
              aria-label={AGENT_NAME}
              className="size-[158px] rounded-full bg-gradient-to-br from-primary/40 via-primary/20 to-muted"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/mascot.png"
              alt={`${AGENT_NAME}, your AI agent`}
              className="size-full object-contain"
              onError={() => setOrbFailed(true)}
            />
          )}
        </div>

        <p className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Hello, <span className="text-muted-foreground">How can I help?</span>
        </p>

        <div className="w-full max-w-3xl rounded-[28px] bg-muted/60 pb-2.5">
          <div
            className={cn(
              "flex min-h-36 gap-3 rounded-[28px] border border-primary/60 bg-background p-5 shadow-sm transition-shadow focus-within:ring-[3px] focus-within:ring-ring/30",
              isCreating && "opacity-70"
            )}
          >
            <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              rows={4}
              disabled={isCreating}
              placeholder={
                isCreating
                  ? "Creating your chat..."
                  : `Ask ${AGENT_NAME} anything…`
              }
              aria-label={`Message ${AGENT_NAME}`}
              className="flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            />
          </div>


          {error && (
            <div
              role="alert"
              className="mx-4 mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="flex items-center justify-between px-4 pt-2.5">
       
            <div className="flex items-center  w-full gap-2.5">
              <div className="flex-1 h-full"></div>
              <Button
                variant="outline"
                size="icon"
                className="size-8 rounded-full ml-auto"
                aria-label="Dictate"
                disabled={isCreating}
                onClick={() => console.log("mic clicked")}
              >
                <Mic className="size-4" />
              </Button>

              <Button
                size="icon"
                className="size-10 rounded-full"
                aria-label={isCreating ? "Creating chat" : "Send message"}
                disabled={!canSend}
                onClick={() => void handleSubmit()}
              >
                {isCreating ? (
                  <Loader2 className="size-[18px] animate-spin" />
                ) : (
                  <ArrowUp className="size-[18px]" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NewChatView;