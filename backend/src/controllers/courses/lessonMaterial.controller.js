import * as lessonMaterialService from "../../services/courses/lessonMaterial.service.js";

export const saveMaterial = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const material = await lessonMaterialService.saveMaterial(lessonId, req.body);

    res.status(201).json({
      success: true,
      message: "Material saved successfully",
      material,
    });
  } catch (error) {
    next(error);
  }
};

export const getLessonMaterials = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const hostBase = `${req.protocol}://${req.get("host")}`;
    const materials = await lessonMaterialService.getLessonMaterials(lessonId, hostBase);

    res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const result = await lessonMaterialService.deleteMaterial(materialId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const streamMode = req.query.stream === "true";

    const { signedUrl } = await lessonMaterialService.getMaterialDownloadUrl(
      materialId,
      req.user
    );

    if (streamMode) {
      const { proxyStream } = await import("../../utils/stream.util.js");
      return await proxyStream(signedUrl, req, res);
    }

    res.status(200).json({
      success: true,
      data: { url: signedUrl, expires_in: 300 },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMaterialOrder = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const result = await lessonMaterialService.updateMaterialOrder(
      lessonId,
      req.body.materials
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
