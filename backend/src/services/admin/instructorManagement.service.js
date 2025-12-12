
import models from "../../models/index.js";
import { Op, fn, col, literal } from "sequelize";

const { User, Course, Enrollment, Payment, Ratings } = models;


export const getAllInstructors = async (filters = {}) => {
  const whereClause = { role: "instructor" };
  
  if (filters.status) {
    whereClause.is_active = filters.status === "active";
  }
  
  if (filters.search) {
    whereClause[Op.or] = [
      { first_name: { [Op.like]: `%${filters.search}%` } },
      { last_name: { [Op.like]: `%${filters.search}%` } },
      { email: { [Op.like]: `%${filters.search}%` } }
    ];
  }

  const instructors = await User.findAll({
    where: whereClause,
    attributes: ["id", "first_name", "last_name", "email", "is_active", "createdAt"],
    order: [["createdAt", "DESC"]]
  });

  
  const instructorsWithMetrics = await Promise.all(
    instructors.map(async (instructor) => {
      const metrics = await getInstructorMetrics(instructor.id);
      return {
        id: instructor.id,
        name: `${instructor.first_name} ${instructor.last_name}`,
        email: instructor.email,
        isActive: instructor.is_active,
        joinedAt: instructor.createdAt,
        ...metrics
      };
    })
  );

  return instructorsWithMetrics;
};


export const getInstructorMetrics = async (instructorId) => {
  
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"]
  });

  const courseIds = courses.map(c => c.id);
  const courseCount = courses.length;

  
  const totalStudents = await Enrollment.count({
    where: { course_id: courseIds },
    distinct: true,
    col: "student_id"
  });

  
  const totalRevenue = await Payment.sum("amount", {
    where: {
      course_id: courseIds,
      status: "completed"
    }
  });

  
  const commissionRate = 0.20;
  const earnings = (totalRevenue || 0) * (1 - commissionRate);

  // Average rating from Ratings model - only query if courses exist
  let avgRating = null;
  if (courseIds.length > 0) {
    const ratingResult = await Ratings.findOne({
      where: { course_id: courseIds },
      attributes: [
        [fn("AVG", col("rating")), "avgRating"]
      ],
      raw: true
    });

    avgRating = ratingResult?.avgRating 
      ? parseFloat(ratingResult.avgRating).toFixed(1)
      : null;
  }

  return {
    courseCount,
    totalStudents,
    totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
    earnings: parseFloat(earnings).toFixed(2),
    avgRating: avgRating ? parseFloat(avgRating) : null
  };
};


export const getInstructorDetails = async (instructorId) => {
  const instructor = await User.findByPk(instructorId, {
    attributes: ["id", "first_name", "last_name", "email", "is_active", "createdAt"]
  });

  if (!instructor || instructor.role !== "instructor") {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id", "title", "status", "price", "createdAt"],
    include: [{
      model: Enrollment,
      attributes: []
    }],
    group: ["Course.id"]
  });

  
  const metrics = await getInstructorMetrics(instructorId);

  
  const performance = await getInstructorPerformance(instructorId);

  return {
    id: instructor.id,
    name: `${instructor.first_name} ${instructor.last_name}`,
    email: instructor.email,
    isActive: instructor.is_active,
    joinedAt: instructor.createdAt,
    courses: courses.map(course => ({
      id: course.id,
      title: course.title,
      status: course.status,
      price: course.price,
      createdAt: course.createdAt
    })),
    metrics,
    performance
  };
};


export const getInstructorPerformance = async (instructorId) => {
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"]
  });

  const courseIds = courses.map(c => c.id);

  
  const enrollments = await Enrollment.findAll({
    where: { course_id: courseIds },
    attributes: ["id", "progress", "enrolled_at"]
  });

  
  let completedCount = 0;
  let totalProgress = 0;

  enrollments.forEach(enrollment => {
    const progress = enrollment.progress || {};
    const completionPercentage = progress.completionPercentage || 0;
    totalProgress += completionPercentage;
    if (completionPercentage === 100) completedCount++;
  });

  const completionRate = enrollments.length > 0
    ? ((completedCount / enrollments.length) * 100).toFixed(1)
    : 0;

  const avgProgress = enrollments.length > 0
    ? (totalProgress / enrollments.length).toFixed(1)
    : 0;

  // Reviews from Ratings model
  const reviews = courseIds.length > 0 ? await Ratings.findAll({
    where: { course_id: courseIds },
    attributes: ["rating"]
  }) : [];

  const satisfactionScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentEnrollments = await Enrollment.count({
    where: {
      course_id: courseIds,
      enrolled_at: { [Op.gte]: thirtyDaysAgo }
    }
  });

  return {
    completionRate: parseFloat(completionRate),
    avgProgress: parseFloat(avgProgress),
    satisfactionScore: satisfactionScore ? parseFloat(satisfactionScore) : null,
    recentEnrollments,
    totalEnrollments: enrollments.length,
    reviewCount: reviews.length
  };
};


export const updateInstructorStatus = async (instructorId, isActive) => {
  const instructor = await User.findByPk(instructorId);

  if (!instructor || instructor.role !== "instructor") {
    const error = new Error("Instructor not found");
    error.statusCode = 404;
    throw error;
  }

  instructor.is_active = isActive;
  await instructor.save();

  
  if (!isActive) {
    await Course.update(
      { is_published: false },
      { where: { instructor_id: instructorId } }
    );
  }

  return instructor;
};


export const getInstructorPayoutHistory = async (instructorId) => {
  const courses = await Course.findAll({
    where: { instructor_id: instructorId },
    attributes: ["id"]
  });

  const courseIds = courses.map(c => c.id);

  const payments = await Payment.findAll({
    where: {
      course_id: courseIds,
      status: "completed"
    },
    include: [{
      model: Course,
      attributes: ["title"]
    }],
    order: [["created_at", "DESC"]]
  });

  const commissionRate = 0.20;

  return payments.map(payment => ({
    id: payment.id,
    amount: parseFloat(payment.amount).toFixed(2),
    instructorEarning: parseFloat(payment.amount * (1 - commissionRate)).toFixed(2),
    courseTitle: payment.Course.title,
    date: payment.created_at,
    status: "pending" 
  }));
};
