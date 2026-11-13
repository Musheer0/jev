
import { ChatView } from "@/chat/ui/chat-view";
import type { Id } from "../../../../convex/_generated/dataModel";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id:chatId } = await params;

  return <ChatView chatId={chatId as Id<"chats">} />;
}
