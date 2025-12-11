"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { format } from "date-fns";

export default function MessageList({
  messages,
  loadMoreMessages,
  hasMore,
  loadingMore,
  currentUserId,
  messagesEndRef,
}) {
  const scrollContainerRef = useRef(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  // Maintain scroll position when loading older messages
  useLayoutEffect(() => {
    if (scrollContainerRef.current && prevScrollHeight > 0) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight;
      scrollContainerRef.current.scrollTop = heightDifference;
      setPrevScrollHeight(0);
    }
  }, [messages, prevScrollHeight]);

  // Handle infinite scroll
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.target;
    
    // Load more when scrolled to top (with buffer)
    if (scrollTop < 50 && hasMore && !loadingMore) {
      setPrevScrollHeight(scrollHeight);
      loadMoreMessages();
    }
  };

  const groupMessagesByDate = (msgs) => {
    const groups = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at || msg.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
    >
      {loadingMore && (
        <div className="flex justify-center py-2 h-8">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {date}
            </span>
          </div>

          <div className="space-y-4">
            {msgs.map((msg) => {
              const isOwnMessage = msg.sender_id === currentUserId || msg.senderId === currentUserId;
              const senderName = msg.User 
                ? `${msg.User.first_name} ${msg.User.last_name}`
                : msg.senderName || "Unknown";
              const senderAvatar = msg.User?.Profile?.avatar_url || msg.senderAvatar || "/default-avatar.png";
              
              return (
                <div
                  key={msg.id || msg.tempId}
                  className={`flex items-end gap-2 ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  } ${msg.isOptimistic ? "opacity-70" : "opacity-100"}`}
                >
                  {/* Avatar */}
                  {!isOwnMessage && (
                    <img
                      src={senderAvatar}
                      alt={senderName}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg text-sm shadow-sm ${
                      isOwnMessage
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs font-semibold mb-1 text-gray-500">
                        {senderName}
                      </p>
                    )}
                    
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    
                    <div className={`text-[10px] mt-1 text-right ${
                        isOwnMessage ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {format(new Date(msg.created_at || msg.createdAt), "HH:mm")}
                      {msg.isOptimistic && " • Sending..."}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
