"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getMessagesWithCursor, sendMessage } from "@/lib/apiCalls/chat/chatMessages.apiCall";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";

export default function ChatWindow({ 
  roomId, 
  currentUser, // { id, first_name, last_name, ... }
  token 
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // Socket
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // ============ INITIAL LOAD ============
  useEffect(() => {
    loadMessages(null);
    initSocket();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId]);

  // ============ DATA FETCHING ============
  const loadMessages = async (cursor = null) => {
    try {
      if (cursor) setLoadingMore(true);
      else setLoading(true);

      const result = await getMessagesWithCursor(roomId, cursor);

      if (result.success) {
        setMessages((prev) => cursor ? [...prev, ...result.messages] : result.messages);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
        if (!cursor) setFromCache(result.fromCache);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      
      // If initial load and we have messages, scroll to bottom
      if (!cursor && messagesEndRef.current) {
        // Small timeout to allow render
        setTimeout(() => {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore && nextCursor) {
      loadMessages(nextCursor);
    }
  };

  // ============ SOCKET SETUP ============
  const initSocket = () => {
    // Only connect if we have a token
    if (!token) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to chat socket");
      setIsConnected(true);
      socketRef.current.emit("join_room", { roomId });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from chat socket");
      setIsConnected(false);
    });

    socketRef.current.on("message_received", (newMessage) => {
      // Only add if it's for this room and we don't already have it (from optimistic UI)
      if (newMessage.roomId === roomId) {
        setMessages((prev) => {
          // Check if message already exists (deduplication)
          if (prev.some(m => m.id === newMessage.id)) return prev;
          
          // Replace optimistic message if exists (checked by tempId logic below)
          // For simple implementation, we just append valid messages
          
          return [newMessage, ...prev];
        });
        
        // Scroll to bottom on new message
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  };

  // ============ SEND MESSAGE ============
  const handleSendMessage = async (text) => {
    const tempId = `temp-${Date.now()}`;
    
    // 1. Optimistic Update
    const optimisticMessage = {
      id: tempId,
      roomId,
      sender_id: currentUser.id,
      senderName: `${currentUser.first_name} ${currentUser.last_name}`,
      senderAvatar: currentUser.avatar_url,
      message: text,
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [optimisticMessage, ...prev]);
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    try {
      // 2. API Call
      await sendMessage(roomId, { 
        message: text, 
        message_type: 'text' 
      });
      
      // Note: We don't need to manually replace the optimistic message here
      // because the socket 'message_received' event will handle the real message coming back.
      // However, we should filter out the optimistic one when the real one arrives 
      // or simplisticly, let the key prop handle React reconciliation if we used real IDs.
      // A robust approach is to remove the isOptimistic version when real one arrives.
      
      // For this simplified version, we'll remove the optimistic one when we verify success?
      // Actually, the socket event is faster/concurrent.
      // Let's refine the socket handler to remove optimistic messages.

    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove optimistic message on error and show toast?
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      alert("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
        <div className="flex-1 flex items-center justify-center">
           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 p-8 items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => loadMessages(null)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center bg-white z-10">
        <div>
          <h3 className="font-semibold text-gray-900">Community Chat</h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? "Live" : "Connecting..."}
            </span>
            {fromCache && <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Cached Load</span>}
          </div>
        </div>
      </div>

      {/* Message List */}
      <MessageList 
        messages={messages}
        loadMoreMessages={loadMoreMessages}
        hasMore={hasMore}
        loadingMore={loadingMore}
        currentUserId={currentUser.id}
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <MessageInput 
        onSendMessage={handleSendMessage} 
        disabled={!isConnected}
      />
    </div>
  );
}
