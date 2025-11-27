import { useState, useEffect, useCallback } from "react";
import { getUserChatRooms, getRoomMessages, markChatAsRead } from "@/lib/apiCalls/chat/chat.apiCall";
import { toast } from "react-toastify";

/**
 * Custom hook for chat management
 * @returns {Object} Chat rooms, messages, and functions
 */
export function useChats() {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getUserChatRooms();

      if (response.success) {
        setChatRooms(response.data || []);
      } else {
        toast.error("Failed to load chat rooms");
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      toast.error("Failed to load chat rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (roomId) => {
    try {
      const response = await getRoomMessages(roomId);

      if (response.success) {
        setMessages(response.data || []);
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  }, []);

  const selectRoom = useCallback(async (room) => {
    setSelectedRoom(room);
    await fetchMessages(room.id);
    await markChatAsRead(room.id);
  }, [fetchMessages]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);

  return {
    chatRooms,
    selectedRoom,
    messages,
    loading,
    selectRoom,
    refetchRooms: fetchChatRooms,
    refetchMessages: () => selectedRoom && fetchMessages(selectedRoom.id),
  };
}
