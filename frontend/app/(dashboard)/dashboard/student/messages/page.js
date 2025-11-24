"use client";

import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "@/store/authStore";
import {
  Send,
  Search,
  Users,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Smile,
} from "lucide-react";

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      // Authenticate user with real user ID
      newSocket.emit("authenticate", { userId: user.id });
    });

    newSocket.on("authenticated", (data) => {
      console.log("Authenticated:", data);
      fetchChatRooms();
    });

    newSocket.on("message_received", (message) => {
      if (selectedRoom && message.roomId === selectedRoom.id) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }
      // Update room's last message
      updateRoomLastMessage(message.roomId, message);
    });

    newSocket.on("typing_indicator", ({ roomId, userId, isTyping }) => {
      if (selectedRoom && roomId === selectedRoom.id) {
        setIsTyping(isTyping);
      }
    });

    newSocket.on("user_joined", ({ roomId, userId }) => {
      console.log(`User ${userId} joined room ${roomId}`);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (selectedRoom && socket && user?.id) {
      loadRoomMessages(selectedRoom.id);
      socket.emit("join_room", {
        roomId: selectedRoom.id,
        userId: user.id,
      });
      socket.emit("mark_read", {
        roomId: selectedRoom.id,
        userId: user.id,
      });
    }
  }, [selectedRoom, socket, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatRooms = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/chat/user/rooms');
      // const data = await response.json();

      const mockRooms = [
        {
          id: "room-1",
          type: "group",
          name: "Advanced React Patterns - Group Chat",
          course_id: "course-1",
          lastMessage: {
            message: "Great question! Let me explain...",
            created_at: new Date().toISOString(),
            sender: { first_name: "John", last_name: "Doe" },
          },
          unreadCount: 3,
          participants: 45,
        },
        {
          id: "room-2",
          type: "private",
          name: "John Doe",
          lastMessage: {
            message: "Thanks for your help!",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            sender: { first_name: "You" },
          },
          unreadCount: 0,
          participants: 2,
        },
        {
          id: "room-3",
          type: "group",
          name: "Node.js Masterclass - Group Chat",
          course_id: "course-2",
          lastMessage: {
            message: "Anyone else having issues with async/await?",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            sender: { first_name: "Jane", last_name: "Smith" },
          },
          unreadCount: 1,
          participants: 67,
        },
      ];

      setRooms(mockRooms);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      setLoading(false);
    }
  };

  const loadRoomMessages = async (roomId) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/chat/rooms/${roomId}/messages/paginated?limit=50`);
      // const data = await response.json();

      const mockMessages = [
        {
          id: "msg-1",
          senderId: "user-1",
          senderName: "John Doe",
          senderRole: "instructor",
          message: "Welcome to the course group chat!",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "msg-2",
          senderId: "current-user-id",
          senderName: "You",
          senderRole: "student",
          message: "Thanks! Excited to be here.",
          createdAt: new Date(Date.now() - 82800000).toISOString(),
        },
        {
          id: "msg-3",
          senderId: "user-2",
          senderName: "Jane Smith",
          senderRole: "student",
          message: "Can someone explain the concept from lesson 5?",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const updateRoomLastMessage = (roomId, message) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              lastMessage: {
                message: message.message,
                created_at: message.createdAt,
                sender: { first_name: message.senderName.split(" ")[0] },
              },
              unreadCount: room.id !== selectedRoom?.id ? room.unreadCount + 1 : 0,
            }
          : room
      )
    );
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !selectedRoom || !user?.id) return;

    socket.emit("send_message", {
      roomId: selectedRoom.id,
      userId: user.id,
      message: newMessage,
      messageType: "text",
    });

    setNewMessage("");
    stopTyping();
  };

  const handleTyping = () => {
    if (!socket || !selectedRoom || !user?.id) return;

    socket.emit("typing", {
      roomId: selectedRoom.id,
      userId: user.id,
      isTyping: true,
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(stopTyping, 2000);
  };

  const stopTyping = () => {
    if (!socket || !selectedRoom || !user?.id) return;

    socket.emit("typing", {
      roomId: selectedRoom.id,
      userId: user.id,
      isTyping: false,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.lastMessage?.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Sidebar - Chat Rooms List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  selectedRoom?.id === room.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        room.type === "group"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {room.type === "group" ? (
                        <Users className="w-6 h-6" />
                      ) : (
                        <span className="font-semibold">
                          {room.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {room.name}
                      </h3>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(room.lastMessage.created_at)}
                        </span>
                      )}
                    </div>

                    {room.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {room.lastMessage.sender.first_name}:{" "}
                        {room.lastMessage.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {room.participants} participant{room.participants !== 1 ? "s" : ""}
                      </span>
                      {room.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRoom.type === "group"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {selectedRoom.type === "group" ? (
                  <Users className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">
                    {selectedRoom.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRoom.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedRoom.participants} participant{selectedRoom.participants !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isOwnMessage ? "order-2" : "order-1"
                    }`}
                  >
                    {!isOwnMessage && (
                      <p className="text-xs text-gray-600 mb-1">
                        {message.senderName}
                        {message.senderRole === "instructor" && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            Instructor
                          </span>
                        )}
                      </p>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
                <span>Someone is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />

              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <Smile className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a chat room to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
