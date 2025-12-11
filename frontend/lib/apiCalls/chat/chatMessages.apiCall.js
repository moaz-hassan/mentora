import { get, post } from "@/lib/apiCalls/apiUtils";

/**
 * Fetch messages with cursor-based pagination for infinite scroll
 * @param {string} roomId - Chat room ID
 * @param {string|null} cursor - ISO timestamp cursor
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Object>} { messages, hasMore, nextCursor }
 */
export const getMessagesWithCursor = async (roomId, cursor = null, limit = 20) => {
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (cursor) queryParams.append("cursor", cursor);
  
  const response = await get(`/chat/${roomId}/messages/cursor?${queryParams.toString()}`);
  return response;
};

/**
 * Send a message to a chat room
 * @param {string} roomId - Chat room ID
 * @param {Object} messageData - { message, message_type, file_url }
 * @returns {Promise<Object>} Created message
 */
export const sendMessage = async (roomId, messageData) => {
  const response = await post(`/chat/${roomId}/message`, messageData);
  return response;
};
