import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      // Authenticate user
      socket.emit("authenticate", { userId });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("authenticated", (data) => {
      console.log("Socket authenticated:", data);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  // Join a room
  const joinRoom = (roomId) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("join_room", { roomId, userId });
    }
  };

  // Leave a room
  const leaveRoom = (roomId) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("leave_room", { roomId, userId });
    }
  };

  // Send a message
  const sendMessage = (roomId, message, messageType = "text", fileUrl = null) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("send_message", {
        roomId,
        userId,
        message,
        messageType,
        fileUrl,
      });
    }
  };

  // Send typing indicator
  const sendTyping = (roomId, isTyping) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("typing", { roomId, userId, isTyping });
    }
  };

  // Mark messages as read
  const markAsRead = (roomId) => {
    if (socketRef.current && userId) {
      socketRef.current.emit("mark_read", { roomId, userId });
    }
  };

  // Listen for messages
  const onMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("message_received", callback);
    }
  };

  // Listen for typing indicators
  const onTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("typing_indicator", callback);
    }
  };

  // Listen for user joined
  const onUserJoined = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("user_joined", callback);
    }
  };

  // Listen for user left
  const onUserLeft = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("user_left", callback);
    }
  };

  // Listen for messages read
  const onMessagesRead = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("messages_read", callback);
    }
  };

  // Listen for new notifications
  const onNotification = (callback) => {
    if (socketRef.current) {
      socketRef.current.on("new_notification", callback);
    }
  };

  // Remove event listeners
  const off = (event) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markAsRead,
    onMessage,
    onTyping,
    onUserJoined,
    onUserLeft,
    onMessagesRead,
    onNotification,
    off,
  };
};
