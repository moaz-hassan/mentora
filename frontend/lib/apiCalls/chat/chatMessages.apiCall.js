import { get, post } from "@/lib/apiCalls/apiUtils";


export const getMessagesWithCursor = async (roomId, cursor = null, limit = 20) => {
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  if (cursor) queryParams.append("cursor", cursor);
  
  const response = await get(`/chat/${roomId}/messages/cursor?${queryParams.toString()}`);
  return response;
};


export const sendMessage = async (roomId, messageData) => {
  const response = await post(`/chat/${roomId}/message`, messageData);
  return response;
};
