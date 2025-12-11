"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageCircle, ChevronDown, ChevronUp, ArrowRight, Inbox } from "lucide-react";
import ChatItem from "./ChatItem";
import Link from "next/link";

export function validateChatListRendering(chats, renderedIds) {
  if (!chats || !Array.isArray(chats)) return true;
  if (!renderedIds || !Array.isArray(renderedIds)) return false;
  
  return chats.every(chat => renderedIds.includes(chat.id));
}

export default function ChatSidebar({ chats, loading, collapsible = false }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleChatClick = (chatId) => {
    router.push(`/chat/${chatId}`);
  };

  const handleViewAllClick = () => {
    router.push("/chats");
  };

  const totalUnread = chats?.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0) || 0;

  const content = (
    <>
      {loading ? (
        <div className="divide-y">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : chats && chats.length > 0 ? (
        <div className="divide-y">
          {chats.slice(0, 5).map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onClick={() => handleChatClick(chat.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            No conversations yet
          </p>
          <p className="text-xs text-muted-foreground">
            Join a course to start chatting
          </p>
        </div>
      )}
    </>
  );

  const header = (
    <div className="flex items-center justify-between">
      <CardTitle className="text-base flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Messages
        {totalUnread > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </CardTitle>
      {collapsible && (
        isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )
      )}
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border bg-card/50 backdrop-blur-sm">
          <CollapsibleTrigger asChild>
            <CardHeader className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
              {header}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-0">
              {content}
              <div className="p-3 border-t">
                <Link
                  href="/chats"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                >
                  View All Messages
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Card className="sticky top-6 border bg-card/50 backdrop-blur-sm">
      <CardHeader className="p-4 border-b">
        {header}
      </CardHeader>
      <CardContent className="p-0">
        {content}
        <div className="p-3 border-t">
          <Link
            href="/chats"
            className="w-full gap-2 text-muted-foreground hover:text-foreground"
          >
            View All Messages
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
