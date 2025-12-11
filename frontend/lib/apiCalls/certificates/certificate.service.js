import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;


export const generateCertificate = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.post(
      `${API_URL}/certificates/generate`,
      { courseId },
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getCertificateById = async (certificateId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/certificates/${certificateId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getMyCertificates = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/certificates/my`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const checkCertificateExists = async (courseId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/certificates/check/${courseId}`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const verifyCertificate = async (certificateId) => {
  try {
    const response = await axios.get(
      `${API_URL}/certificates/${certificateId}/verify`
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};


export const getDownloadUrl = async (certificateId) => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(
      `${API_URL}/certificates/${certificateId}/download`,
      { headers }
    );
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};



