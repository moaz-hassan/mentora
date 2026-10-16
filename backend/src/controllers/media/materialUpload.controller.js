import { 
  uploadMaterialToSupabase, 
  isSupabaseConfigured,
  createMaterialSignedUrl,
} from "../../utils/supabaseStorage.util.js";


export const uploadMaterial = async (req, res) => {
  try {
    // helpful log for debugging DNS/host issues (hostname only)
    try {
      const supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
      console.log('Uploading material to Supabase host:', supabaseHost);
    } catch (e) {
      console.log('Uploading material to Supabase, SUPABASE_URL not parseable');
    }
    
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

    // create a short-lived signed URL for immediate preview/download (not stored in DB)
    let signedUrl = null;
    try {
      signedUrl = await createMaterialSignedUrl(uploadResult.filePath, 300);
    } catch (err) {
      console.warn('Failed to create signed URL for uploaded material:', err.message);
    }

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        filename: originalFilename,
        // do not expose long-lived public URLs
        public_id: uploadResult.filePath,
        file_type: fileExtension,
        file_size: fileSize,
        temp_download_url: signedUrl,
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
