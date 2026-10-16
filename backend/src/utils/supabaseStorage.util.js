import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dns from 'dns';



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

const getSupabaseHost = () => {
  try {
    return new URL(process.env.SUPABASE_URL).hostname;
  } catch (e) {
    return process.env.SUPABASE_URL || null;
  }
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
    const host = getSupabaseHost();
    console.error('Supabase Storage upload error:', error);

    // Detect DNS / network lookup issues and return a clearer message
    const originalCause = error?.originalError?.cause || error?.cause || null;
    const dnsFail = originalCause && /ENOTFOUND/.test(String(originalCause.message || originalCause));

    if (dnsFail) {
      throw new Error(
        `Failed to upload to Supabase Storage: DNS lookup failed for host "${host}". Check your SUPABASE_URL, network connectivity and DNS settings. Original: ${originalCause.message || originalCause}`
      );
    }

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
    const host = getSupabaseHost();
    console.error('Supabase Storage material upload error:', error);

    const originalCause = error?.originalError?.cause || error?.cause || null;
    const dnsFail = originalCause && /ENOTFOUND/.test(String(originalCause.message || originalCause));

    if (dnsFail) {
      throw new Error(
        `Failed to upload material to Supabase Storage: DNS lookup failed for host "${host}". Check your SUPABASE_URL, network connectivity and DNS settings. Original: ${originalCause.message || originalCause}`
      );
    }

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

export const createMaterialSignedUrl = async (filePath, expiresIn = 300) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Supabase createSignedUrl error:', error);
    throw error;
  }

  return data.signedUrl;
};

export const createCertificateSignedUrl = async (filePath, expiresIn = 300) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(CERTIFICATES_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Supabase createSignedUrl (cert) error:', error);
    throw error;
  }

  return data.signedUrl;
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
