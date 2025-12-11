import * as certificateService from "../../services/courses/certificate.service.js";


export const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const certificate = await certificateService.generateCertificate(studentId, courseId);

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const certificates = await certificateService.getStudentCertificates(studentId);

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};


export const getCertificateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const certificate = await certificateService.getCertificateWithAuth(id, userId, userRole);

    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllCertificates = async (req, res, next) => {
  try {
    const filters = {
      student_id: req.query.student_id,
      course_id: req.query.course_id,
      verified: req.query.verified,
    };

    const certificates = await certificateService.getAllCertificates(filters);

    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};


export const verifyCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await certificateService.verifyCertificate(id);

    res.status(200).json({
      success: result.valid,
      message: result.valid ? "Certificate is valid" : "Certificate not found",
      data: result.valid ? {
        verified: result.verified,
        certificate: {
          id: result.certificate.id,
          issued_at: result.certificate.issued_at,
          metadata: result.certificate.metadata,
        },
      } : null,
    });
  } catch (error) {
    next(error);
  }
};


export const checkCertificateExists = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const certificate = await certificateService.getCertificateByStudentAndCourse(studentId, courseId);

    res.status(200).json({
      success: true,
      exists: !!certificate,
      data: certificate || null,
    });
  } catch (error) {
    next(error);
  }
};


export const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const downloadUrl = await certificateService.getCertificateDownloadUrl(id, userId, userRole);

    
    res.status(200).json({
      success: true,
      downloadUrl,
    });
  } catch (error) {
    next(error);
  }
};


