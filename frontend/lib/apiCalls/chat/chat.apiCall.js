import axios from "axios";
import { 
  getAuthHeaders,
  getApiBaseUrl 
} from "@/lib/utils/apiHelpers";

const API_URL = getApiBaseUrl();


export const getUserChatRooms = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/chat/user/rooms`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getRoomMessages = async (roomId, limit = 50, offset = 0) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/chat/rooms/${roomId}/messages/paginated?limit=${limit}&offset=${offset}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const createPrivateChat = async (instructorId, courseId = null) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/chat/private`,
      { instructorId, courseId },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const markChatAsRead = async (roomId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.put(
      `${API_URL}/api/chat/rooms/${roomId}/read`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getUnreadCount = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/api/chat/unread-count`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const sendMessage = async (roomId, message) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/chat/messages`,
      { room_id: roomId, message },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const joinChat = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/api/chat/join`,
      { courseId },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const checkChatMembership = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/api/chat/membership/${courseId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

