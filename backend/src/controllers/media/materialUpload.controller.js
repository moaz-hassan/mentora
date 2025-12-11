import { 
  uploadMaterialToSupabase, 
  isSupabaseConfigured 
} from "../../utils/supabaseStorage.util.js";

/**
 * Upload a material file to Supabase Storage
 * POST /api/materials/upload
 * Expects multipart form data with 'file' field
 */
export const uploadMaterial = async (req, res) => {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Supabase Storage is not configured",
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const file = req.file;
    const originalFilename = file.originalname;
    const mimeType = file.mimetype;
    const fileBuffer = file.buffer;
    const fileSize = file.size;

    // Validate file size (100MB = 104857600 bytes)
    if (fileSize > 104857600) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 100MB limit",
      });
    }

    // Get file extension
    const fileExtension = originalFilename.split('.').pop().toLowerCase();
    
    // Validate file type
    const allowedTypes = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "txt", "csv", "xlsx", "xls"];
    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `File type .${fileExtension} is not allowed`,
      });
    }

    // Upload to Supabase
    const uploadResult = await uploadMaterialToSupabase(
      fileBuffer,
      originalFilename,
      mimeType
    );

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: originalFilename,
        url: uploadResult.publicUrl,
        public_id: uploadResult.filePath,
        file_type: fileExtension,
        file_size: fileSize,
        download_url: uploadResult.downloadUrl,
      },
    });
  } catch (error) {
    console.error("Material upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload material",
      error: error.message,
    });
  }
};
