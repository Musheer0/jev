
"use client";

import Link from "next/link";
import {
  Component,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  Archive,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import { useChats } from "@/hooks/use-chats";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ChatListProps {
  sessionId: string | null;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ChatListErrorBoundary extends Component<
  { children: ReactNode; sessionId: string | null },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: { sessionId: string | null }) {
    if (prevProps.sessionId !== this.props.sessionId && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-5 text-destructive" />
          </div>

          <p className="text-sm font-medium">Failed to load chats</p>

          <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
            Something went wrong while fetching your conversations.
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCw className="mr-2 size-3.5" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ChatList({ sessionId }: ChatListProps) {
  return (
    <ChatListErrorBoundary
      key={sessionId ?? "no-session"}
      sessionId={sessionId}
    >
      <ChatListContent sessionId={sessionId} />
    </ChatListErrorBoundary>
  );
}

function ChatListContent({ sessionId }: ChatListProps) {
  const { chats, isLoading } = useChats({ sessionId });

  if (!sessionId) {
    return (
      <EmptyState
        title="No session found"
        description="Start a new chat to get started."
      />
    );
  }

  if (isLoading) {
    return <ChatListSkeleton />;
  }

  if (!chats.length) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Your conversations will appear here when you start chatting."
      />
    );
  }

  const activeChats = chats.filter(
    (chat) => chat.status === "active",
  );

  const archivedChats = chats.filter(
    (chat) => chat.status === "archived",
  );

  return (
    <div className="space-y-6">
      {activeChats.length > 0 && (
        <section>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent
          </p>

          <div className="space-y-1">
            {activeChats.map((chat) => (
              <ChatItem key={chat._id} chat={chat} />
            ))}
          </div>
        </section>
      )}

      {archivedChats.length > 0 && (
        <section>
          <p className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Archive className="size-3.5" />
            Archived
          </p>

          <div className="space-y-1">
            {archivedChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                archived
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ChatItem({
  chat,
  archived = false,
}: {
  chat: {
    _id: string;
    title?: string;
    updatedAt: number;
  };
  archived?: boolean;
}) {
  return (
    <Link
      href={`/chat/${chat._id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-3",
        "transition-colors hover:bg-accent",
        archived && "opacity-70 hover:opacity-100",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
        {archived ? (
          <Archive className="size-4 text-muted-foreground" />
        ) : (
          <MessageSquare className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {chat.title || "New conversation"}
        </p>

        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(chat.updatedAt)}
        </p>
      </div>
    </Link>
  );
}

function ChatListSkeleton() {
  return (
    <div className="space-y-3 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg p-3"
        >
          <Skeleton className="size-9 shrink-0 rounded-lg" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
        <MessageSquare className="size-5 text-muted-foreground" />
      </div>

      <p className="text-sm font-medium">{title}</p>

      <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== now.getFullYear()
        ? "numeric"
        : undefined,
  });
}
