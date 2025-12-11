import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Supabase Storage utility for file storage (certificates and materials)
 * Simple, reliable, and free tier available
 */

let supabaseClient = null;

// Bucket names
const CERTIFICATES_BUCKET = process.env.SUPABASE_CERTIFICATES_BUCKET || 'certificates';
const MATERIALS_BUCKET = process.env.SUPABASE_MATERIALS_BUCKET || 'materials';

/**
 * Get Supabase client
 */
const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey);
  return supabaseClient;
};

/**
 * Upload a file to Supabase Storage (certificates bucket)
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} filename - The filename
 * @param {string} mimeType - The MIME type (e.g., 'application/pdf')
 * @returns {Promise<Object>} - Upload result with filePath and publicUrl
 */
export const uploadToSupabase = async (
  fileBuffer,
  filename,
  mimeType = 'application/pdf'
) => {
  try {
    const supabase = getSupabase();
    const fileId = uuidv4();
    const filePath = `${fileId}-${filename}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(CERTIFICATES_BUCKET)
      .getPublicUrl(filePath);

    // Add download parameter for direct download
    const directDownloadUrl = `${urlData.publicUrl}?download=${encodeURIComponent(filename)}`;

    return {
      fileId: fileId,
      filePath: data.path,
      filename: filename,
      publicUrl: urlData.publicUrl,
      downloadUrl: directDownloadUrl,
    };
  } catch (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }
};

/**
 * Upload a material file to Supabase Storage (materials bucket)
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} filename - The filename
 * @param {string} mimeType - The MIME type
 * @returns {Promise<Object>} - Upload result with filePath and publicUrl
 */
export const uploadMaterialToSupabase = async (
  fileBuffer,
  filename,
  mimeType = 'application/octet-stream'
) => {
  try {
    const supabase = getSupabase();
    const fileId = uuidv4();
    const filePath = `${fileId}-${filename}`;

    // Upload the file to materials bucket
    const { data, error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(MATERIALS_BUCKET)
      .getPublicUrl(filePath);

    // Add download parameter for direct download
    const directDownloadUrl = `${urlData.publicUrl}?download=${encodeURIComponent(filename)}`;

    return {
      fileId: fileId,
      filePath: data.path,
      filename: filename,
      publicUrl: urlData.publicUrl,
      downloadUrl: directDownloadUrl,
    };
  } catch (error) {
    console.error('Supabase Storage material upload error:', error);
    throw new Error(`Failed to upload material to Supabase Storage: ${error.message}`);
  }
};

/**
 * Get public URL for a Supabase Storage file (certificates bucket)
 * @param {string} filePath - The file path in storage
 * @returns {string} - Public URL
 */
export const getSupabasePublicUrl = (filePath) => {
  const supabase = getSupabase();
  
  const { data } = supabase.storage
    .from(CERTIFICATES_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Get public URL for a material file (materials bucket)
 * @param {string} filePath - The file path in storage
 * @returns {string} - Public URL
 */
export const getMaterialPublicUrl = (filePath) => {
  const supabase = getSupabase();
  
  const { data } = supabase.storage
    .from(MATERIALS_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Delete a file from Supabase Storage (certificates bucket)
 * @param {string} filePath - The file path to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteFromSupabase = async (filePath) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Supabase Storage delete error:', error);
    throw new Error(`Failed to delete from Supabase Storage: ${error.message}`);
  }
};

/**
 * Delete a material from Supabase Storage (materials bucket)
 * @param {string} filePath - The file path to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteMaterialFromSupabase = async (filePath) => {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Supabase Storage material delete error:', error);
    throw new Error(`Failed to delete material from Supabase Storage: ${error.message}`);
  }
};

/**
 * Check if Supabase Storage is properly configured
 * @returns {boolean} - True if all required env vars are set
 */
export const isSupabaseConfigured = () => {
  return !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_KEY
  );
};

export default {
  uploadToSupabase,
  uploadMaterialToSupabase,
  getSupabasePublicUrl,
  getMaterialPublicUrl,
  deleteFromSupabase,
  deleteMaterialFromSupabase,
  isSupabaseConfigured,
};
