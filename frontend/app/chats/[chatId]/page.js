"use client";

import ChatRoom from "@/components/pages/chats/ChatRoom";
import { useParams } from "next/navigation";

export default function ChatRoomPage() {
  const params = useParams();
  
  return <ChatRoom chatId={params.chatId} />;
}
