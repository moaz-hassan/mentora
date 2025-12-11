"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUserChatRooms } from "@/lib/apiCalls/chat/chat.apiCall";
import ChatItem from "@/components/pages/profile/chat/ChatItem";
import { Input } from "@/components/ui/input";
import { Search, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/useSocket";
import useAuthStore from "@/store/authStore";

export default function ChatListSidebar({ basePath = "/chats" }) {
  const router = useRouter();
  const params = useParams();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchChats();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (isConnected && socket) {
      const handleMessage = (data) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === data.roomId) {
              const isCurrentChat = params.chatId === chat.id;
              
              return {
                ...chat,
                lastMessage: {
                  content: data.message,
                  createdAt: data.createdAt,
                },
                unreadCount: (isCurrentChat || data.senderId === user?.id) 
                  ? 0 // If open or sent by me, count is 0
                  : (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });
        });
      };

      const handleMessagesRead = (data) => {
        // When messages are read in a room, reset unread count for that room
        // But only if *I* read them? No, if *someone* marked them read.
        // Wait, `mark_read` event from server says "User X marked messages as read".
        // If *I* marked them read (which happens when I open the chat), I should clear my count.
        if (data.userId === user?.id) {
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === data.roomId ? { ...chat, unreadCount: 0 } : chat
            )
          );
        }
      };

      socket.on("message_received", handleMessage);
      socket.on("messages_read", handleMessagesRead);

      return () => {
        socket.off("message_received", handleMessage);
        socket.off("messages_read", handleMessagesRead);
      };
    }
  }, [isConnected, socket, params.chatId, user]);

  const fetchChats = async () => {
    try {
      const response = await getUserChatRooms();
      if (response.success) {
        setChats(response.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId) => {
    router.push(`${basePath}/${chatId}`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Chats</h2>
          <Button size="icon" variant="ghost">
            <MessageSquarePlus className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            className="pl-9 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={params.chatId === chat.id ? "bg-muted/50" : ""}
              >
                <ChatItem
                  chat={chat}
                  onClick={() => handleChatClick(chat.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No chats found</p>
          </div>
        )}
      </div>
    </div>
  );
}
