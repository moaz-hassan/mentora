import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Get user's chat rooms
 */
export const getUserChatRooms = async () => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.get(`${API_URL}/api/chat/user/rooms`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

/**
 * Get messages for a room with pagination
 */
export const getRoomMessages = async (roomId, limit = 50, offset = 0) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.get(
      `${API_URL}/api/chat/rooms/${roomId}/messages/paginated?limit=${limit}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Create private chat room
 */
export const createPrivateChat = async (instructorId, courseId = null) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/chat/private`,
      { instructorId, courseId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating private chat:", error);
    throw error;
  }
};

/**
 * Mark chat room as read
 */
export const markChatAsRead = async (roomId) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.put(
      `${API_URL}/api/chat/rooms/${roomId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking chat as read:", error);
    throw error;
  }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async () => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.get(`${API_URL}/api/chat/unread-count`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};

/**
 * Send message (REST fallback)
 */
export const sendMessage = async (roomId, message) => {
  const authToken = Cookies.get("authToken");
  if (!authToken) {
    throw new Error("No token provided");
  }

  try {
    const response = await axios.post(
      `${API_URL}/api/chat/messages`,
      { room_id: roomId, message },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
