"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  Send,
  Search,
  Circle,
  BookOpen,
  User,
} from "lucide-react";
import {
  getUserChatRooms,
  getRoomMessages,
  markChatAsRead,
} from "@/lib/apiCalls/chat/chat.service";

export default function InstructorChatsPage() {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      markRoomAsRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserChatRooms();
      setChatRooms(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      setError("Failed to load chat rooms. Please try again.");
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      setLoadingMessages(true);
      const response = await getRoomMessages(roomId, 50, 0);
      setMessages(response.data || []);
      setLoadingMessages(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setLoadingMessages(false);
    }
  };

  const markRoomAsRead = async (roomId) => {
    try {
      await markChatAsRead(roomId);
      // Update unread count in chat rooms list
      setChatRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId ? { ...room, unreadCount: 0 } : room
        )
      );
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Optimistic UI update
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      message: messageText,
      created_at: new Date().toISOString(),
      User: {
        id: "current-user",
        first_name: "You",
        last_name: "",
      },
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // TODO: Implement actual message sending via socket or API
    // For now, this is a placeholder
    console.log("Sending message:", messageText, "to room:", selectedRoom.id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getChatRoomName = (room) => {
    if (room.type === "group" && room.Course) {
      return room.Course.title;
    }
    if (room.type === "private" && room.ChatParticipants) {
      const otherParticipant = room.ChatParticipants.find(
        (p) => p.User && p.user_id !== "current-user"
      );
      if (otherParticipant && otherParticipant.User) {
        return `${otherParticipant.User.first_name} ${otherParticipant.User.last_name}`;
      }
    }
    return room.name || "Chat Room";
  };

  const getChatRoomSubtitle = (room) => {
    if (room.type === "group") {
      return "Community Chat";
    }
    return "Private Chat";
  };

  const filteredChatRooms = chatRooms.filter((room) => {
    const roomName = getChatRoomName(room).toLowerCase();
    return roomName.includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium mb-4">{error}</p>
          <button
            onClick={fetchChatRooms}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
              Chat with your students and manage conversations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <span className="text-sm text-gray-600">
              {chatRooms.length} conversation{chatRooms.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Rooms List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Chat Rooms */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatRooms.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
              </div>
            ) : (
              filteredChatRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRoom?.id === room.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        room.type === "group"
                          ? "bg-purple-100"
                          : "bg-blue-100"
                      }`}
                    >
                      {room.type === "group" ? (
                        <Users className="w-5 h-5 text-purple-600" />
                      ) : (
                        <User className="w-5 h-5 text-blue-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">
                          {getChatRoomName(room)}
                        </h3>
                        {room.unreadCount > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {getChatRoomSubtitle(room)}
                      </p>
                      {room.lastMessage && (
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {room.lastMessage.message}
                          </p>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatTime(room.lastMessage.created_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course indicator for group chats */}
                  {room.type === "group" && room.Course && (
                    <div className="mt-2 ml-11 flex items-center text-xs text-gray-500">
                      <BookOpen className="w-3 h-3 mr-1" />
                      <span className="truncate">{room.Course.title}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedRoom.type === "group"
                        ? "bg-purple-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {selectedRoom.type === "group" ? (
                      <Users className="w-5 h-5 text-purple-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {getChatRoomName(selectedRoom)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getChatRoomSubtitle(selectedRoom)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">
                        Start the conversation by sending a message
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.User?.first_name === "You";
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-md ${
                            isCurrentUser ? "order-2" : "order-1"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {!isCurrentUser && (
                              <span className="text-sm font-medium text-gray-900">
                                {message.User?.first_name}{" "}
                                {message.User?.last_name}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isCurrentUser
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">
                  Choose a chat from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
