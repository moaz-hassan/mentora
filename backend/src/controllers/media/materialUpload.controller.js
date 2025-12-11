import { 
  uploadMaterialToSupabase, 
  isSupabaseConfigured 
} from "../../utils/supabaseStorage.util.js";


export const uploadMaterial = async (req, res) => {
  try {
    
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Supabase Storage is not configured",
      });
    }

    
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

    
    if (fileSize > 104857600) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 100MB limit",
      });
    }

    
    const fileExtension = originalFilename.split('.').pop().toLowerCase();
    
    
    const allowedTypes = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "txt", "csv", "xlsx", "xls"];
    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `File type .${fileExtension} is not allowed`,
      });
    }

    
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
