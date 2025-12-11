"use client";

import { useState, useEffect, useRef } from "react";
import { getRoomMessages } from "@/lib/apiCalls/chat/chat.apiCall";
import useAuthStore from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ChatRoom({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastReadAt, setLastReadAt] = useState(null);
  const [initialScrollDone, setInitialScrollDone] = useState(false);

  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();
  const { socket, isConnected, joinRoom, leaveRoom, sendMessage } = useSocket();

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (isConnected && chatId) {
      joinRoom(chatId);
      socket.emit("mark_read", { roomId: chatId, userId: user?.id });

      const handleMessage = (data) => {
        if (data.roomId === chatId) {
          socket.emit("mark_read", { roomId: chatId, userId: user?.id });

          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;

            const normalizedMessage = {
              id: data.id,
              room_id: data.roomId,
              sender_id: data.senderId,
              message: data.message,
              created_at: data.createdAt,
              User: {
                id: data.senderId,
                first_name: data.senderName.split(" ")[0],
                last_name: data.senderName.split(" ").slice(1).join(" "),
                role: data.senderRole,
                Profile: {
                  avatar_url: data.senderAvatar,
                },
              },
            };
            return [...prev, normalizedMessage];
          });

          if (data.senderId === user?.id) {
            setTimeout(scrollToBottom, 100);
          }
        }
      };

      socket.on("message_received", handleMessage);

      return () => {
        leaveRoom(chatId);
        socket.off("message_received", handleMessage);
      };
    }
  }, [isConnected, chatId, joinRoom, leaveRoom, socket, user?.id]);

  useEffect(() => {
    if (messages.length > 0 && !initialScrollDone && !loading) {
      scrollToFirstUnread();
      setInitialScrollDone(true);
    }
  }, [messages, initialScrollDone, loading]);

  const fetchMessages = async () => {
    try {
      const response = await getRoomMessages(chatId);
      if (response.success) {
        setMessages(response.data);
        setLastReadAt(response.lastReadAt);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFirstUnread = () => {
    if (!lastReadAt) {
      scrollToBottom();
      return;
    }

    const firstUnreadIndex = messages.findIndex(
      (msg) =>
        new Date(msg.created_at) > new Date(lastReadAt) &&
        msg.sender_id !== user?.id
    );

    if (firstUnreadIndex !== -1) {
      const element = document.getElementById(
        `msg-${messages[firstUnreadIndex].id}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        scrollToBottom();
      }
    } else {
      scrollToBottom();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!isConnected) {
      toast.error("Connection lost. Reconnecting...");
      return;
    }

    sendMessage(chatId, newMessage);
    setNewMessage("");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status Indicator (Optional) */}
      {!isConnected && (
        <div className="bg-yellow-100 text-yellow-800 text-xs text-center py-1">
          Connecting...
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === user?.id;

          const isUnread =
            lastReadAt &&
            new Date(msg.created_at) > new Date(lastReadAt) &&
            !isMe;
          const isFirstUnread =
            isUnread &&
            (index === 0 ||
              new Date(messages[index - 1].created_at) <= new Date(lastReadAt));

          return (
            <div key={msg.id} id={`msg-${msg.id}`}>
              {isFirstUnread && (
                <div className="flex items-center gap-4 my-6">
                  <div className="h-px bg-red-500/20 flex-1" />
                  <span className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    New Messages
                  </span>
                  <div className="h-px bg-red-500/20 flex-1" />
                </div>
              )}

              <div
                className={cn(
                  "flex w-full",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex max-w-[70%] gap-2",
                    isMe ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={msg.User?.Profile?.avatar_url} />
                    <AvatarFallback>
                      {msg.User?.first_name?.[0]}
                      {msg.User?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg p-3 text-sm",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="font-semibold text-xs opacity-70 mb-1">
                      {isMe
                        ? "You"
                        : `${msg.User?.first_name} ${msg.User?.last_name}`}
                    </p>
                    <p>{msg.message}</p>
                    <span className="text-[10px] opacity-50 mt-1 block text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isConnected || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
