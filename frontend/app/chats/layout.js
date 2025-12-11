"use client";

import ChatListSidebar from "@/components/pages/chats/ChatListSidebar";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChatLayout({ children }) {
  const params = useParams();
  const isChatOpen = !!params.chatId;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      
      <div
        className={cn(
          "w-full md:w-[350px] lg:w-[400px] flex-shrink-0 transition-all duration-300",
          isChatOpen ? "hidden md:flex" : "flex"
        )}
      >
        <ChatListSidebar />
      </div>

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 bg-muted/10",
          !isChatOpen ? "hidden md:flex" : "flex"
        )}
      >
        {children}
      </div>
    </div>
  );
}
