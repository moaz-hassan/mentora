/**
 * Certificate Controller
 * Purpose: Handle certificate route handlers
 * Routes: /api/certificates
 */

import * as certificateService from "../../services/courses/certificate.service.js";

/**
 * Get all certificates
 * GET /api/certificates
 */
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

/**
 * Get certificate by ID
 * GET /api/certificates/:id
 */
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new certificate
 * POST /api/certificates
 */
export const createCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.createCertificate(req.body);
    
    res.status(201).json({
      success: true,
      message: "Certificate created successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update certificate
 * PUT /api/certificates/:id
 */
export const updateCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.updateCertificate(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      message: "Certificate updated successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete certificate
 * DELETE /api/certificates/:id
 */
export const deleteCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.deleteCertificate(req.params.id);
    
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate certificate
 * POST /api/certificates/generate
 */
export const generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    const certificate = await certificateService.generateCertificate(
      studentId,
      courseId
    );

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download certificate PDF
 * GET /api/certificates/:id/download
 */
export const downloadCertificate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pdfData = await certificateService.generateCertificatePDF(id);

    res.status(200).json({
      success: true,
      message: "Certificate PDF data",
      data: pdfData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify certificate
 * GET /api/certificates/verify/:certificateId
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const result = await certificateService.verifyCertificate(certificateId);

    res.status(200).json({
      success: result.valid,
      message: result.message || "Certificate verified",
      data: result.certificate || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student certificates
 * GET /api/students/:studentId/certificates
 */
export const getStudentCertificates = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Verify user is requesting their own certificates or is admin
    if (req.user.id !== studentId && req.user.role !== "admin") {
      const error = new Error("You do not have permission to view these certificates");
      error.statusCode = 403;
      throw error;
    }

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
