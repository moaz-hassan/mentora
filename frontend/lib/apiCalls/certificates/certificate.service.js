import axios from "axios";
import { getAuthHeaders, getApiBaseUrl } from "@/lib/utils/apiHelpers";

const API_URL = `${getApiBaseUrl()}/api`;

/**
 * Generate a certificate for a completed course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with certificate data
 */
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

/**
 * Get certificate by ID
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<Object>} Response with certificate data
 */
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

/**
 * Get all certificates for the authenticated user
 * @returns {Promise<Object>} Response with list of certificates
 */
export const getMyCertificates = async () => {
  try {
    const headers = getAuthHeaders();
    const response = await axios.get(`${API_URL}/certificates/my`, { headers });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

/**
 * Check if a certificate exists for a course
 * @param {string} courseId - Course ID
 * @returns {Promise<Object>} Response with exists flag and certificate data if exists
 */
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

/**
 * Verify a certificate (public)
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<Object>} Response with verification result
 */
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

/**
 * Get the download URL for a certificate (through backend)
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<Object>} Response with download URL
 */
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



