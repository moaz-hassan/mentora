"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Search, ArrowLeft } from "lucide-react";
import { getUserChatRooms } from "@/lib/apiCalls/chat/chat.apiCall";
import ChatRoom from "@/components/pages/chats/ChatRoom";
import ChatItem from "@/components/pages/profile/chat/ChatItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSocket } from "@/hooks/useSocket";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";

export default function InstructorChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");
  
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchChats();
  }, []);

  
  useEffect(() => {
    if (isConnected && socket) {
      const handleMessage = (data) => {
        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === data.roomId) {
              const isCurrentChat = chatId === chat.id;
              
              return {
                ...chat,
                lastMessage: {
                  content: data.message,
                  createdAt: data.createdAt,
                },
                unreadCount: (isCurrentChat || data.senderId === user?.id) 
                  ? 0
                  : (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });
        });
      };

      const handleMessagesRead = (data) => {
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
  }, [isConnected, socket, chatId, user]);

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

  const handleChatClick = (selectedChatId) => {
    router.push(`/dashboard/instructor/chats?chatId=${selectedChatId}`);
  };

  const handleBackClick = () => {
    router.push("/dashboard/instructor/chats");
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {}
      <div className="p-6 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Chat with your students and manage conversations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {chats.length} conversation{chats.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex overflow-hidden">
        {}
        <div
          className={cn(
            "w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-border bg-background flex flex-col",
            chatId ? "hidden md:flex" : "flex"
          )}
        >
          {}
          <div className="p-4 border-b border-border">
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

          {}
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
                    className={chatId === chat.id ? "bg-muted/50" : ""}
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
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{searchQuery ? "No chats found" : "No conversations yet"}</p>
              </div>
            )}
          </div>
        </div>

        {}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 bg-muted/10",
            !chatId ? "hidden md:flex" : "flex"
          )}
        >
          {chatId ? (
            <div className="flex flex-col h-full">
              {}
              <div className="md:hidden p-2 border-b border-border bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackClick}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Chats
                </Button>
              </div>
              <ChatRoom chatId={chatId} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a chat to start messaging</h3>
              <p className="max-w-sm">
                Choose a conversation from the sidebar to start chatting with your students.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
