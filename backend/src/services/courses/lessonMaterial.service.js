import lessonMaterialRepository from "../../repositories/courses/lessonMaterial.repository.js";
import lessonRepository from "../../repositories/courses/lesson.repository.js";
import {
  deleteMaterialFromSupabase,
  isSupabaseConfigured,
  createMaterialSignedUrl,
} from "../../utils/supabaseStorage.util.js";
import { isUserAuthorizedForLesson } from "./lesson.service.js";

const ALLOWED_TYPES = ["pdf", "doc", "docx", "ppt", "pptx", "zip", "txt", "csv", "xlsx", "xls"];
const MAX_FILE_SIZE = 104857600; // 100MB

export const saveMaterial = async (lessonId, materialData) => {
  const { filename, url, public_id, file_type, file_size } = materialData;

  if (!filename || !url || !public_id || !file_type || !file_size) {
    const error = new Error("Missing required fields");
    error.statusCode = 400;
    throw error;
  }

  const lesson = await lessonRepository.findById(lessonId);
  if (!lesson) {
    const error = new Error("Lesson not found");
    error.statusCode = 404;
    throw error;
  }

  if (file_size > MAX_FILE_SIZE) {
    const error = new Error("File size exceeds 100MB limit");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_TYPES.includes(file_type.toLowerCase())) {
    const error = new Error(`File type .${file_type} is not allowed`);
    error.statusCode = 400;
    throw error;
  }

  const materialsCount = await lessonMaterialRepository.countByLessonId(lessonId);

  return await lessonMaterialRepository.create({
    lesson_id: lessonId,
    filename,
    url,
    public_id,
    file_type: file_type.toLowerCase(),
    file_size,
    order_number: materialsCount,
  });
};

export const getLessonMaterials = async (lessonId, hostBase) => {
  const materials = await lessonMaterialRepository.findByLessonId(lessonId);

  return materials.map((m) => ({
    id: m.id,
    filename: m.filename,
    file_type: m.file_type,
    file_size: m.file_size,
    order_number: m.order_number,
    download_endpoint: `${hostBase}/api/materials/${m.id}/download`,
  }));
};

export const deleteMaterial = async (materialId) => {
  const material = await lessonMaterialRepository.findById(materialId);
  if (!material) {
    const error = new Error("Material not found");
    error.statusCode = 404;
    throw error;
  }

  if (isSupabaseConfigured() && material.public_id) {
    try {
      await deleteMaterialFromSupabase(material.public_id);
    } catch (supabaseError) {
      console.error("Supabase deletion error:", supabaseError);
    }
  }

  await lessonMaterialRepository.deleteById(materialId);
  return { message: "Material deleted successfully" };
};

export const getMaterialDownloadUrl = async (materialId, user) => {
  const material = await lessonMaterialRepository.findById(materialId);
  if (!material) {
    const error = new Error("Material not found");
    error.statusCode = 404;
    throw error;
  }

  const allowed = await isUserAuthorizedForLesson(material.lesson_id, user);
  if (!allowed) {
    const error = new Error("Not authorized to download this material");
    error.statusCode = 403;
    throw error;
  }

  if (!isSupabaseConfigured() || !material.public_id) {
    const error = new Error("Storage not configured or material invalid");
    error.statusCode = 500;
    throw error;
  }

  const signedUrl = await createMaterialSignedUrl(material.public_id, 300);
  return { signedUrl, material };
};

export const updateMaterialOrder = async (lessonId, materials) => {
  if (!Array.isArray(materials)) {
    const error = new Error("Materials must be an array");
    error.statusCode = 400;
    throw error;
  }

  await lessonMaterialRepository.updateOrder(materials);
  return { message: "Material order updated successfully" };
};

export default {
  saveMaterial,
  getLessonMaterials,
  deleteMaterial,
  getMaterialDownloadUrl,
  updateMaterialOrder,
};
