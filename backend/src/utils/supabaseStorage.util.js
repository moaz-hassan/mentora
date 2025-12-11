import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';



let supabaseClient = null;


const CERTIFICATES_BUCKET = process.env.SUPABASE_CERTIFICATES_BUCKET || 'certificates';
const MATERIALS_BUCKET = process.env.SUPABASE_MATERIALS_BUCKET || 'materials';


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


export const uploadToSupabase = async (
  fileBuffer,
  filename,
  mimeType = 'application/pdf'
) => {
  try {
    const supabase = getSupabase();
    const fileId = uuidv4();
    const filePath = `${fileId}-${filename}`;

    
    const { data, error } = await supabase.storage
      .from(CERTIFICATES_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    
    const { data: urlData } = supabase.storage
      .from(CERTIFICATES_BUCKET)
      .getPublicUrl(filePath);

    
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


export const uploadMaterialToSupabase = async (
  fileBuffer,
  filename,
  mimeType = 'application/octet-stream'
) => {
  try {
    const supabase = getSupabase();
    const fileId = uuidv4();
    const filePath = `${fileId}-${filename}`;

    
    const { data, error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    
    const { data: urlData } = supabase.storage
      .from(MATERIALS_BUCKET)
      .getPublicUrl(filePath);

    
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


export const getSupabasePublicUrl = (filePath) => {
  const supabase = getSupabase();
  
  const { data } = supabase.storage
    .from(CERTIFICATES_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};


export const getMaterialPublicUrl = (filePath) => {
  const supabase = getSupabase();
  
  const { data } = supabase.storage
    .from(MATERIALS_BUCKET)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};


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
