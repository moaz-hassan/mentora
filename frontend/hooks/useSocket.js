import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/utils/apiHelpers";
import useAuthStore from "@/store/authStore";

const SOCKET_URL = getApiBaseUrl();

export const useSocket = () => {
  const socket = useRef(null);
  const { user, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    socket.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.current.on("connect", () => {
      setIsConnected(true);
      socket.current.emit("authenticate", { userId: user.id });
    });

    socket.current.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.current.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const joinRoom = useCallback((roomId) => {
    if (socket.current && isConnected) {
      socket.current.emit("join_room", { roomId, userId: user?.id });
    }
  }, [isConnected, user]);

  const leaveRoom = useCallback((roomId) => {
    if (socket.current && isConnected) {
      socket.current.emit("leave_room", { roomId, userId: user?.id });
    }
  }, [isConnected, user]);

  const sendMessage = useCallback((roomId, message, type = "text", fileUrl = null) => {
    if (socket.current && isConnected) {
      socket.current.emit("send_message", {
        roomId,
        userId: user?.id,
        message,
        messageType: type,
        fileUrl,
      });
    }
  }, [isConnected, user]);

  return {
    socket: socket.current,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
};
