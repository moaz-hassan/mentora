import db from "../../models/index.js";
import { generateCertificatePDF } from "../../utils/pdfGenerator.util.js";
import { 
  uploadToSupabase, 
  getSupabasePublicUrl, 
  isSupabaseConfigured 
} from "../../utils/supabaseStorage.util.js";

const { Certificate, User, Course, Enrollment, Chapter, Lesson, Quiz, Profile } = db;

export const validateCompletion = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    where: {
      student_id: studentId,
      course_id: courseId,
    },
  });

  if (!enrollment) {
    const error = new Error("Enrollment not found");
    error.statusCode = 404;
    throw error;
  }

  const progress = enrollment.progress || {};
  const completionPercentage = progress.completionPercentage || 0;

  return {
    isComplete: completionPercentage === 100,
    completionPercentage,
    enrollment,
  };
};


export const getCertificateByStudentAndCourse = async (studentId, courseId) => {
  return await Certificate.findOne({
    where: {
      student_id: studentId,
      course_id: courseId,
    },
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "first_name", "last_name", "email"],
      },
      {
        model: Course,
        attributes: ["id", "title", "description"],
      },
    ],
  });
};

export const generateCertificate = async (studentId, courseId) => {
  
  const { isComplete, completionPercentage } = await validateCompletion(studentId, courseId);
  
  if (!isComplete) {
    const error = new Error(`Course must be 100% complete to generate certificate. Current progress: ${completionPercentage}%`);
    error.statusCode = 400;
    error.code = "INCOMPLETE_COURSE";
    throw error;
  }

  
  const student = await User.findByPk(studentId, {
    include: [{ model: Profile, attributes: ["avatar_url"] }],
  });

  if (!student) {
    const error = new Error("Student not found");
    error.statusCode = 404;
    throw error;
  }

  
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: User,
        as: "Instructor",
        attributes: ["id", "first_name", "last_name"],
      },
      {
        model: Chapter,
        include: [{ model: Lesson }, { model: Quiz }],
      },
    ],
  });

  if (!course) {
    const error = new Error("Course not found");
    error.statusCode = 404;
    throw error;
  }

  
  const totalLessons = course.Chapters?.reduce((sum, ch) => sum + (ch.Lessons?.length || 0), 0) || 0;
  const totalQuizzes = course.Chapters?.reduce((sum, ch) => sum + (ch.Quizzes?.length || 0), 0) || 0;

  
  const studentName = `${student.first_name} ${student.last_name}`;
  const instructorName = course.Instructor 
    ? `${course.Instructor.first_name} ${course.Instructor.last_name}` 
    : "Course Instructor";
  const completionDate = new Date();
  const issuedAt = new Date();

  
  const tempCertificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  
  const pdfBuffer = await generateCertificatePDF({
    certificateId: tempCertificateId,
    studentName,
    studentEmail: student.email,
    courseTitle: course.title,
    courseDescription: course.description,
    instructorName,
    completionDate,
    issuedAt,
  });

  
  if (!isSupabaseConfigured()) {
    const error = new Error("Supabase Storage is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY.");
    error.statusCode = 500;
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  
  let uploadResult;
  try {
    const filename = `certificate-${tempCertificateId}.pdf`;
    uploadResult = await uploadToSupabase(
      pdfBuffer,
      filename,
      "application/pdf"
    );
  } catch (uploadError) {
    console.error("Supabase Storage upload error:", uploadError);
    const error = new Error("Failed to upload certificate to cloud storage");
    error.statusCode = 500;
    error.code = "UPLOAD_FAILED";
    throw error;
  }

  
  const downloadUrl = uploadResult.downloadUrl;

  
  const existingCertificate = await getCertificateByStudentAndCourse(studentId, courseId);

  let certificate;
  if (existingCertificate) {
    
    certificate = await existingCertificate.update({
      certificate_url: uploadResult.publicUrl,
      download_url: downloadUrl,
      public_id: uploadResult.filePath, 
      issued_at: issuedAt,
      completion_date: completionDate,
      metadata: {
        studentName,
        studentEmail: student.email,
        courseTitle: course.title,
        instructorName,
        totalLessons,
        totalQuizzes,
        completionPercentage: 100,
        certificateCode: tempCertificateId,
      },
    });
  } else {
    
    certificate = await Certificate.create({
      student_id: studentId,
      course_id: courseId,
      certificate_url: uploadResult.publicUrl,
      download_url: downloadUrl,
      public_id: uploadResult.filePath, 
      issued_at: issuedAt,
      completion_date: completionDate,
      verified: true,
      metadata: {
        studentName,
        studentEmail: student.email,
        courseTitle: course.title,
        instructorName,
        totalLessons,
        totalQuizzes,
        completionPercentage: 100,
        certificateCode: tempCertificateId,
      },
    });
  }

  
  return await getCertificateById(certificate.id);
};


export const getAllCertificates = async (filters = {}) => {
  const where = {};

  if (filters.student_id) where.student_id = filters.student_id;
  if (filters.course_id) where.course_id = filters.course_id;
  if (filters.verified !== undefined) where.verified = filters.verified;

  return await Certificate.findAll({
    where,
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "first_name", "last_name", "email"],
      },
      { model: Course, attributes: ["id", "title", "description", "thumbnail_url"] },
    ],
    order: [["issued_at", "DESC"]],
  });
};


export const getCertificateById = async (id) => {
  const certificate = await Certificate.findByPk(id, {
    include: [
      {
        model: User,
        as: "student",
        attributes: ["id", "first_name", "last_name", "email"],
      },
      {
        model: Course,
        attributes: ["id", "title", "description", "thumbnail_url"],
        include: [
          {
            model: User,
            as: "Instructor",
            attributes: ["id", "first_name", "last_name"],
          },
        ],
      },
    ],
  });

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    error.code = "CERTIFICATE_NOT_FOUND";
    throw error;
  }

  return certificate;
};


export const getCertificateWithAuth = async (certificateId, userId, userRole) => {
  const certificate = await getCertificateById(certificateId);

  
  if (certificate.student_id !== userId && userRole !== "admin") {
    const error = new Error("You do not have permission to access this certificate");
    error.statusCode = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  return certificate;
};


export const getStudentCertificates = async (studentId) => {
  return await getAllCertificates({ student_id: studentId });
};


export const verifyCertificate = async (id) => {
  try {
    const certificate = await getCertificateById(id);
    return {
      valid: true,
      verified: certificate.verified,
      certificate,
    };
  } catch (error) {
    return {
      valid: false,
      verified: false,
      certificate: null,
    };
  }
};


export const getCertificateDownloadUrl = async (certificateId, userId, userRole) => {
  const certificate = await getCertificateWithAuth(certificateId, userId, userRole);
  
  
  return certificate.download_url || certificate.certificate_url;
};



