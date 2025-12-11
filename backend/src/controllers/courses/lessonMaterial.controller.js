import models from "../../models/index.js";
import { 
  deleteMaterialFromSupabase,
  isSupabaseConfigured 
} from "../../utils/supabaseStorage.util.js";

const { LessonMaterial, Lesson } = models;

/**
 * Save material metadata (file already uploaded to Supabase from backend upload route)
 */
export const saveMaterial = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { filename, url, public_id, file_type, file_size } = req.body;

    // Validate required fields
    if (!filename || !url || !public_id || !file_type || !file_size) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // Validate file size (100MB = 104857600 bytes)
    if (file_size > 104857600) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 100MB limit",
      });
    }

    // Validate file type
    const allowedTypes = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "txt", "csv", "xlsx", "xls"];
    if (!allowedTypes.includes(file_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `File type .${file_type} is not allowed`,
      });
    }

    // Get current materials count for order_number
    const materialsCount = await LessonMaterial.count({
      where: { lesson_id: lessonId },
    });

    // Create material record
    const material = await LessonMaterial.create({
      lesson_id: lessonId,
      filename: filename,
      url: url,
      public_id: public_id,
      file_type: file_type.toLowerCase(),
      file_size: file_size,
      order_number: materialsCount,
    });

    res.status(201).json({
      success: true,
      message: "Material saved successfully",
      material,
    });
  } catch (error) {
    console.error("Save material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save material",
      error: error.message,
    });
  }
};

/**
 * Get all materials for a lesson
 */
export const getLessonMaterials = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const materials = await LessonMaterial.findAll({
      where: { lesson_id: lessonId },
      order: [["order_number", "ASC"]],
    });

    res.json({
      success: true,
      materials,
    });
  } catch (error) {
    console.error("Get materials error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch materials",
      error: error.message,
    });
  }
};

/**
 * Delete a material
 */
export const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await LessonMaterial.findByPk(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Delete from Supabase Storage
    if (isSupabaseConfigured() && material.public_id) {
      try {
        await deleteMaterialFromSupabase(material.public_id);
      } catch (supabaseError) {
        console.error("Supabase deletion error:", supabaseError);
        // Continue even if Supabase deletion fails
      }
    }

    // Delete from database
    await material.destroy();

    res.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete material",
      error: error.message,
    });
  }
};

/**
 * Update material order
 */
export const updateMaterialOrder = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { materials } = req.body; // Array of { id, order_number }

    if (!Array.isArray(materials)) {
      return res.status(400).json({
        success: false,
        message: "Materials must be an array",
      });
    }

    // Update each material's order
    await Promise.all(
      materials.map((material) =>
        LessonMaterial.update(
          { order_number: material.order_number },
          { where: { id: material.id, lesson_id: lessonId } }
        )
      )
    );

    res.json({
      success: true,
      message: "Material order updated successfully",
    });
  } catch (error) {
    console.error("Update material order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update material order",
      error: error.message,
    });
  }
};
